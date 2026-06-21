import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import type { CropListItem } from '../types/crop-ui.types';
import {
  getPlotDisplayName,
  formatCropArea,
  getStatusColor,
  getStatusBgColor,
} from '../utils/cropDisplay';

interface Props {
  visible: boolean;
  crop: CropListItem | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export default function CropDetailModal({ visible, crop, onClose, onEdit, onDelete }: Props) {
  if (!crop) return null;

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
              <Text style={styles.title}>{crop.name}</Text>
              {crop.variety ? <Text style={styles.titleSubtitle}>{crop.variety}</Text> : null}
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{crop.icon}</Text>
            </View>

            <Section title="地块与面积">
              <InfoRow label="农场" value="当前农场" />
              <InfoRow label="地块" value={getPlotDisplayName(crop.plotId)} />
              <InfoRow label="面积" value={formatCropArea(crop.plantingArea)} />
            </Section>

            <Section title="种植时间">
              <InfoRow label="种植日期" value={crop.plantDate} />
              <InfoRow
                label="预计收获"
                value={crop.expectedHarvestDate || crop.harvestDate || '暂未设定'}
              />
            </Section>

            <Section title="生长与状态">
              <InfoRow label="生长阶段" value={crop.stage} />
              <View style={styles.statusRow}>
                <Text style={styles.infoLabel}>管理状态</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(crop.statusKey) }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(crop.statusKey) }]}>
                    {crop.status}
                  </Text>
                </View>
              </View>
            </Section>

            {crop.remark ? (
              <Section title="备注">
                <Text style={styles.remarkText}>{crop.remark}</Text>
              </Section>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
              <Text style={styles.deleteText}>删除作物</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <Text style={styles.editText}>编辑作物</Text>
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
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  titleSubtitle: {
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
    padding: 20,
    paddingBottom: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 64,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionBody: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  remarkText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  deleteButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF5350',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 16,
    color: '#EF5350',
    fontWeight: '500',
  },
  editButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  editText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});