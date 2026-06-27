import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import type { AdvancedStatusFilter } from '../types/crop-ui.types';

interface Props {
  visible: boolean;
  plotOptions: string[];
  selectedPlot: string;
  selectedAdvancedStatus: AdvancedStatusFilter;
  onSelectPlot: (plot: string) => void;
  onSelectAdvancedStatus: (status: AdvancedStatusFilter) => void;
  onClear: () => void;
  onClose: () => void;
}

const advancedStatusOptions: AdvancedStatusFilter[] = [
  '全部状态',
  '需浇水',
  '需施肥',
  '病虫风险',
  '已结束',
];

export default function CropFilterModal({
  visible,
  plotOptions,
  selectedPlot,
  selectedAdvancedStatus,
  onSelectPlot,
  onSelectAdvancedStatus,
  onClear,
  onClose,
}: Props) {
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
            <Text style={styles.title}>筛选</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>地块</Text>
              <View style={styles.optionsRow}>
                {plotOptions.map((plot) => (
                  <TouchableOpacity
                    key={plot}
                    style={[
                      styles.optionButton,
                      selectedPlot === plot && styles.optionButtonActive,
                    ]}
                    onPress={() => onSelectPlot(plot)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedPlot === plot && styles.optionTextActive,
                      ]}
                    >
                      {plot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>状态</Text>
              <View style={styles.optionsRow}>
                {advancedStatusOptions.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.optionButton,
                      selectedAdvancedStatus === status && styles.optionButtonActive,
                    ]}
                    onPress={() => onSelectAdvancedStatus(status)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedAdvancedStatus === status && styles.optionTextActive,
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.clearButton} onPress={onClear}>
              <Text style={styles.clearText}>清空</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneText}>完成</Text>
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
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 12,
    height: '60%',
    maxHeight: '80%',
  },
  body: {
    flex: 1,
    paddingVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  close: {
    fontSize: 24,
    color: '#999',
    padding: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionButtonActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  clearButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  clearText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  doneButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  doneText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});