import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { cropService, plantingLogService } from '../../../domain/services';
import type { Crop, PlantingLog } from '../../../domain/types';
import type { LogType } from '../../../domain/types/planting-log.types';
import PlantingLogListModal from '../../crop/components/PlantingLogListModal';
import PlantingLogFormModal from '../../crop/components/PlantingLogFormModal';

export default function PlantingLogScreen() {
  const navigation = useNavigation();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [logs, setLogs] = useState<PlantingLog[]>([]);
  const [logListModalVisible, setLogListModalVisible] = useState(false);
  const [plantingLogFormVisible, setPlantingLogFormVisible] = useState(false);
  const [editingLog, setEditingLog] = useState<PlantingLog | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCrops = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cropService.getCrops();
      setCrops(data);
      if (data.length > 0 && !selectedCrop) {
        setSelectedCrop(data[0]);
      }
    } catch (error) {
      console.error('[PlantingLogScreen] Failed to fetch crops:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshLogs = useCallback(async () => {
    if (!selectedCrop) return;
    try {
      const data = await plantingLogService.getLogsByCrop(selectedCrop.id);
      setLogs(data);
    } catch (error) {
      console.error('[PlantingLogScreen] Failed to refresh logs:', error);
    }
  }, [selectedCrop]);

  useEffect(() => {
    fetchCrops();
  }, []);

  useEffect(() => {
    refreshLogs();
  }, [selectedCrop, refreshLogs]);

  const handleSelectCrop = (crop: Crop) => {
    setSelectedCrop(crop);
    setEditingLog(null);
  };

  const handleAddLog = () => {
    setEditingLog(null);
    setPlantingLogFormVisible(true);
  };

  const handleEditLog = (log: PlantingLog) => {
    setEditingLog(log);
    setPlantingLogFormVisible(true);
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      await plantingLogService.deleteLog(logId);
      await refreshLogs();
    } catch (error) {
      Alert.alert('删除失败', '无法删除该农事记录');
    }
  };

  const handleSubmitLog = async (data: { logType: LogType; recordDate: string; content: string }) => {
    if (!selectedCrop) return;

    try {
      if (editingLog) {
        await plantingLogService.updateLog(editingLog.id, { ...data, images: editingLog.images || [] });
      } else {
        await plantingLogService.addLog({
          cropId: selectedCrop.id,
          cropName: selectedCrop.name,
          ...data,
          images: [],
        });
      }
      await refreshLogs();
      setPlantingLogFormVisible(false);
      setEditingLog(null);
    } catch (error) {
      Alert.alert('操作失败', editingLog ? '无法更新农事记录' : '无法添加农事记录');
    }
  };

  const getLogTypeLabel = (logType: string) => {
    const labels: Record<string, string> = {
      growth: '生长观察',
      farming: '农事操作',
      disease: '病虫害',
      weather: '天气记录',
    };
    return labels[logType] || logType;
  };

  if (loading) {
    return (
      <View style={styles.page}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>农事记录</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.cropSelectionSection}>
          <Text style={styles.sectionTitle}>选择作物</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cropScrollContainer}
          >
            {crops.map((crop) => (
              <TouchableOpacity
                key={crop.id}
                style={[
                  styles.cropCard,
                  selectedCrop?.id === crop.id && styles.cropCardSelected,
                ]}
                onPress={() => handleSelectCrop(crop)}
              >
                <Text style={styles.cropIcon}>{crop.icon}</Text>
                <Text style={styles.cropName}>{crop.name}</Text>
                {selectedCrop?.id === crop.id && (
                  <View style={styles.cropSelectedBadge}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {selectedCrop && (
          <View style={styles.currentCropSection}>
            <View style={styles.currentCropHeader}>
              <View style={styles.currentCropInfo}>
                <Text style={styles.currentCropIcon}>{selectedCrop.icon}</Text>
                <View>
                  <Text style={styles.currentCropName}>{selectedCrop.name}</Text>
                  <Text style={styles.currentCropVariety}>{selectedCrop.variety}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.addButton} onPress={handleAddLog}>
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.addButtonText}>记一笔</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {
              if (selectedCrop) {
                setLogListModalVisible(true);
              }
            }}
            disabled={!selectedCrop}
          >
            <View style={styles.actionIconBg}>
              <Ionicons name="document-text-outline" size={24} color="#4CAF50" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>查看记录</Text>
              <Text style={styles.actionSubtitle}>
                {selectedCrop ? `共 ${logs.length} 条农事记录` : '请先选择作物'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleAddLog}
            disabled={!selectedCrop}
          >
            <View style={[styles.actionIconBg, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="add-circle-outline" size={24} color="#2196F3" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>新增记录</Text>
              <Text style={styles.actionSubtitle}>
                {selectedCrop ? `记录${selectedCrop.name}的农事活动` : '请先选择作物'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {selectedCrop && logs.length > 0 && (
          <View style={styles.recentLogsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>最近记录</Text>
              <TouchableOpacity
                onPress={() => setLogListModalVisible(true)}
                style={styles.viewAllButton}
              >
                <Text style={styles.viewAllText}>查看全部</Text>
                <Ionicons name="chevron-forward" size={14} color="#4CAF50" />
              </TouchableOpacity>
            </View>
            <View style={styles.recentLogsList}>
              {logs.slice(0, 3).map((log, index) => (
                <TouchableOpacity
                  key={log.id}
                  style={[styles.recentLogItem, index === (logs.slice(0, 3).length - 1) && styles.recentLogItemLast]}
                  onPress={() => handleEditLog(log)}
                >
                  <View style={styles.recentLogDate}>
                    <Text style={styles.recentLogDay}>{log.recordDate.split('-')[2]}</Text>
                    <Text style={styles.recentLogMonth}>{log.recordDate.split('-')[1]}月</Text>
                  </View>
                  <View style={styles.recentLogContent}>
                    <View style={styles.recentLogHeader}>
                      <Text
                        style={[
                          styles.recentLogType,
                          log.logType === 'growth' && { color: '#2E7D32' },
                          log.logType === 'farming' && { color: '#1565C0' },
                          log.logType === 'disease' && { color: '#C62828' },
                          log.logType === 'weather' && { color: '#EF6C00' },
                        ]}
                      >
                        {getLogTypeLabel(log.logType)}
                      </Text>
                      <Text style={styles.recentLogTime}>{log.createdAt.split('T')[0]}</Text>
                    </View>
                    <Text style={styles.recentLogText} numberOfLines={2}>
                      {log.content}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#ddd" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.footerSpace} />
      </ScrollView>

      <PlantingLogListModal
        visible={logListModalVisible}
        cropName={selectedCrop?.name || ''}
        logs={logs}
        onClose={() => setLogListModalVisible(false)}
        onAddLog={handleAddLog}
        onEditLog={handleEditLog}
        onDeleteLog={handleDeleteLog}
      />

      <PlantingLogFormModal
        visible={plantingLogFormVisible}
        onClose={() => {
          setPlantingLogFormVisible(false);
          setEditingLog(null);
        }}
        onSubmit={handleSubmitLog}
        editingLog={editingLog}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerPlaceholder: {
    width: 40,
  },
  cropSelectionSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  cropScrollContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cropCard: {
    width: 80,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  cropCardSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  cropIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  cropName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  cropSelectedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentCropSection: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  currentCropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentCropInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currentCropIcon: {
    fontSize: 40,
  },
  currentCropName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  currentCropVariety: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
  },
  addButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  actionSection: {
    marginHorizontal: 16,
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    color: '#4CAF50',
  },
  recentLogsSection: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  recentLogsList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  recentLogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentLogItemLast: {
    borderBottomWidth: 0,
  },
  recentLogDate: {
    width: 48,
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginRight: 12,
  },
  recentLogDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  recentLogMonth: {
    fontSize: 11,
    color: '#999',
  },
  recentLogContent: {
    flex: 1,
  },
  recentLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recentLogType: {
    fontSize: 13,
    fontWeight: '600',
  },
  recentLogTime: {
    fontSize: 11,
    color: '#999',
  },
  recentLogText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  footerSpace: {
    height: 32,
  },
});