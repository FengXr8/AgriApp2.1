import { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { cropService, farmSelectionService, farmService } from '../../../domain/services';
import type { CropListItem, CropModalMode, FormData, QuickStatusFilter, CropStats, AdvancedStatusFilter } from '../types/crop-ui.types';
import type { PlantingLog, LogType } from '../../../domain/types/planting-log.types';
import type { Farm, FieldPlot } from '../../../domain/types';
import { plantingLogService } from '../../../domain/services/planting-log.service';
import {
  domainCropToListItem,
  getCropStats,
  getPlotDisplayName,
} from '../utils/cropDisplay';
import {
  createEmptyCropFormData,
  cropToFormData,
  validateCropForm,
  formDataToCreatePayload,
  formDataToUpdatePayload,
} from '../utils/cropForm';
import CropStatusTabs from '../components/CropStatusTabs';
import CropSearchBar from '../components/CropSearchBar';
import CropCard from '../components/CropCard';
import CropFilterModal from '../components/CropFilterModal';
import CropDetailModal from '../components/CropDetailModal';
import CropFormModal from '../components/CropFormModal';
import PlantingLogListModal from '../components/PlantingLogListModal';
import PlantingLogFormModal from '../components/PlantingLogFormModal';
import FarmPickerModal from '../../shared/components/FarmPickerModal';
import FarmCreateModal from '../../shared/components/FarmCreateModal';
import PlotCreateModal from '../../shared/components/PlotCreateModal';

export default function CropScreen() {
  const [crops, setCrops] = useState<CropListItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [quickStatusFilter, setQuickStatusFilter] = useState<QuickStatusFilter>('全部');
  const [selectedCrop, setSelectedCrop] = useState<CropListItem | null>(null);
  const [modalMode, setModalMode] = useState<CropModalMode>('view');
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState<string>('全部地块');
  const [selectedAdvancedStatus, setSelectedAdvancedStatus] = useState<AdvancedStatusFilter>('全部状态');
  const [formData, setFormData] = useState<FormData>(createEmptyCropFormData());
  const [selectedIcon, setSelectedIcon] = useState('🌾');
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(true);
  const [cropLogs, setCropLogs] = useState<PlantingLog[]>([]);
  const [logListModalVisible, setLogListModalVisible] = useState(false);
  const [plantingLogFormVisible, setPlantingLogFormVisible] = useState(false);
  const [editingLog, setEditingLog] = useState<PlantingLog | null>(null);
  const initialSelection = farmSelectionService.getSelection();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [plotsByFarmId, setPlotsByFarmId] = useState<Record<string, FieldPlot[]>>({});
  const [selectedFarmId, setSelectedFarmId] = useState<string | undefined>(initialSelection?.farmId);
  const [selectedCurrentPlotId, setSelectedCurrentPlotId] = useState<string | undefined>(initialSelection?.plotId);
  const [farmPickerVisible, setFarmPickerVisible] = useState(false);
  const [plotFarmPickerVisible, setPlotFarmPickerVisible] = useState(false);
  const [farmCreateVisible, setFarmCreateVisible] = useState(false);
  const [plotCreateVisible, setPlotCreateVisible] = useState(false);
  const [createMenuVisible, setCreateMenuVisible] = useState(false);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const domainCrops = await cropService.getCrops();

      const convertedCrops: CropListItem[] = domainCrops
        .sort((a, b) => a.id.localeCompare(b.id))
        .map(domainCropToListItem);

      setCrops(convertedCrops);
    } catch (error) {
      console.error('[CropScreen] Failed to fetch crops:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFarms = async () => {
    const farmList = await farmService.getFarms();
    const plotEntries = await Promise.all(
      farmList.map(async farm => [farm.id, await farmService.getPlots(farm.id)] as const)
    );
    const nextPlotsByFarmId = Object.fromEntries(plotEntries);
    const savedSelection = farmSelectionService.getSelection();

    setFarms(farmList);
    setPlotsByFarmId(nextPlotsByFarmId);

    if (savedSelection && farmList.some(farm => farm.id === savedSelection.farmId)) {
      const savedPlots = nextPlotsByFarmId[savedSelection.farmId] || [];
      const plotStillExists = savedPlots.some(plot => plot.id === savedSelection.plotId);
      setSelectedFarmId(savedSelection.farmId);
      setSelectedCurrentPlotId(plotStillExists ? savedSelection.plotId : undefined);
      return;
    }

    if (farmList.length > 0) {
      setSelectedFarmId(farmList[0].id);
      setSelectedCurrentPlotId(undefined);
      farmSelectionService.setSelection({ farmId: farmList[0].id });
    } else {
      setSelectedFarmId(undefined);
      setSelectedCurrentPlotId(undefined);
      farmSelectionService.clearSelection();
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCrops();
      fetchFarms();
    }, [])
  );

  const selectedFarm = useMemo(
    () => farms.find(farm => farm.id === selectedFarmId),
    [farms, selectedFarmId]
  );

  const currentFarmPlots = useMemo(
    () => (selectedFarmId ? plotsByFarmId[selectedFarmId] || [] : []),
    [plotsByFarmId, selectedFarmId]
  );

  const selectedCurrentPlot = useMemo(
    () => currentFarmPlots.find(plot => plot.id === selectedCurrentPlotId),
    [currentFarmPlots, selectedCurrentPlotId]
  );

  const stats: CropStats = useMemo(() => getCropStats(crops), [crops]);

  const plotOptions = useMemo(() => {
    const plots = new Set(crops.map((c) => getPlotDisplayName(c.plotId)));
    return ['全部地块', ...Array.from(plots)];
  }, [crops]);

  const filteredCrops = useMemo(() => {
    return crops.filter((crop) => {
      const searchQuery = searchText.trim().toLowerCase();
      const matchesSearch =
        crop.name.toLowerCase().includes(searchQuery) ||
        (crop.variety && crop.variety.toLowerCase().includes(searchQuery));

      let matchesQuick = true;
      if (quickStatusFilter === '正常') {
        matchesQuick = crop.status === '正常' || crop.status === '种植中';
      } else if (quickStatusFilter === '待处理') {
        matchesQuick = crop.status === '需浇水' || crop.status === '需施肥' || crop.status === '病虫风险';
      }

      const matchesPlot = selectedPlot === '全部地块' || getPlotDisplayName(crop.plotId) === selectedPlot;

      let matchesAdvanced = true;
      if (selectedAdvancedStatus !== '全部状态') {
        if (selectedAdvancedStatus === '已结束') {
          matchesAdvanced = crop.statusKey === 'ended' || crop.statusKey === 'harvested';
        } else {
          matchesAdvanced = crop.status === selectedAdvancedStatus;
        }
      }

      const matchesCurrentFarm = !selectedFarmId || crop.farmId === selectedFarmId;
      const matchesCurrentPlot = !selectedCurrentPlotId || crop.plotId === selectedCurrentPlotId;

      return matchesSearch && matchesQuick && matchesPlot && matchesAdvanced && matchesCurrentFarm && matchesCurrentPlot;
    });
  }, [crops, searchText, quickStatusFilter, selectedPlot, selectedAdvancedStatus, selectedFarmId, selectedCurrentPlotId]);

  const getFilterCount = (): number => {
    let count = 0;
    if (selectedPlot !== '全部地块') count++;
    if (selectedAdvancedStatus !== '全部状态') count++;
    return count;
  };

  const handleClearFilters = () => {
    setSelectedPlot('全部地块');
    setSelectedAdvancedStatus('全部状态');
  };

  const handleCropPress = async (crop: CropListItem) => {
    setSelectedCrop(crop);
    setFormData(cropToFormData(crop));
    setSelectedIcon(crop.icon);
    setFormErrors({});
    setModalMode('view');
    setModalVisible(true);

    // 加载该作物的种植记录
    setCropLogs([]); // 先清空，避免短暂显示上一个作物的记录
    try {
      const logs = await plantingLogService.getLogsByCrop(crop.id);
      // 按 cropId 过滤并按 createdAt 倒序排序
      const filteredLogs = logs
        .filter((log) => log.cropId === crop.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCropLogs(filteredLogs);
    } catch {
      setCropLogs([]);
    }
  };

  const handleAddCrop = () => {
    if (!selectedFarmId) {
      setFarmPickerVisible(true);
      return;
    }
    if (currentFarmPlots.length === 0) {
      setPlotCreateVisible(true);
      return;
    }
    setSelectedCrop(null);
    setFormData({
      ...createEmptyCropFormData(),
      farmId: selectedFarmId,
      plotId: selectedCurrentPlotId || currentFarmPlots[0].id,
    });
    setSelectedIcon('🌾');
    setFormErrors({});
    setModalMode('add');
    setModalVisible(true);
  };

  const handleEdit = () => {
    setModalMode('edit');
  };

  const handleSelectFarm = (farmId: string, plotId?: string) => {
    setSelectedFarmId(farmId);
    setSelectedCurrentPlotId(plotId);
    farmSelectionService.setSelection({ farmId, plotId });
    setFarmPickerVisible(false);
  };

  const handleOpenCreateMenu = () => {
    Alert.alert('创建', '请选择要创建的内容', [
      { text: '创建农场', onPress: () => setFarmCreateVisible(true) },
      {
        text: '创建地块',
        onPress: () => {
          setPlotFarmPickerVisible(true);
        },
      },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const handleCreateFarm = async (data: Partial<Farm> & { name: string }) => {
    const farm = await farmService.createFarm(data);
    setFarmCreateVisible(false);
    setSelectedFarmId(farm.id);
    setSelectedCurrentPlotId(undefined);
    setFarms(prev => [farm, ...prev.filter(item => item.id !== farm.id)]);
    setPlotsByFarmId(prev => ({ ...prev, [farm.id]: prev[farm.id] || [] }));
    farmSelectionService.setSelection({ farmId: farm.id });
    await fetchFarms();
  };

  const handleCreatePlot = async (data: Partial<FieldPlot> & { name: string }) => {
    if (!selectedFarmId) {
      setPlotCreateVisible(false);
      setPlotFarmPickerVisible(true);
      return;
    }
    const plot = await farmService.createPlot(selectedFarmId, data);
    setPlotCreateVisible(false);
    await fetchFarms();
    setSelectedCurrentPlotId(plot.id);
    farmSelectionService.setSelection({ farmId: selectedFarmId, plotId: plot.id });
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
          onPress: async () => {
            if (selectedCrop) {
              try {
                await cropService.deleteCrop(selectedCrop.id);
                setModalVisible(false);
                Alert.alert('成功', '作物已删除');
                fetchCrops();
              } catch (error) {
                console.error('[CropScreen] Delete failed:', error);
                Alert.alert('删除失败', '请稍后重试');
              }
            }
          },
        },
      ]
    );
  };

  const handleViewAllLogs = () => {
    setLogListModalVisible(true);
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
      const success = await plantingLogService.deleteLog(logId);
      if (success && selectedCrop) {
        const logs = await plantingLogService.getLogsByCrop(selectedCrop.id);
        const filteredLogs = logs
          .filter((log) => log.cropId === selectedCrop.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setCropLogs(filteredLogs);
        Alert.alert('成功', '记录已删除');
      } else {
        Alert.alert('删除失败', '请稍后重试');
      }
    } catch (error) {
      console.error('[CropScreen] Failed to delete log:', error);
      Alert.alert('删除失败', '请稍后重试');
    }
  };

  const handleSubmitLog = async (data: { logType: LogType; recordDate: string; content: string }) => {
    if (!selectedCrop) {
      Alert.alert('提示', '请先选择作物');
      return;
    }

    try {
      if (editingLog) {
        // 编辑模式
        await plantingLogService.updateLog(editingLog.id, {
          logType: data.logType,
          recordDate: data.recordDate,
          content: data.content,
          images: editingLog.images || [],
        });
        Alert.alert('成功', '记录已修改');
      } else {
        // 新增模式
        await plantingLogService.addLog({
          cropId: selectedCrop.id,
          cropName: selectedCrop.name,
          logType: data.logType,
          recordDate: data.recordDate,
          content: data.content,
          images: [],
        });
        Alert.alert('成功', '记录已添加');
      }

      const logs = await plantingLogService.getLogsByCrop(selectedCrop.id);
      const filteredLogs = logs
        .filter((log) => log.cropId === selectedCrop.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCropLogs(filteredLogs);
      setEditingLog(null);
    } catch (error) {
      console.error('[CropScreen] Failed to submit log:', error);
      if (editingLog) {
        Alert.alert('修改失败', '请稍后重试');
      } else {
        Alert.alert('添加失败', '请稍后重试');
      }
      throw error;
    }
  };

  const handleSave = async () => {
    const validation = validateCropForm(formData);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      if (modalMode === 'add') {
        const payload = formDataToCreatePayload(formData, selectedIcon);
        await cropService.addCrop(payload);
        setModalVisible(false);
        setFormErrors({});
        Alert.alert('成功', '作物添加成功');
        fetchCrops();
      } else if (modalMode === 'edit' && selectedCrop) {
        const payload = formDataToUpdatePayload(formData, selectedIcon);
        const updatedCrop = await cropService.updateCrop(selectedCrop.id, payload);
        if (!updatedCrop) {
          Alert.alert('更新失败', '请稍后重试');
          return;
        }
        setModalVisible(false);
        setFormErrors({});
        Alert.alert('成功', '作物更新成功');
        fetchCrops();
      }
    } catch (error) {
      console.error('[CropScreen] Save failed:', error);
      if (modalMode === 'add') {
        Alert.alert('添加失败', '请稍后重试');
      } else {
        Alert.alert('更新失败', '请稍后重试');
      }
    }
  };

  const handleCancel = () => {
    if (modalMode === 'edit') {
      setModalMode('view');
      if (selectedCrop) {
        setFormData(cropToFormData(selectedCrop));
        setFormErrors({});
      }
    } else if (modalMode === 'add') {
      setModalVisible(false);
      setFormErrors({});
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
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>我的作物</Text>
          <View style={styles.createMenuContainer}>
            <TouchableOpacity 
              style={styles.headerCreateBtn} 
              onPress={() => setCreateMenuVisible(!createMenuVisible)}
            >
              <Text style={styles.headerCreateIcon}>+</Text>
            </TouchableOpacity>
            {createMenuVisible && (
              <View style={styles.createMenuDropdown}>
                <TouchableOpacity 
                  style={styles.createMenuItem}
                  onPress={() => {
                    setCreateMenuVisible(false);
                    setFarmCreateVisible(true);
                  }}
                >
                  <Text style={styles.createMenuItemText}>创建农场</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.createMenuItem}
                  onPress={() => {
                    setCreateMenuVisible(false);
                    setPlotFarmPickerVisible(true);
                  }}
                >
                  <Text style={styles.createMenuItemText}>创建地块</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.headerSubtitle}>共 {crops.length} 种作物</Text>
        <View style={styles.tipContainer}>
          <Text style={styles.tipIcon}>🌱</Text>
          <Text style={styles.tipText}>今天适合播种</Text>
        </View>
      </LinearGradient>

      <CropStatusTabs stats={stats} value={quickStatusFilter} onChange={setQuickStatusFilter} />

      <TouchableOpacity style={styles.farmSelector} onPress={() => setFarmPickerVisible(true)}>
        <View>
          <Text style={styles.farmSelectorLabel}>当前农场</Text>
          <Text style={styles.farmSelectorValue}>
            {selectedFarm ? `${selectedFarm.name}${selectedCurrentPlot ? ` · ${selectedCurrentPlot.name}` : ''}` : '请选择农场'}
          </Text>
        </View>
        <Text style={styles.farmSelectorAction}>切换</Text>
      </TouchableOpacity>

      <CropSearchBar
        searchText={searchText}
        onSearchTextChange={setSearchText}
        filterCount={getFilterCount()}
        onOpenFilter={() => setFilterModalVisible(true)}
      />

      <ScrollView style={styles.cropList}>
        {filteredCrops.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyText}>还没有种植作物</Text>
            <Text style={styles.emptySubtext}>点击下方添加按钮开始种植</Text>
          </View>
        ) : (
          filteredCrops.map((crop) => (
            <CropCard key={crop.id} crop={crop} onPress={() => handleCropPress(crop)} />
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

      <CropFilterModal
        visible={filterModalVisible}
        plotOptions={plotOptions}
        selectedPlot={selectedPlot}
        selectedAdvancedStatus={selectedAdvancedStatus}
        onSelectPlot={setSelectedPlot}
        onSelectAdvancedStatus={setSelectedAdvancedStatus}
        onClear={handleClearFilters}
        onClose={() => setFilterModalVisible(false)}
      />

      <CropDetailModal
        visible={modalVisible && modalMode === 'view'}
        crop={selectedCrop}
        logs={cropLogs}
        onClose={() => setModalVisible(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewAllLogs={handleViewAllLogs}
        onAddLog={handleAddLog}
      />

      <PlantingLogListModal
        visible={logListModalVisible}
        cropName={selectedCrop?.name || ''}
        logs={cropLogs}
        onClose={() => setLogListModalVisible(false)}
        onAddLog={handleAddLog}
        onEditLog={handleEditLog}
        onDeleteLog={handleDeleteLog}
      />

      <CropFormModal
        visible={modalVisible && (modalMode === 'add' || modalMode === 'edit')}
        mode={modalMode === 'add' ? 'add' : 'edit'}
        value={formData}
        selectedIcon={selectedIcon}
        onChange={setFormData}
        onIconChange={setSelectedIcon}
        onCancel={handleCancel}
        onSubmit={handleSave}
        errors={formErrors}
        farmName={selectedFarm?.name || '未选择农场'}
        plotOptions={currentFarmPlots.map(plot => ({ id: plot.id, name: plot.name }))}
        onCreatePlot={() => setPlotCreateVisible(true)}
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

      <FarmPickerModal
        visible={farmPickerVisible}
        farms={farms}
        plotsByFarmId={plotsByFarmId}
        selectedFarmId={selectedFarmId}
        selectedPlotId={selectedCurrentPlotId}
        title="选择当前农场"
        showPlots={false}
        onSelect={handleSelectFarm}
        onClose={() => setFarmPickerVisible(false)}
        onCreateFarm={() => {
          setFarmPickerVisible(false);
          setFarmCreateVisible(true);
        }}
      />

      <FarmPickerModal
        visible={plotFarmPickerVisible}
        farms={farms}
        plotsByFarmId={{}}
        selectedFarmId={selectedFarmId}
        title="选择地块所属农场"
        onSelect={(farmId) => {
          setSelectedFarmId(farmId);
          setSelectedCurrentPlotId(undefined);
          farmSelectionService.setSelection({ farmId });
          setPlotFarmPickerVisible(false);
          setPlotCreateVisible(true);
        }}
        onClose={() => setPlotFarmPickerVisible(false)}
        onCreateFarm={() => {
          setPlotFarmPickerVisible(false);
          setFarmCreateVisible(true);
        }}
      />

      <FarmCreateModal
        visible={farmCreateVisible}
        onCancel={() => setFarmCreateVisible(false)}
        onSubmit={handleCreateFarm}
      />

      <PlotCreateModal
        visible={plotCreateVisible}
        farmName={selectedFarm?.name}
        onCancel={() => setPlotCreateVisible(false)}
        onSubmit={handleCreatePlot}
      />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerCreateBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCreateIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    lineHeight: 26,
  },
  createMenuContainer: {
    position: 'relative',
  },
  createMenuDropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 4,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  createMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  createMenuItemText: {
    fontSize: 14,
    color: '#333',
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
  cropList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  farmSelector: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  farmSelectorLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 3,
  },
  farmSelectorValue: {
    fontSize: 15,
    color: '#222',
    fontWeight: '700',
  },
  farmSelectorAction: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '700',
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
    flexDirection: 'row',
    columnGap: 12,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addButton: {
    flex: 1,
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
  secondaryButton: {
    width: 96,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
