import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Modal, TextInput, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { Crop as DomainCrop, GrowthStage, CropStatus } from '../../../domain/types';
import { cropService } from '../../../domain/services';

interface Crop {
  id: string;
  name: string;
  icon: string;
  stage: string;
  plantDate: string;
  harvestDate?: string;
  status: '正常' | '注意' | '成熟';
}

interface FormData {
  name: string;
  stage: string;
  status: '正常' | '注意' | '成熟';
  harvestDate: string;
}

const cropIcons = ['🌾', '🍅', '🌽', '🥬', '🥕', '🥔', '🌶️', '🍆', '🥒', '🍓'];

const stageMap: Record<GrowthStage, string> = {
  seedling: '幼苗期',
  vegetative: '生长期',
  flowering: '开花期',
  fruiting: '结果期',
  mature: '成熟期',
};

const statusMap: Record<CropStatus, '正常' | '注意' | '成熟'> = {
  planting: '正常',
  harvested: '成熟',
  ended: '注意',
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case '正常':
      return '#4CAF50';
    case '注意':
      return '#FF9800';
    case '成熟':
      return '#E91E63';
    default:
      return '#999';
  }
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case '正常':
      return { backgroundColor: '#4CAF50', dotColor: '#fff', textColor: '#fff' };
    case '注意':
      return { backgroundColor: '#FF9800', dotColor: '#FFD54F', textColor: '#fff' };
    case '成熟':
      return { backgroundColor: '#E91E63', dotColor: '#fff', textColor: '#fff' };
    default:
      return { backgroundColor: '#f5f5f5', dotColor: '#999', textColor: '#666' };
  }
};

const calculateDays = (plantDate: string): number => {
  const plant = new Date(plantDate);
  const today = new Date();
  const diffTime = today.getTime() - plant.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? diffDays : 0;
};

type ModalMode = 'view' | 'edit' | 'add';

export default function CropScreen() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'全部' | '正常' | '注意' | '成熟'>('全部');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>('view');
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    stage: '',
    status: '正常',
    harvestDate: '',
  });
  const [selectedIcon, setSelectedIcon] = useState('🌾');
  const [loading, setLoading] = useState(true);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const domainCrops = await cropService.getCrops();

      const convertedCrops: Crop[] = domainCrops
        .sort((a, b) => a.id.localeCompare(b.id))
        .map(crop => ({
          id: crop.id,
          name: crop.name,
          icon: crop.icon,
          stage: stageMap[crop.stage],
          plantDate: crop.plantDate,
          harvestDate: crop.harvestDate,
          status: statusMap[crop.status],
        }));

      setCrops(convertedCrops);
    } catch (error) {
      console.error('[CropScreen] Failed to fetch crops:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCrops();
    }, [])
  );

  const filteredCrops = crops.filter((crop) => {
    const matchesSearch = crop.name
      .toLowerCase()
      .includes(searchText.trim().toLowerCase());

    const matchesStatus =
      statusFilter === '全部' || crop.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCropPress = (crop: Crop) => {
    setSelectedCrop(crop);
    setFormData({
      name: crop.name,
      stage: crop.stage,
      status: crop.status,
      harvestDate: crop.harvestDate || '',
    });
    setSelectedIcon(crop.icon);
    setModalMode('view');
    setModalVisible(true);
  };

  const handleAddCrop = () => {
    setSelectedCrop(null);
    setFormData({
      name: '',
      stage: '',
      status: '正常',
      harvestDate: '',
    });
    setSelectedIcon('🌾');
    setModalMode('add');
    setModalVisible(true);
  };

  const handleEdit = () => {
    setModalMode('edit');
  };

  const handleDelete = () => {
    Alert.alert(
      '确认删除',
      `确定要删除"${selectedCrop?.name}"吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            if (selectedCrop) {
              setCrops(crops.filter((crop) => crop.id !== selectedCrop.id));
              setModalVisible(false);
              Alert.alert('成功', '作物已删除');
            }
          },
        },
      ]
    );
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.stage.trim()) {
      Alert.alert('提示', '请填写作物名称和生长期');
      return;
    }

    if (modalMode === 'add') {
      const newCrop: Crop = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        icon: selectedIcon,
        stage: formData.stage.trim(),
        plantDate: new Date().toISOString().split('T')[0],
        harvestDate: formData.harvestDate || undefined,
        status: formData.status,
      };
      setCrops([newCrop, ...crops]);
      Alert.alert('成功', '作物添加成功');
    } else if (modalMode === 'edit' && selectedCrop) {
      setCrops(
        crops.map((crop) =>
          crop.id === selectedCrop.id
            ? {
                ...crop,
                name: formData.name.trim(),
                stage: formData.stage.trim(),
                status: formData.status,
                harvestDate: formData.harvestDate || undefined,
              }
            : crop
        )
      );
      Alert.alert('成功', '作物更新成功');
    }
    setModalVisible(false);
  };

  const handleCancel = () => {
    if (modalMode === 'edit' || modalMode === 'add') {
      setModalMode('view');
      if (selectedCrop) {
        setFormData({
          name: selectedCrop.name,
          stage: selectedCrop.stage,
          status: selectedCrop.status,
          harvestDate: selectedCrop.harvestDate || '',
        });
      }
    } else {
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.page}>
      <LinearGradient
        colors={['#4CAF50', '#388E3C']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>我的作物</Text>
        <Text style={styles.headerSubtitle}>共 {crops.length} 种作物</Text>
        <View style={styles.tipContainer}>
          <Text style={styles.tipIcon}>🌱</Text>
          <Text style={styles.tipText}>今天适合播种</Text>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索作物..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* 修改后的流式自动换行筛选栏，无横向滚动 */}
      <View style={styles.filterWrapContainer}>
        {['全部', '正常', '注意', '成熟'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              status !== '全部' && { borderColor: getStatusColor(status) },
              statusFilter === status && {
                backgroundColor: status === '全部' ? '#4CAF50' : getStatusColor(status),
                borderColor: status === '全部' ? '#4CAF50' : getStatusColor(status),
              },
            ]}
            onPress={() => setStatusFilter(status as any)}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === status && {
                  color: '#fff',
                  fontWeight: 'bold',
                },
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.cropList}>
        {filteredCrops.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyText}>还没有种植作物</Text>
            <Text style={styles.emptySubtext}>点击下方添加按钮开始种植</Text>
          </View>
        ) : (
          filteredCrops.map((crop) => (
            <TouchableOpacity
              key={crop.id}
              style={styles.cropCard}
              onPress={() => handleCropPress(crop)}
              onLongPress={() => {
                handleCropPress(crop);
                setTimeout(() => handleEdit(), 100);
              }}
            >
              <LinearGradient
                colors={['#E8F5E9', '#C8E6C9']}
                style={styles.cropIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.cropIconText}>{crop.icon}</Text>
              </LinearGradient>
              <View style={styles.cropInfo}>
                <Text style={styles.cropName}>{crop.name}</Text>
                <Text style={styles.cropStage}>生长期：{crop.stage}</Text>
                <Text style={styles.cropDate}>种植时间：{crop.plantDate}</Text>
                <Text style={styles.cropDays}>已种植 {calculateDays(crop.plantDate)} 天</Text>
              </View>
              <View style={[styles.statusTag, { backgroundColor: getStatusStyle(crop.status).backgroundColor }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusStyle(crop.status).dotColor }]} />
                <Text style={[styles.statusText, { color: getStatusStyle(crop.status).textColor }]}>{crop.status}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddCrop}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+ 种植新作物</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <TouchableWithoutFeedback onPress={handleCancel}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {modalMode === 'add' ? '添加作物' : modalMode === 'edit' ? '编辑作物' : '作物详情'}
                  </Text>
                  <TouchableOpacity onPress={handleCancel}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {modalMode === 'view' && selectedCrop ? (
  <>
    <View style={styles.detailIconContainer}>
      <Text style={styles.detailIcon}>{selectedCrop.icon}</Text>
    </View>
    <Text style={styles.detailName}>{selectedCrop.name}</Text>
    <Text style={styles.detailStage}>生长期：{selectedCrop.stage}</Text>
    <Text style={styles.detailDate}>种植时间：{selectedCrop.plantDate}</Text>
    <Text style={styles.detailDays}>已种植 {calculateDays(selectedCrop.plantDate)} 天</Text>
    {selectedCrop.harvestDate && (
      <Text style={styles.detailDate}>预计收获：{selectedCrop.harvestDate}</Text>
    )}
    <View style={[styles.detailStatus, getStatusStyle(selectedCrop.status)]}>
      <Text style={[styles.detailStatusText, { color: getStatusStyle(selectedCrop.status).textColor }]}>
        {selectedCrop.status}
      </Text>
    </View>
  </>
) : (
                    <>
                      {modalMode === 'add' && (
                        <View style={styles.iconSelector}>
                          <Text style={styles.iconSelectorTitle}>选择图标</Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {cropIcons.map((icon) => (
                              <TouchableOpacity
                                key={icon}
                                style={[
                                  styles.iconOption,
                                  selectedIcon === icon && styles.iconOptionSelected,
                                ]}
                                onPress={() => setSelectedIcon(icon)}
                              >
                                <Text style={styles.iconOptionText}>{icon}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}

                      <View style={styles.formField}>
                        <Text style={styles.formLabel}>作物名称</Text>
                        <TextInput
                          style={styles.formInput}
                          value={formData.name}
                          onChangeText={(text) => setFormData({ ...formData, name: text })}
                          placeholder="例如：水稻"
                          placeholderTextColor="#999"
                        />
                      </View>

                      <View style={styles.formField}>
                        <Text style={styles.formLabel}>生长期</Text>
                        <TextInput
                          style={styles.formInput}
                          value={formData.stage}
                          onChangeText={(text) => setFormData({ ...formData, stage: text })}
                          placeholder="例如：分蘖期"
                          placeholderTextColor="#999"
                        />
                      </View>

                      <View style={styles.formField}>
                        <Text style={styles.formLabel}>状态</Text>
                        <View style={styles.statusSelector}>
                          {(['正常', '注意', '成熟'] as const).map((status) => (
                            <TouchableOpacity
                              key={status}
                              style={[
                                styles.statusOption,
                                formData.status === status && styles.statusOptionSelected,
                                formData.status === status && getStatusStyle(status),
                              ]}
                              onPress={() => setFormData({ ...formData, status })}
                            >
                              <Text
                                style={[
                                  styles.statusOptionText,
                                  formData.status === status && styles.statusOptionTextSelected,
                                ]}
                              >
                                {status}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      <View style={styles.formField}>
                        <Text style={styles.formLabel}>预计收获日期（可选）</Text>
                        <TextInput
                          style={styles.formInput}
                          value={formData.harvestDate}
                          onChangeText={(text) => setFormData({ ...formData, harvestDate: text })}
                          placeholder="YYYY-MM-DD"
                          placeholderTextColor="#999"
                        />
                      </View>
                    </>
                  )}
                </ScrollView>

                <View style={styles.modalFooter}>
                  {modalMode === 'view' ? (
                    <>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.modalButtonSecondary]}
                        onPress={handleDelete}
                      >
                        <Text style={styles.modalButtonSecondaryText}>删除</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.modalButtonPrimary]}
                        onPress={handleEdit}
                      >
                        <Text style={styles.modalButtonPrimaryText}>编辑</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.modalButtonSecondary]}
                        onPress={handleCancel}
                      >
                        <Text style={styles.modalButtonSecondaryText}>取消</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.modalButtonPrimary]}
                        onPress={handleSave}
                      >
                        <Text style={styles.modalButtonPrimaryText}>保存</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#558B2F',
    marginBottom: 12,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tipText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  searchContainer: {
    padding: 16,
    paddingTop: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  // 替换原横向滚动filterContainer，新增自动换行容器
  filterWrapContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 62,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  cropList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cropCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderBottomWidth: 2,
    borderBottomColor: '#E8F5E9',
  },
  cropIcon: {
    width: 70,
    height: 70,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cropIconText: {
    fontSize: 36,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 4,
  },
  cropStage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  cropDate: {
    fontSize: 13,
    color: '#999',
    marginBottom: 2,
  },
  cropDays: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalClose: {
    fontSize: 24,
    color: '#999',
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  detailIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  detailIcon: {
    fontSize: 80,
  },
  detailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  detailStage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
  },
  detailDate: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 4,
  },
  detailDays: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '500',
  },
  detailStatus: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  detailStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  iconSelector: {
    marginBottom: 20,
  },
  iconSelectorTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  iconOption: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconOptionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  iconOptionText: {
    fontSize: 28,
  },
  formField: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  formInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#333',
  },
  statusSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statusOptionSelected: {
    borderColor: '#4CAF50',
  },
  statusOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statusOptionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#4CAF50',
  },
  modalButtonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonSecondary: {
    backgroundColor: '#f5f5f5',
  },
  modalButtonSecondaryText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});