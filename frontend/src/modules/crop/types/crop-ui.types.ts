import type { GrowthStage, CropStatus } from '../../../domain/types';

export interface CropListItem {
  id: string;
  name: string;
  variety: string;
  icon: string;
  stage: string;
  stageKey: GrowthStage;
  plantDate: string;
  harvestDate?: string;
  expectedHarvestDate?: string;
  status: string;
  statusKey: CropStatus;
  plantingArea: number;
  plotId?: string;
  farmId?: string;
  remark?: string;
}

export type QuickStatusFilter = '全部' | '正常' | '待处理';

export type AdvancedStatusFilter = '全部状态' | '需浇水' | '需施肥' | '病虫风险' | '已结束';

export type CropModalMode = 'view' | 'edit' | 'add';

export interface CropStats {
  total: number;
  normal: number;
  pending: number;
}

export interface FormData {
  name: string;
  variety: string;
  farmId: string;
  plotId: string;
  plantingArea: string;
  plantDate: string;
  expectedHarvestDate: string;
  stage: string;
  status: string;
  remark: string;
}
