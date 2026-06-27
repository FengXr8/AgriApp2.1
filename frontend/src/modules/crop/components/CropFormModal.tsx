import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, TextInput, TouchableWithoutFeedback } from 'react-native';
import type { FormData } from '../types/crop-ui.types';
import {
  cropIcons,
} from '../utils/cropDisplay';
import {
  getPlotOptions,
  getPlotDisplayNames,
  getStageOptions,
  getStatusOptions,
} from '../utils/cropForm';
import CalendarDatePicker from './CalendarDatePicker';

interface Props {
  visible: boolean;
  mode: 'add' | 'edit';
  value: FormData;
  selectedIcon: string;
  onChange: (next: FormData) => void;
  onIconChange: (icon: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  errors?: Partial<Record<keyof FormData, string>>;
}

function FormField({
  label,
  required,
  children,
  error,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>
        {label}
        {required && <Text style={styles.requiredMark}> *</Text>}
      </Text>
      {children}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function ButtonGroup({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.buttonGroup}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.buttonOption,
            selected === option && styles.buttonOptionSelected,
          ]}
          onPress={() => onSelect(option)}
        >
          <Text
            style={[
              styles.buttonOptionText,
              selected === option && styles.buttonOptionTextSelected,
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function CropFormModal({
  visible,
  mode,
  value,
  selectedIcon,
  onChange,
  onIconChange,
  onCancel,
  onSubmit,
  errors,
}: Props) {
  const plotOptions = getPlotOptions();
  const plotDisplayNames = getPlotDisplayNames();
  const stageOptions = getStageOptions();
  const statusOptions = getStatusOptions();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>
                  {mode === 'add' ? '添加作物' : '编辑作物'}
                </Text>
                <TouchableOpacity onPress={onCancel}>
                  <Text style={styles.close}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                {/* 图标选择器 - 仅新增时显示 */}
                {mode === 'add' && (
                  <View style={styles.iconSection}>
                    <Text style={styles.sectionTitle}>选择图标</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {cropIcons.map((icon) => (
                        <TouchableOpacity
                          key={icon}
                          style={[
                            styles.iconOption,
                            selectedIcon === icon && styles.iconOptionSelected,
                          ]}
                          onPress={() => onIconChange(icon)}
                        >
                          <Text style={styles.iconOptionText}>{icon}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* 基础信息 */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>基础信息</Text>
                  <FormField label="作物名称" required error={errors?.name}>
                    <TextInput
                      style={styles.input}
                      value={value.name}
                      onChangeText={(text) => onChange({ ...value, name: text })}
                      placeholder="例如：水稻"
                      placeholderTextColor="#999"
                    />
                  </FormField>
                  <FormField label="品种" error={errors?.variety}>
                    <TextInput
                      style={styles.input}
                      value={value.variety}
                      onChangeText={(text) => onChange({ ...value, variety: text })}
                      placeholder="例如：优质稻"
                      placeholderTextColor="#999"
                    />
                  </FormField>
                </View>

                {/* 地块与面积 */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>地块与面积</Text>
                  <FormField label="农场">
                    <Text style={styles.staticValue}>当前农场</Text>
                  </FormField>
                  <FormField label="地块" required error={errors?.plotId}>
                    <ButtonGroup
                      options={plotDisplayNames}
                      selected={plotDisplayNames[plotOptions.indexOf(value.plotId)] || ''}
                      onSelect={(displayName) => {
                        const index = plotDisplayNames.indexOf(displayName);
                        if (index >= 0) {
                          onChange({ ...value, plotId: plotOptions[index] });
                        }
                      }}
                    />
                  </FormField>
                  <FormField label="种植面积" required error={errors?.plantingArea}>
                    <View style={styles.inputWithUnit}>
                      <TextInput
                        style={styles.inputNumber}
                        value={value.plantingArea}
                        onChangeText={(text) => onChange({ ...value, plantingArea: text })}
                        placeholder="0"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                      />
                      <Text style={styles.unitLabel}>亩</Text>
                    </View>
                  </FormField>
                </View>

                {/* 种植时间 */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>种植时间</Text>
                  <CalendarDatePicker
                    label="种植日期"
                    required
                    value={value.plantDate}
                    onChange={(date) => onChange({ ...value, plantDate: date })}
                    error={errors?.plantDate}
                    placeholder="请选择种植日期"
                  />
                  <CalendarDatePicker
                    label="预计收获日期"
                    value={value.expectedHarvestDate}
                    onChange={(date) => onChange({ ...value, expectedHarvestDate: date })}
                    error={errors?.expectedHarvestDate}
                    allowClear
                    minDate={value.plantDate}
                    placeholder="请选择预计收获日期"
                  />
                </View>

                {/* 生长与状态 */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>生长与状态</Text>
                  <FormField label="生长阶段" required error={errors?.stage}>
                    <ButtonGroup
                      options={stageOptions}
                      selected={value.stage}
                      onSelect={(stage) => onChange({ ...value, stage })}
                    />
                  </FormField>
                  <FormField label="管理状态" required error={errors?.status}>
                    <ButtonGroup
                      options={statusOptions}
                      selected={value.status}
                      onSelect={(status) => onChange({ ...value, status })}
                    />
                  </FormField>
                </View>

                {/* 备注 */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>备注</Text>
                  <TextInput
                    style={styles.inputMultiline}
                    value={value.remark}
                    onChangeText={(text) => onChange({ ...value, remark: text })}
                    placeholder="填写备注信息..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </ScrollView>

              {/* 底部按钮 */}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                  <Text style={styles.cancelText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '88%',
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  body: {
    flex: 1,
    padding: 20,
  },
  iconSection: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 12,
  },
  formField: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  requiredMark: {
    color: '#D32F2F',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  inputNumber: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  inputMultiline: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
    minHeight: 80,
  },
  staticValue: {
    fontSize: 16,
    color: '#666',
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#D32F2F',
    marginTop: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  buttonOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonOptionSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  buttonOptionText: {
    fontSize: 14,
    color: '#666',
  },
  buttonOptionTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconOptionSelected: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  iconOptionText: {
    fontSize: 24,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});