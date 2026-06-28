import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import type { Farm, FieldPlot } from '../../../domain/types';

interface Props {
  visible: boolean;
  farms: Farm[];
  plotsByFarmId: Record<string, FieldPlot[]>;
  selectedFarmId?: string;
  selectedPlotId?: string;
  title?: string;
  requireSelection?: boolean;
  showPlots?: boolean;  // 是否显示地块选择，默认 true
  onSelect: (farmId: string, plotId?: string) => void;
  onClose: () => void;
  onCreateFarm: () => void;
}

export default function FarmPickerModal({
  visible,
  farms,
  plotsByFarmId,
  selectedFarmId,
  selectedPlotId,
  title = '选择农场',
  requireSelection = false,
  showPlots = true,
  onSelect,
  onClose,
  onCreateFarm,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={requireSelection ? undefined : onClose}>
      <TouchableWithoutFeedback onPress={requireSelection ? undefined : onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {!requireSelection && (
                  <TouchableOpacity onPress={onClose}>
                    <Text style={styles.close}>×</Text>
                  </TouchableOpacity>
                )}
              </View>

              {farms.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyTitle}>还没有农场</Text>
                  <Text style={styles.emptyText}>请先创建农场，再按农场位置查看天气。</Text>
                  <TouchableOpacity style={styles.primaryButton} onPress={onCreateFarm}>
                    <Text style={styles.primaryButtonText}>创建农场</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                  {farms.map(farm => {
                    const plots = plotsByFarmId[farm.id] || [];
                    const selectedFarm = selectedFarmId === farm.id && !selectedPlotId;
                    return (
                      <View key={farm.id} style={styles.farmBlock}>
                        <TouchableOpacity
                          style={[styles.option, selectedFarm && styles.optionActive]}
                          onPress={() => onSelect(farm.id)}
                        >
                          <View>
                            <Text style={[styles.optionTitle, selectedFarm && styles.optionTitleActive]}>{farm.name}</Text>
                            <Text style={styles.optionMeta}>{farm.city || '未知城市'} · {farm.address || '未填写地址'}</Text>
                          </View>
                          <Text style={styles.optionAction}>选择农场</Text>
                        </TouchableOpacity>

                        {showPlots && plots.map(plot => {
                          const selectedPlot = selectedFarmId === farm.id && selectedPlotId === plot.id;
                          return (
                            <TouchableOpacity
                              key={plot.id}
                              style={[styles.plotOption, selectedPlot && styles.optionActive]}
                              onPress={() => onSelect(farm.id, plot.id)}
                            >
                              <Text style={[styles.plotName, selectedPlot && styles.optionTitleActive]}>{plot.name}</Text>
                              <Text style={styles.optionMeta}>{plot.area || 0} 亩</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  close: {
    fontSize: 28,
    color: '#999',
    paddingHorizontal: 4,
  },
  empty: {
    padding: 22,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  list: {
    padding: 14,
  },
  farmBlock: {
    marginBottom: 12,
  },
  option: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#fff',
  },
  optionActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  optionTitleActive: {
    color: '#2E7D32',
  },
  optionMeta: {
    fontSize: 12,
    color: '#777',
  },
  optionAction: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 8,
    fontWeight: '700',
  },
  plotOption: {
    marginLeft: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FAFAFA',
  },
  plotName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
});
