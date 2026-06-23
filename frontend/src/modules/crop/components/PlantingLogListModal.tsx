import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import type { PlantingLog } from '../../../domain/types/planting-log.types';

interface Props {
  visible: boolean;
  cropName: string;
  logs: PlantingLog[];
  onClose: () => void;
  onAddLog: () => void;
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

export default function PlantingLogListModal({ visible, cropName, logs, onClose, onAddLog }: Props) {
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
              <Text style={styles.subtitle}>农事记录</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.addButton} onPress={onAddLog}>
                <Text style={styles.addButtonText}>+ 记录</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.body}>
            {logs.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>暂无农事记录</Text>
                <Text style={styles.emptySubtitle}>记录作物生长、浇水、施肥和病虫害情况</Text>
                <TouchableOpacity style={styles.emptyAddButton} onPress={onAddLog}>
                  <Text style={styles.emptyAddButtonText}>+ 记一笔农事</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.timeline}>
                {logs.map((log) => (
                  <TouchableOpacity key={log.id} style={styles.timelineItem} activeOpacity={0.8}>
                    <View style={styles.timelineLine}>
                      <View style={styles.timelineDot} />
                    </View>
                    <View style={styles.timelineContent}>
                      <View style={styles.timelineHeader}>
                        <Text style={styles.timelineDate}>{log.recordDate}</Text>
                        <View style={[styles.timelineTypeBadge, getLogTypeBadgeStyle(log.logType)]}>
                          <Text style={[styles.timelineTypeText, getLogTypeTextStyle(log.logType)]}>
                            {LOG_TYPE_LABELS[log.logType] || log.logType}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.timelineContentText} numberOfLines={2}>
                        {log.content}
                      </Text>
                    </View>
                    <Text style={styles.timelineArrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  addButtonText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
  },
  body: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyAddButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  emptyAddButtonText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  timelineLine: {
    width: 24,
    alignItems: 'center',
    paddingTop: 2,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  timelineTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timelineTypeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  timelineContentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  timelineArrow: {
    fontSize: 20,
    color: '#ddd',
    paddingRight: 8,
  },
});