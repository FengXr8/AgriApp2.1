import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { DialogMessage } from '../../../domain/types';
import { chatService } from '../../../domain/services';

interface Message {
  id: string;
  text?: string;
  isUser: boolean;
  type?: 'text' | 'typing';
  structuredContent?: {
    title: string;
    points: string[];
    details?: string;
  };
}

const recommendedQuestions = [
  '水稻叶子发黄怎么办？',
  '今天适合施肥吗？',
  '如何防治稻瘟病？',
  '番茄病虫害识别',
];

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const loadDefaultMessages = async () => {
      const defaultMsgs = await chatService.getDefaultMessages();
      // 去重：防止后端返回重复 id
      const seen = new Set<string>();
      const uniqueMsgs = defaultMsgs.filter(msg => {
        if (seen.has(msg.id)) return false;
        seen.add(msg.id);
        return true;
      });
      const convertedMessages: Message[] = uniqueMsgs.map(msg => ({
        id: msg.id,
        text: msg.content,
        isUser: msg.sender === 'user',
        type: msg.type as 'text' | 'typing',
        structuredContent: msg.structuredContent,
      }));
      setMessages(convertedMessages);
    };
    loadDefaultMessages();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageToSend = text || inputText;
    if (!messageToSend.trim()) return;

    // 使用唯一前缀，避免与后端 id 冲突
    const localUserMessageId = `local_user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const userMessage: Message = {
      id: localUserMessageId,
      text: messageToSend.trim(),
      isUser: true,
      type: 'text',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // 使用唯一前缀，避免与后端 id 冲突
    const typingMessageId = `local_typing_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const typingMessage: Message = {
      id: typingMessageId,
      isUser: false,
      type: 'typing',
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      const [userMsg, aiMsg] = await chatService.sendMessage('dialog_001', {
        content: messageToSend.trim(),
        type: 'text',
      });

      const aiMessage: Message = {
        id: aiMsg.id,
        isUser: aiMsg.sender === 'user',
        type: 'text',
        text: aiMsg.content,
        structuredContent: aiMsg.structuredContent,
      };

      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== typingMessageId);
        return [...filtered, aiMessage];
      });
    } catch (error) {
      console.error('Send message failed:', error);
      setMessages((prev) => prev.filter((msg) => msg.id !== typingMessageId));
    }
  };

  const handleRecommendedQuestion = (question: string) => {
    setInputText(question);
    handleSend(question);
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>智能对话</Text>
      </View>

      <ScrollView ref={scrollRef} style={styles.messageList}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
            ]}
          >
            {message.type === 'typing' ? (
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.typingText}>AI正在思考...</Text>
              </View>
            ) : (
              <View
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userBubble : styles.aiBubble,
                ]}
              >
                {message.structuredContent ? (
                  <View style={styles.structuredContent}>
                    {message.structuredContent.title ? (
                      <Text style={styles.structuredTitle}>{message.structuredContent.title}</Text>
                    ) : null}
                    <View style={styles.pointsContainer}>
                      {(message.structuredContent.points ?? []).map((point, index) => (
                        <View key={index} style={styles.pointItem}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.pointText}>{point}</Text>
                        </View>
                      ))}
                    </View>
                    {message.structuredContent.details ? (
                      <Text style={styles.detailsText}>{message.structuredContent.details}</Text>
                    ) : null}
                  </View>
                ) : (
                  <Text style={[styles.messageText, message.isUser ? styles.userText : styles.aiText]}>
                    {message.text}
                  </Text>
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.recommendedQuestionsContainer}>
        <Text style={styles.recommendedTitle}>推荐问题</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendedScroll}>
          {recommendedQuestions.map((question, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recommendedButton}
              onPress={() => handleRecommendedQuestion(question)}
            >
              <Text style={styles.recommendedButtonText}>{question}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={() => Alert.alert('提示', '语音识别功能开发中')}>
          <Ionicons name="mic-outline" size={22} color="#666" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="请输入您的问题..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSend()}
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.iconButton} onPress={() => Alert.alert('提示', '图片上传功能开发中')}>
          <Ionicons name="camera-outline" size={22} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={() => handleSend()}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  messageList: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  aiMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#333',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderBottomLeftRadius: 4,
    gap: 8,
  },
  typingText: {
    fontSize: 14,
    color: '#666',
  },
  structuredContent: {
    gap: 10,
  },
  structuredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  pointsContainer: {
    gap: 6,
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 2,
  },
  pointText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    flex: 1,
  },
  detailsText: {
    fontSize: 13,
    color: '#777',
    lineHeight: 18,
    marginTop: 4,
    fontStyle: 'italic',
  },
  recommendedQuestionsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  recommendedTitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  recommendedScroll: {
    flexDirection: 'row',
  },
  recommendedButton: {
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  recommendedButtonText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    padding: 10,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
});