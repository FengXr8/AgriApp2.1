import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import type { ChatContext, ChatImageAsset, DialogMessage, SendMessageParams } from '../../../domain/types';
import { chatService, ChatServiceError } from '../../../domain/services/chat.service';

type SendingState = 'idle' | 'sending' | 'error';

interface LocalMessage {
  id: string;
  text: string;
  isUser: boolean;
  status?: SendingState;
  structuredContent?: DialogMessage['structuredContent'];
  errorCode?: string;
  retryPayload?: SendMessageParams;
}

const recommendedQuestions = [
  '番茄叶片出现褐色斑点怎么办？',
  '水稻叶片发黄需要补充哪些信息？',
  '图片不清楚时还能判断吗？',
  '病害扩散很快该怎么处理？',
];

const partLabels: Record<string, string> = {
  leaf: '叶',
  stem: '茎',
  root: '根',
  fruit: '果',
  flower: '花',
  whole: '整株',
};

const spreadLabels: Record<string, string> = {
  unknown: '不清楚',
  stable: '稳定',
  slow: '缓慢',
  fast: '快速',
};

export default function AIChatScreen() {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [contextOpen, setContextOpen] = useState(false);
  const [context, setContext] = useState<ChatContext>({ spread: 'unknown' });
  const [images, setImages] = useState<ChatImageAsset[]>([]);
  const [sendState, setSendState] = useState<SendingState>('idle');
  const scrollRef = useRef<ScrollView>(null);

  const safetyNotice = useMemo(
    () => 'AI 建议仅用于初步排查，不能替代现场诊断。涉及农药时，请以登记产品标签和当地农技人员指导为准。',
    [],
  );

  useEffect(() => {
    const loadDefaultMessages = async () => {
      try {
        const defaultMsgs = await chatService.getDefaultMessages();
        setMessages(defaultMsgs.map(toLocalMessage));
      } catch (error) {
        setMessages([
          {
            id: `local_error_${Date.now()}`,
            isUser: false,
            text: '历史消息加载失败，请检查后端服务后重试。',
            status: 'error',
            errorCode: getErrorCode(error),
          },
        ]);
      }
    };
    loadDefaultMessages();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async (text?: string, retryPayload?: SendMessageParams) => {
    const content = retryPayload?.content ?? (text || inputText).trim();
    if (!content || sendState === 'sending') return;

    const payload: SendMessageParams =
      retryPayload ?? {
        content,
        type: 'text',
        clientRequestId: `mobile_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        context: compactContext(context),
        images,
      };

    const localUserId = `local_user_${payload.clientRequestId}`;
    if (!retryPayload) {
      setMessages((prev) => [
        ...prev,
        { id: localUserId, text: content, isUser: true },
        { id: `local_typing_${payload.clientRequestId}`, text: '正在分析症状...', isUser: false, status: 'sending' },
      ]);
      setInputText('');
    } else {
      setMessages((prev) => [
        ...prev.filter((message) => message.id !== `local_error_${payload.clientRequestId}`),
        { id: `local_typing_${payload.clientRequestId}`, text: '正在重新分析...', isUser: false, status: 'sending' },
      ]);
    }

    setSendState('sending');
    try {
      const aiMsg = await chatService.sendMessage('dialog_001', payload);
      setMessages((prev) => [
        ...prev.filter((message) => message.id !== `local_typing_${payload.clientRequestId}`),
        toLocalMessage(aiMsg),
      ]);
      if (!retryPayload) {
        setImages([]);
      }
      setSendState('idle');
    } catch (error) {
      const errorCode = getErrorCode(error);
      setMessages((prev) => [
        ...prev.filter((message) => message.id !== `local_typing_${payload.clientRequestId}`),
        {
          id: `local_error_${payload.clientRequestId}`,
          text: errorText(errorCode),
          isUser: false,
          status: 'error',
          errorCode,
          retryPayload: payload,
        },
      ]);
      setSendState('error');
    }
  };

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('无法访问相册', '请在系统设置中允许访问相册后再选择图片。');
      return;
    }
    const remaining = Math.max(0, 3 - images.length);
    if (remaining === 0) {
      Alert.alert('最多 3 张', '一次咨询最多选择 3 张图片。');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.85,
      base64: false,
    });
    if (!result.canceled) {
      appendImages(result.assets);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('无法使用相机', '请在系统设置中允许使用相机后再拍照。');
      return;
    }
    if (images.length >= 3) {
      Alert.alert('最多 3 张', '一次咨询最多选择 3 张图片。');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      base64: false,
    });
    if (!result.canceled) {
      appendImages(result.assets);
    }
  };

  const appendImages = (assets: ImagePicker.ImagePickerAsset[]) => {
    const mapped = assets.map((asset) => ({
      uri: asset.uri,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
      fileSize: asset.fileSize,
      width: asset.width,
      height: asset.height,
    }));
    setImages((prev) => [...prev, ...mapped].slice(0, 3));
  };

  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((image) => image.uri !== uri));
  };

  const fillQuestion = (question: string) => {
    setInputText(question);
    handleSend(question);
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>智慧 AI 问答</Text>
        <Text style={styles.headerSubtitle}>农业病虫害辅助诊断</Text>
      </View>

      <ScrollView ref={scrollRef} style={styles.messageList} contentContainerStyle={styles.messageContent}>
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onRetry={message.retryPayload ? () => handleSend(undefined, message.retryPayload) : undefined}
            onQuestionPress={(question) => setInputText(question)}
          />
        ))}
      </ScrollView>

      <View style={styles.contextPanel}>
        <TouchableOpacity style={styles.contextToggle} onPress={() => setContextOpen((value) => !value)}>
          <Ionicons name={contextOpen ? 'chevron-down' : 'chevron-forward'} size={18} color="#2f6b4f" />
          <Text style={styles.contextTitle}>补充症状</Text>
        </TouchableOpacity>
        {contextOpen ? (
          <View style={styles.contextFields}>
            <TextInput
              style={styles.contextInput}
              placeholder="作物名称"
              value={context.cropName || ''}
              onChangeText={(cropName) => setContext((prev) => ({ ...prev, cropName }))}
            />
            <TextInput
              style={styles.contextInput}
              placeholder="生长阶段"
              value={context.growthStage || ''}
              onChangeText={(growthStage) => setContext((prev) => ({ ...prev, growthStage }))}
            />
            <SegmentedOptions
              value={context.affectedPart || ''}
              options={partLabels}
              onChange={(affectedPart) => setContext((prev) => ({ ...prev, affectedPart: affectedPart as ChatContext['affectedPart'] }))}
            />
            <SegmentedOptions
              value={context.spread || 'unknown'}
              options={spreadLabels}
              onChange={(spread) => setContext((prev) => ({ ...prev, spread: spread as ChatContext['spread'] }))}
            />
            <TextInput
              style={[styles.contextInput, styles.multilineInput]}
              placeholder="症状、出现时间、近期天气"
              value={context.symptomDescription || ''}
              onChangeText={(symptomDescription) => setContext((prev) => ({ ...prev, symptomDescription }))}
              multiline
            />
          </View>
        ) : null}
      </View>

      {images.length ? (
        <View style={styles.imageTray}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((image) => (
              <View key={image.uri} style={styles.imagePreview}>
                <Image source={{ uri: image.uri }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(image.uri)}>
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <Text style={styles.captureGuide}>建议拍整株、受害部位近照、叶片背面。保持清晰自然光。</Text>
        </View>
      ) : null}

      <View style={styles.recommendedQuestionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recommendedQuestions.map((question) => (
            <TouchableOpacity key={question} style={styles.recommendedButton} onPress={() => fillQuestion(question)}>
              <Text style={styles.recommendedButtonText}>{question}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={takePhoto} disabled={sendState === 'sending'}>
          <Ionicons name="camera-outline" size={21} color="#2f6b4f" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={pickImages} disabled={sendState === 'sending'}>
          <Ionicons name="images-outline" size={21} color="#2f6b4f" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="描述作物、症状和发生情况"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSend()}
          editable={sendState !== 'sending'}
          placeholderTextColor="#7b8b82"
        />
        <TouchableOpacity
          style={[styles.sendButton, sendState === 'sending' ? styles.disabledButton : null]}
          onPress={() => handleSend()}
          disabled={sendState === 'sending'}
        >
          {sendState === 'sending' ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={19} color="#fff" />}
        </TouchableOpacity>
      </View>

      <View style={styles.safetyNotice}>
        <Ionicons name="shield-checkmark-outline" size={16} color="#5f6f66" />
        <Text style={styles.safetyText}>{safetyNotice}</Text>
      </View>
    </View>
  );
}

function MessageBubble({
  message,
  onRetry,
  onQuestionPress,
}: {
  message: LocalMessage;
  onRetry?: () => void;
  onQuestionPress: (question: string) => void;
}) {
  if (message.status === 'sending') {
    return (
      <View style={[styles.messageContainer, styles.aiMessageContainer]}>
        <View style={styles.typingBubble}>
          <ActivityIndicator size="small" color="#2f6b4f" />
          <Text style={styles.typingText}>{message.text}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.messageContainer, message.isUser ? styles.userMessageContainer : styles.aiMessageContainer]}>
      <View style={[styles.messageBubble, message.isUser ? styles.userBubble : styles.aiBubble, message.status === 'error' ? styles.errorBubble : null]}>
        {message.structuredContent ? (
          <StructuredAnswer content={message.structuredContent} onQuestionPress={onQuestionPress} />
        ) : (
          <Text style={[styles.messageText, message.isUser ? styles.userText : styles.aiText]}>{message.text}</Text>
        )}
        {message.status === 'error' && onRetry ? (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Ionicons name="refresh" size={15} color="#b3261e" />
            <Text style={styles.retryText}>重新发送</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

function StructuredAnswer({ content, onQuestionPress }: { content: NonNullable<DialogMessage['structuredContent']>; onQuestionPress: (question: string) => void }) {
  return (
    <View style={styles.structuredContent}>
      <Text style={styles.answerKind}>{answerKindLabel(content.answerKind)}</Text>
      <Text style={styles.structuredSummary}>{content.summary}</Text>
      <Text style={styles.metaText}>信息充分度：{evidenceLabel(content.evidenceSufficiency)}</Text>

      {content.followUpQuestions?.length ? (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>还需要补充</Text>
          {content.followUpQuestions.map((question) => (
            <TouchableOpacity key={question} style={styles.questionButton} onPress={() => onQuestionPress(question)}>
              <Text style={styles.questionText}>{question}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {content.imageQuality?.level === 'poor' ? (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>图片质量问题</Text>
          {content.imageQuality.issues.map((issue) => (
            <Bullet key={issue} text={issue} />
          ))}
          {content.imageQuality.retakeSuggestions.map((suggestion) => (
            <Bullet key={suggestion} text={suggestion} />
          ))}
        </View>
      ) : null}

      {content.candidates?.length ? (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>可能原因</Text>
          {content.candidates.map((candidate) => (
            <View key={candidate.name} style={styles.candidateBlock}>
              <Text style={styles.candidateName}>{candidate.name}</Text>
              <Text style={styles.metaText}>支持程度：{supportLabel(candidate.supportLevel)}</Text>
              {candidate.supportingEvidence.map((item) => (
                <Bullet key={`support-${item}`} text={item} />
              ))}
              {candidate.contradictingEvidence.map((item) => (
                <Bullet key={`conflict-${item}`} text={`待确认：${item}`} muted />
              ))}
              {candidate.confirmNext.map((item) => (
                <Bullet key={`next-${item}`} text={item} muted />
              ))}
            </View>
          ))}
        </View>
      ) : null}

      {content.actionsNow?.length ? (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>可以先做</Text>
          {content.actionsNow.map((item) => (
            <Bullet key={item} text={item} />
          ))}
        </View>
      ) : null}

      {content.avoidActions?.length ? (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>避免操作</Text>
          {content.avoidActions.map((item) => (
            <Bullet key={item} text={item} muted />
          ))}
        </View>
      ) : null}

      {content.seekExpert?.required ? <Text style={styles.escalationText}>{content.seekExpert.reason || '建议联系当地农技人员。'}</Text> : null}
      <Text style={styles.noticeText}>{content.safetyNotice}</Text>
    </View>
  );
}

function Bullet({ text, muted }: { text: string; muted?: boolean }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={[styles.bulletDot, muted ? styles.mutedText : null]}>•</Text>
      <Text style={[styles.bulletText, muted ? styles.mutedText : null]}>{text}</Text>
    </View>
  );
}

function SegmentedOptions({ value, options, onChange }: { value: string; options: Record<string, string>; onChange: (value: string) => void }) {
  return (
    <View style={styles.segmentedRow}>
      {Object.entries(options).map(([key, label]) => (
        <TouchableOpacity key={key} style={[styles.segment, value === key ? styles.segmentActive : null]} onPress={() => onChange(key)}>
          <Text style={[styles.segmentText, value === key ? styles.segmentTextActive : null]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function toLocalMessage(message: DialogMessage): LocalMessage {
  return {
    id: message.id,
    text: message.content,
    isUser: message.sender === 'user',
    structuredContent: message.structuredContent,
  };
}

function compactContext(context: ChatContext): ChatContext {
  return Object.fromEntries(Object.entries(context).filter(([, value]) => value !== undefined && value !== '')) as ChatContext;
}

function getErrorCode(error: unknown) {
  return error instanceof ChatServiceError ? error.errorCode : 'CHAT_REQUEST_FAILED';
}

function errorText(errorCode: string) {
  if (errorCode === 'AI_VISION_NOT_SUPPORTED') {
    return '当前后端模型未启用图片诊断。可以先移除图片，用文字描述症状继续咨询。';
  }
  if (errorCode === 'AI_IMAGE_TOO_LARGE') {
    return '图片过大，请压缩或减少图片后重试。';
  }
  if (errorCode === 'CHAT_DIALOG_NOT_FOUND') {
    return '当前对话不存在，请新建对话后重试。';
  }
  return 'AI 问答请求失败，请稍后重试。';
}

function answerKindLabel(kind: string) {
  const labels: Record<string, string> = {
    CLARIFICATION: '还需要补充',
    IMAGE_RETAKE: '需要重拍',
    DIFFERENTIAL_DIAGNOSIS: '初步辅助判断',
    GENERAL_ADVICE: '一般建议',
    SAFETY_ESCALATION: '建议人工处理',
    OUT_OF_SCOPE: '不在范围内',
  };
  return labels[kind] || 'AI 建议';
}

function evidenceLabel(value: string) {
  const labels: Record<string, string> = {
    insufficient: '不足',
    partial: '部分充分',
    sufficient: '较充分',
  };
  return labels[value] || '不足';
}

function supportLabel(value: string) {
  const labels: Record<string, string> = {
    weak: '较弱',
    moderate: '中等',
    strong: '较强',
  };
  return labels[value] || '较弱';
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#eef3ee',
  },
  header: {
    backgroundColor: '#2f6b4f',
    paddingHorizontal: 18,
    paddingTop: 40,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#d8eadf',
  },
  messageList: {
    flex: 1,
  },
  messageContent: {
    padding: 14,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '88%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  aiMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 8,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#2f6b4f',
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d9e4dc',
  },
  errorBubble: {
    borderColor: '#f0b8b2',
    backgroundColor: '#fff7f6',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#23352b',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d9e4dc',
  },
  typingText: {
    fontSize: 14,
    color: '#4f6256',
  },
  structuredContent: {
    gap: 8,
  },
  answerKind: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2f6b4f',
  },
  structuredSummary: {
    fontSize: 15,
    lineHeight: 22,
    color: '#23352b',
    fontWeight: '600',
  },
  metaText: {
    fontSize: 12,
    color: '#66776d',
  },
  sectionBlock: {
    gap: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#edf2ee',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#23352b',
  },
  candidateBlock: {
    gap: 5,
    paddingVertical: 6,
  },
  candidateName: {
    fontSize: 14,
    color: '#23352b',
    fontWeight: '700',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bulletDot: {
    color: '#2f6b4f',
    fontSize: 14,
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#34483b',
  },
  mutedText: {
    color: '#6d7d73',
  },
  questionButton: {
    borderWidth: 1,
    borderColor: '#cfe0d5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f6faf7',
  },
  questionText: {
    fontSize: 13,
    color: '#2f6b4f',
  },
  escalationText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#8a4b00',
    fontWeight: '600',
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#68786d',
  },
  retryButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  retryText: {
    color: '#b3261e',
    fontSize: 13,
    fontWeight: '700',
  },
  contextPanel: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#d9e4dc',
  },
  contextToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  contextTitle: {
    color: '#2f6b4f',
    fontWeight: '700',
  },
  contextFields: {
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  contextInput: {
    minHeight: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d9e4dc',
    paddingHorizontal: 10,
    color: '#23352b',
    backgroundColor: '#f8fbf8',
  },
  multilineInput: {
    minHeight: 64,
    textAlignVertical: 'top',
    paddingTop: 9,
  },
  segmentedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  segment: {
    minHeight: 32,
    minWidth: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d9e4dc',
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  segmentActive: {
    backgroundColor: '#2f6b4f',
    borderColor: '#2f6b4f',
  },
  segmentText: {
    fontSize: 12,
    color: '#4f6256',
  },
  segmentTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  imageTray: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#d9e4dc',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
  },
  imagePreview: {
    width: 68,
    height: 68,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 8,
    backgroundColor: '#d9e4dc',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  captureGuide: {
    marginTop: 7,
    fontSize: 12,
    color: '#66776d',
  },
  recommendedQuestionsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: '#d9e4dc',
  },
  recommendedButton: {
    borderWidth: 1,
    borderColor: '#cfe0d5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#f8fbf8',
  },
  recommendedButtonText: {
    fontSize: 13,
    color: '#2f6b4f',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#d9e4dc',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#eef6f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    backgroundColor: '#f4f7f5',
    paddingHorizontal: 12,
    color: '#23352b',
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#2f6b4f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.65,
  },
  safetyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8fbf8',
  },
  safetyText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#5f6f66',
  },
});
