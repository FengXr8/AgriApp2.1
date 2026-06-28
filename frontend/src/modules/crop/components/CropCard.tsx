import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { CropListItem } from '../types/crop-ui.types';
import { getStatusColor, getStatusBgColor, getPlotDisplayName, formatCropArea } from '../utils/cropDisplay';

interface Props {
  crop: CropListItem;
  onPress: () => void;
}

export default function CropCard({ crop, onPress }: Props) {
  const hasExpectedHarvestDate = Boolean(crop.expectedHarvestDate?.trim());
  const hasRemark = Boolean(crop.remark?.trim());

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <LinearGradient
        colors={['#E8F5E9', '#C8E6C9']}
        style={styles.icon}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.iconText}>{crop.icon}</Text>
      </LinearGradient>
      
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.name}>{crop.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(crop.statusKey) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(crop.statusKey) }]}>
              {crop.status}
            </Text>
          </View>
        </View>
        
        <Text style={styles.subInfo}>
          {(crop.variety || '未填写品种')} · {(getPlotDisplayName(crop.plotId) || '未知地块')} · {(formatCropArea(crop.plantingArea) || '0 亩')}
        </Text>
        
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar" size={12} color="#999" />
            <Text style={styles.metaText}>{crop.plantDate || '未知日期'}</Text>
          </View>
          {hasExpectedHarvestDate ? (
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={12} color="#999" />
              <Text style={styles.metaText}>{crop.expectedHarvestDate}</Text>
            </View>
          ) : null}
        </View>
        
        {hasRemark ? (
          <View style={styles.remarkRow}>
            <Ionicons name="information-circle" size={12} color="#666" />
            <Text style={styles.remarkText}>{crop.remark}</Text>
          </View>
        ) : null}
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderBottomWidth: 2,
    borderBottomColor: '#E8F5E9',
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconText: {
    fontSize: 32,
  },
  info: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  subInfo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  remarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  remarkText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
});
