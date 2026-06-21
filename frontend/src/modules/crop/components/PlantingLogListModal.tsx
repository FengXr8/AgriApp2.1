import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import type { PlantingLog } from '../../../domain/types/planting-log.types';

interface Props {
  visible: boolean;
  cropName: string;
  logs: PlantingLog[];
  onClose: () => void;
}

// logType 中文映射
const LOG_TYPE_LABELS: Record<string, string> = {
  growth: '生长观察',
  farming: '农事操作',
  disease: '病虫害',
  weather: '天气记录',
};

// logType 样式辅助函数
const getLogTypeBadgeStyle = (logType: string) => {
  switch (logType) {
    case 'growth':
      return { backgroundColor: '#E8F5E9' };
    case 'farming':
      return { backgroundColor: '#E3F2FD' };
    case 'disease':
      return { backgroundColor: '#FFEBEE' };
    case 'weather':
      return { backgroundColor: '#FFF3E0' };
    default:
      return { backgroundColor: '#f5f5f5' };
  }
};

const getLogTypeTextStyle = (logType: string) => {
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

export default function PlantingLogListModal({ visible, cropName, logs, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>{cropName}</Text>
              <Text style={styles.subtitle}>种植记录</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {logs.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyText}>暂无种植记录</Text>
              </View>
            ) : (
              logs.map((log) => (
                <View key={log.id} style={styles.logCard}>
                  <View style={styles.logHeader}>
                    <Text style={styles.logDate}>{log.recordDate}</Text>
                    <View style={[styles.logTypeBadge, getLogTypeBadgeStyle(log.logType)]}>
                      <Text style={[styles.logTypeText, getLogTypeTextStyle(log.logType)]}>
                        {LOG_TYPE_LABELS[log.logType] || log.logType}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.logContent}>{log.content}</Text>
                  {log.images && log.images.length > 0 && (
                    <View style={styles.imagesInfo}>
                      <Text style={styles.imagesIcon}>📷</Text>
                      <Text style={styles.imagesCount}>{log.images.length} 张图片</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.addButtonDisabled} disabled>
              <Text style={styles.addButtonDisabledText}>+ 新增记录（待接入）</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
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
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  close: {
    fontSize: 24,
    color: '#999',
    padding: 4,
  },
  body: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  logCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  logTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  logTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  logContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  imagesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  imagesIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  imagesCount: {
    fontSize: 12,
    color: '#999',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addButtonDisabled: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  addButtonDisabledText: {
    fontSize: 16,
    color: '#999',
  },
});