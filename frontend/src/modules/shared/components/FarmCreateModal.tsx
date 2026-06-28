import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import type { Farm } from '../../../domain/types';
import CitySelector, { type CitySelection } from './CitySelector';

interface Props {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (data: Partial<Farm> & { name: string }) => void;
}

export default function FarmCreateModal({ visible, onCancel, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [selectedCity, setSelectedCity] = useState<CitySelection | null>(null);
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');

  const isValid = Boolean(
    name.trim() &&
    selectedCity &&
    address.trim() &&
    area.trim() &&
    Number(area) > 0
  );

  const resetForm = () => {
    setName('');
    setSelectedCity(null);
    setAddress('');
    setArea('');
  };

  const submit = () => {
    if (!isValid || !selectedCity) return;
    onSubmit({
      name: name.trim(),
      province: selectedCity.province,
      city: selectedCity.city,
      district: selectedCity.district,
      address: address.trim(),
      area: Number(area),
      areaUnit: 'mu',
      status: 'active',
      longitude: selectedCity.longitude,
      latitude: selectedCity.latitude,
    });
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleCancel}>
      <TouchableWithoutFeedback onPress={handleCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.content}>
              <Text style={styles.title}>创建农场</Text>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.label}>
                  农场名称 <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="请输入农场名称"
                  placeholderTextColor="#999"
                />

                <Text style={styles.label}>
                  所在城市/区县 <Text style={styles.requiredStar}>*</Text>
                </Text>
                <CitySelector
                  value={selectedCity}
                  placeholder="请输入城市/区县"
                  onChange={setSelectedCity}
                />
                {selectedCity ? (
                  <Text style={styles.selectedArea}>
                    已选择：{selectedCity.province} / {selectedCity.city} / {selectedCity.district}
                  </Text>
                ) : (
                  <Text style={styles.helpText}>必须从下拉结果中选择城市或区县后才能创建。</Text>
                )}

                <View style={styles.row}>
                  <View style={styles.flex}>
                    <Text style={styles.label}>
                      面积（亩） <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={area}
                      onChangeText={setArea}
                      placeholder="面积"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.label}>
                      详细地址 <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={address}
                      onChangeText={setAddress}
                      placeholder="详细地址"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.submitButton, !isValid && styles.disabledButton]} onPress={submit} disabled={!isValid}>
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
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    marginTop: 8,
  },
  requiredStar: {
    color: '#F44336',
  },
  selectedArea: {
    fontSize: 13,
    color: '#4CAF50',
    marginTop: 6,
    marginBottom: 6,
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  row: {
    flexDirection: 'row',
    columnGap: 10,
  },
  flex: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    columnGap: 12,
    marginTop: 16,
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
