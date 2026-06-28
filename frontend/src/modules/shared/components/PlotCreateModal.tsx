import { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import type { FieldPlot } from '../../../domain/types';

interface Props {
  visible: boolean;
  farmName?: string;
  onCancel: () => void;
  onSubmit: (data: Partial<FieldPlot> & { name: string }) => void;
}

export default function PlotCreateModal({ visible, farmName, onCancel, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [area, setArea] = useState('');

  const submit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      area: area.trim() ? Number(area) : 0,
      areaUnit: 'mu',
      soilType: 'unknown',
    });
    setName('');
    setArea('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.content}>
              <Text style={styles.title}>创建地块</Text>
              <Text style={styles.subTitle}>所属农场：{farmName || '未选择'}</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="地块名称" placeholderTextColor="#999" />
              <TextInput style={styles.input} value={area} onChangeText={setArea} placeholder="面积（亩）" placeholderTextColor="#999" keyboardType="numeric" />
              <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                  <Text style={styles.cancelText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.submitButton, !name.trim() && styles.disabledButton]} onPress={submit} disabled={!name.trim()}>
                  <Text style={styles.submitText}>保存</Text>
                </TouchableOpacity>
              </View>
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
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 34,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 13,
    color: '#777',
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: '#333',
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
  },
  footer: {
    flexDirection: 'row',
    columnGap: 12,
    marginTop: 6,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.45,
  },
  cancelText: {
    color: '#666',
    fontWeight: '600',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
  },
});
