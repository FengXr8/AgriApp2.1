import type { GrowthStage, CropStatus, Crop as DomainCrop } from '../../../domain/types';
import type { CropListItem, CropStats } from '../types/crop-ui.types';

export const stageMap: Record<GrowthStage, string> = {
  seedling: '幼苗期',
  vegetative: '生长期',
  flowering: '开花期',
  fruiting: '结果期',
  mature: '成熟期',
};

export const reverseStageMap: Record<string, GrowthStage> = {
  '幼苗期': 'seedling',
  '生长期': 'vegetative',
  '开花期': 'flowering',
  '结果期': 'fruiting',
  '成熟期': 'mature',
};

export const statusMap: Record<CropStatus, string> = {
  planting: '种植中',
  normal: '正常',
  need_water: '需浇水',
  need_fertilize: '需施肥',
  pest_risk: '病虫风险',
  ended: '已结束',
  harvested: '已收获',
};

export const reverseStatusMap: Record<string, CropStatus> = {
  '种植中': 'planting',
  '正常': 'normal',
  '需浇水': 'need_water',
  '需施肥': 'need_fertilize',
  '病虫风险': 'pest_risk',
  '已结束': 'ended',
  '已收获': 'harvested',
};

export function getStatusGroup(statusKey: string): 'normal' | 'pending' | 'ended' {
  if (statusKey === 'normal' || statusKey === 'planting') return 'normal';
  if (statusKey === 'need_water' || statusKey === 'need_fertilize' || statusKey === 'pest_risk') return 'pending';
  return 'ended';
}

export function getStatusLabel(statusKey: CropStatus): string {
  return statusMap[statusKey] || statusKey;
}

export function getStageLabel(stageKey: GrowthStage): string {
  return stageMap[stageKey] || stageKey;
}

export function getStatusColor(statusKey: string): string {
  if (statusKey === 'normal' || statusKey === 'planting') return '#2E7D32';
  if (statusKey === 'need_water') return '#1565C0';
  if (statusKey === 'need_fertilize') return '#F9A825';
  if (statusKey === 'pest_risk') return '#D32F2F';
  return '#BDBDBD';
}

export function getStatusBgColor(statusKey: string): string {
  if (statusKey === 'normal' || statusKey === 'planting') return '#E8F5E9';
  if (statusKey === 'need_water') return '#E3F2FD';
  if (statusKey === 'need_fertilize') return '#FFF8E1';
  if (statusKey === 'pest_risk') return '#FFEBEE';
  return '#F5F5F5';
}

export function getPlotDisplayName(plotId?: string): string {
  if (!plotId) return '未分配地块';
  if (plotId === 'plot_001' || plotId === '1') return '一号田';
  if (plotId === 'plot_002' || plotId === '2') return '二号田';
  if (plotId === 'plot_003' || plotId === '3') return '三号田';
  const match = plotId.match(/(\d+)/);
  return match ? `地块 ${match[1]}` : `地块 ${plotId}`;
}

export function getExpectedHarvestDate(crop: CropListItem): string | undefined {
  return crop.expectedHarvestDate || crop.harvestDate;
}

export function formatCropArea(area: number): string {
  return `${area} 亩`;
}

export function isNormalCrop(statusKey: string): boolean {
  return getStatusGroup(statusKey) === 'normal';
}

export function isPendingCrop(statusKey: string): boolean {
  return getStatusGroup(statusKey) === 'pending';
}

export function isEndedCrop(statusKey: string): boolean {
  return getStatusGroup(statusKey) === 'ended';
}

export function getCropStats(crops: CropListItem[]): CropStats {
  const total = crops.length;
  const normal = crops.filter(c => isNormalCrop(c.statusKey)).length;
  const pending = crops.filter(c => isPendingCrop(c.statusKey)).length;
  return { total, normal, pending };
}

export function domainCropToListItem(crop: DomainCrop): CropListItem {
  return {
    id: crop.id,
    name: crop.name,
    variety: crop.variety || '',
    icon: crop.icon || '🌾',
    stage: getStageLabel(crop.stage),
    stageKey: crop.stage,
    plantDate: crop.plantDate,
    harvestDate: crop.harvestDate,
    expectedHarvestDate: crop.expectedHarvestDate,
    status: getStatusLabel(crop.status),
    statusKey: crop.status,
    plantingArea: crop.plantingArea || 0,
    plotId: crop.plotId,
    farmId: crop.farmId,
    remark: crop.remark,
  };
}

export const cropIcons = ['🌾', '🍅', '🌽', '🥬', '🥕', '🥔', '🌶️', '🍆', '🥒', '🍓'];
