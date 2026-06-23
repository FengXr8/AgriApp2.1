import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import type { LogType } from '../../../domain/types/planting-log.types';
import CalendarDatePicker from './CalendarDatePicker';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { logType: LogType; recordDate: string; content: string }) => Promise<void>;
}

const LOG_TYPE_OPTIONS: { value: LogType; label: string }[] = [
  { value: 'growth', label: '生长观察' },
  { value: 'farming', label: '农事操作' },
  { value: 'disease', label: '病虫害' },
  { value: 'weather', label: '天气记录' },
];

const getLogTypeBadgeStyle = (logType: LogType) => {
  switch (logType) {
    case 'growth':
      return { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' };
    case 'farming':
      return { backgroundColor: '#E3F2FD', borderColor: '#2196F3' };
    case 'disease':
      return { backgroundColor: '#FFEBEE', borderColor: '#EF5350' };
    case 'weather':
      return { backgroundColor: '#FFF3E0', borderColor: '#FF9800' };
    default:
      return { backgroundColor: '#f5f5f5', borderColor: '#ddd' };
  }
};

const getLogTypeTextStyle = (logType: LogType) => {
  switch (logType) {
    case 'growth':
      return { color: '#2E7D32' };
    case 'farming':
      return { color: '#1565C0' };
    case 'disease':
      return { color: '#C62828' };
    case 'weather':
      return { color: '#EF6C00' };
    default:
      return { color: '#666' };
  }
};

export default function PlantingLogFormModal({ visible, onClose, onSubmit }: Props) {
  const [logType, setLogType] = useState<LogType>('growth');
  const [recordDate, setRecordDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [content, setContent] = useState('');

  const handleReset = () => {
    setLogType('growth');
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setRecordDate(`${year}-${month}-${day}`);
    setContent('');
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('提示', '请填写记录内容');
      return;
    }
    try {
      await onSubmit({ logType, recordDate, content });
      handleReset();
      onClose();
    } catch (error) {
      // 不关闭弹窗，让 CropScreen 负责提示错误
    }
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            <View style={styles.header}>
            <Text style={styles.title}>记一笔农事</Text>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <CalendarDatePicker
            value={recordDate}
            onChange={setRecordDate}
            compact
          />

          <ScrollView
            style={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
              <View style={styles.formGroup}>
                <Text style={styles.label}>记录类型</Text>
                <View style={styles.typeGrid}>
                  {LOG_TYPE_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.typeButton,
                        getLogTypeBadgeStyle(option.value),
                        logType === option.value && { borderWidth: 2 },
                      ]}
                      onPress={() => setLogType(option.value)}
                    >
                      <Text style={[styles.typeButtonText, getLogTypeTextStyle(option.value)]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>记录内容</Text>
                <TextInput
                  style={styles.textarea}
                  value={content}
                  onChangeText={setContent}
                  placeholder="记录今天的浇水、施肥、病虫害或生长情况..."
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '82%',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  close: {
    fontSize: 24,
    color: '#999',
    padding: 4,
  },
  body: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  textarea: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#333',
    minHeight: 160,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});