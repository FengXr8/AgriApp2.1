import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { CropStats, QuickStatusFilter } from '../types/crop-ui.types';

interface Props {
  stats: CropStats;
  value: QuickStatusFilter;
  onChange: (value: QuickStatusFilter) => void;
}

export default function CropStatusTabs({ stats, value, onChange }: Props) {
  const tabs = [
    { key: '全部' as QuickStatusFilter, label: '全部', count: stats.total },
    { key: '正常' as QuickStatusFilter, label: '正常', count: stats.normal },
    { key: '待处理' as QuickStatusFilter, label: '待处理', count: stats.pending },
  ];

  return (
    <View style={styles.tabsContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tabButton,
            value === tab.key && styles.tabButtonActive,
          ]}
          onPress={() => onChange(tab.key)}
        >
          <Text style={[styles.tabText, value === tab.key && styles.tabTextActive]}>
            {tab.label}
          </Text>
          <Text style={[styles.tabCount, value === tab.key && styles.tabCountActive]}>
            {tab.count}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  tabButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
  },
  tabCountActive: {
    color: '#fff',
  },
});