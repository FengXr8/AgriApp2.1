import type { FormData, CropListItem } from '../types/crop-ui.types';
import type { GrowthStage, CropStatus } from '../../../domain/types';
import { reverseStageMap, reverseStatusMap } from './cropDisplay';

const PLOT_OPTIONS = ['plot_001', 'plot_002', 'plot_003'];
const PLOT_DISPLAY_NAMES = ['一号田', '二号田', '三号田'];
const STAGE_OPTIONS = ['幼苗期', '生长期', '开花期', '结果期', '成熟期'];
const STATUS_OPTIONS = ['种植中', '正常', '需浇水', '需施肥', '病虫风险', '已结束'];

export function getPlotOptions(): string[] {
  return PLOT_OPTIONS;
}

export function getPlotDisplayNames(): string[] {
  return PLOT_DISPLAY_NAMES;
}

export function getStageOptions(): string[] {
  return STAGE_OPTIONS;
}

export function getStatusOptions(): string[] {
  return STATUS_OPTIONS;
}

function isValidDate(dateString: string): boolean {
  // 检查格式 YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }

  // 检查是否是真实有效的日期
  const date = new Date(dateString);
  const year = parseInt(dateString.split('-')[0], 10);
  const month = parseInt(dateString.split('-')[1], 10);
  const day = parseInt(dateString.split('-')[2], 10);

  // 验证年月日是否匹配
  if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
    return false;
  }

  return true;
}

export function createEmptyCropFormData(): FormData {
  const today = new Date().toISOString().split('T')[0];
  return {
    name: '',
    variety: '',
    farmId: 'farm_001',
    plotId: '',
    plantingArea: '',
    plantDate: today,
    expectedHarvestDate: '',
    stage: '幼苗期',
    status: '种植中',
    remark: '',
  };
}

export function cropToFormData(crop: CropListItem): FormData {
  return {
    name: crop.name,
    variety: crop.variety || '',
    farmId: crop.farmId || '',
    plotId: crop.plotId || '',
    plantingArea: crop.plantingArea ? String(crop.plantingArea) : '',
    plantDate: crop.plantDate || '',
    expectedHarvestDate: crop.expectedHarvestDate || crop.harvestDate || '',
    stage: crop.stage || '幼苗期',
    status: crop.status || '种植中',
    remark: crop.remark || '',
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof FormData, string>>;
}

export function validateCropForm(formData: FormData): ValidationResult {
  const errors: Partial<Record<keyof FormData, string>> = {};

  // 作物名称不能为空
  if (!formData.name.trim()) {
    errors.name = '请输入作物名称';
  }

  // 地块必须选择
  if (!formData.plotId) {
    errors.plotId = '请选择地块';
  }

  // 种植面积必须是大于 0 的严格数字（整数或小数）
  if (!formData.plantingArea.trim()) {
    errors.plantingArea = '请输入大于 0 的种植面积';
  } else {
    // 严格数字校验：必须是纯数字（整数或小数），且大于 0
    const areaStr = formData.plantingArea.trim();
    const numberRegex = /^\d+(\.\d+)?$/;
    if (!numberRegex.test(areaStr)) {
      errors.plantingArea = '请输入大于 0 的种植面积';
    } else {
      const area = parseFloat(areaStr);
      if (isNaN(area) || area <= 0) {
        errors.plantingArea = '请输入大于 0 的种植面积';
      }
    }
  }

  // 种植日期不能为空，且必须是真实有效的日期
  if (!formData.plantDate.trim() || !isValidDate(formData.plantDate.trim())) {
    errors.plantDate = '请输入正确的种植日期';
  }

  // 预计收获日期可为空；如果填写，必须是真实有效的日期
  if (formData.expectedHarvestDate.trim()) {
    if (!isValidDate(formData.expectedHarvestDate.trim())) {
      errors.expectedHarvestDate = '请输入正确的预计收获日期';
    } else if (isValidDate(formData.plantDate.trim())) {
      // 预计收获日期不能早于种植日期
      if (new Date(formData.expectedHarvestDate.trim()) < new Date(formData.plantDate.trim())) {
        errors.expectedHarvestDate = '预计收获日期不能早于种植日期';
      }
    }
  }

  // 生长阶段必须选择
  if (!formData.stage) {
    errors.stage = '请选择生长阶段';
  }

  // 管理状态必须选择
  if (!formData.status) {
    errors.status = '请选择管理状态';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export interface CropCreatePayload {
  name: string;
  variety?: string;
  stage: GrowthStage;
  status?: CropStatus;
  plantDate: string;
  harvestDate?: string;
  expectedHarvestDate?: string;
  icon: string;
  plantingArea?: number;
  farmId?: string;
  plotId?: string;
  remark?: string;
}

export function formDataToCreatePayload(formData: FormData, selectedIcon: string): CropCreatePayload {
  const payload: CropCreatePayload = {
    name: formData.name.trim(),
    stage: reverseStageMap[formData.stage] || 'seedling',
    plantDate: formData.plantDate.trim() || new Date().toISOString().split('T')[0],
    icon: selectedIcon,
  };

  // variety
  if (formData.variety.trim()) {
    payload.variety = formData.variety.trim();
  }

  // status
  if (formData.status) {
    payload.status = reverseStatusMap[formData.status] || 'planting';
  }

  // plantingArea
  const area = parseFloat(formData.plantingArea);
  if (!isNaN(area) && area > 0) {
    payload.plantingArea = area;
  }

  // expectedHarvestDate - 同时赋给 expectedHarvestDate 和 harvestDate
  if (formData.expectedHarvestDate.trim()) {
    payload.expectedHarvestDate = formData.expectedHarvestDate.trim();
    payload.harvestDate = formData.expectedHarvestDate.trim();
  }

  // farmId
  if (formData.farmId.trim()) {
    payload.farmId = formData.farmId.trim();
  }

  // plotId
  if (formData.plotId.trim()) {
    payload.plotId = formData.plotId.trim();
  }

  // remark
  if (formData.remark.trim()) {
    payload.remark = formData.remark.trim();
  }

  return payload;
}

export interface CropUpdatePayload {
  name?: string;
  variety?: string;
  plantDate?: string;
  stage?: GrowthStage;
  status?: CropStatus;
  harvestDate?: string;
  expectedHarvestDate?: string;
  plantingArea?: number;
  farmId?: string;
  plotId?: string;
  remark?: string;
  icon?: string;
}

export function formDataToUpdatePayload(formData: FormData, selectedIcon: string): CropUpdatePayload {
  const payload: CropUpdatePayload = {
    name: formData.name.trim(),
    plantDate: formData.plantDate.trim(),
    stage: reverseStageMap[formData.stage] || 'seedling',
    icon: selectedIcon,
  };

  // variety - 允许清空
  payload.variety = formData.variety.trim();

  // status
  if (formData.status) {
    payload.status = reverseStatusMap[formData.status] || 'planting';
  }

  // plantingArea
  const area = parseFloat(formData.plantingArea);
  if (!isNaN(area) && area > 0) {
    payload.plantingArea = area;
  }

  // expectedHarvestDate 和 harvestDate - 允许清空，同时赋值
  payload.expectedHarvestDate = formData.expectedHarvestDate.trim();
  payload.harvestDate = formData.expectedHarvestDate.trim();

  // farmId
  if (formData.farmId.trim()) {
    payload.farmId = formData.farmId.trim();
  }

  // plotId
  if (formData.plotId.trim()) {
    payload.plotId = formData.plotId.trim();
  }

  // remark - 允许清空
  payload.remark = formData.remark.trim();

  return payload;
}