export type CropStatus =
  | 'planting'
  | 'normal'
  | 'need_water'
  | 'need_fertilize'
  | 'pest_risk'
  | 'harvested'
  | 'ended';

export type GrowthStage = 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'mature';

export interface Crop {
  id: string;
  userId: string;
  farmId?: string;
  plotId?: string;
  name: string;
  variety: string;
  plantingArea: number;
  plantDate: string;
  expectedHarvestDate?: string;
  harvestDate?: string;
  stage: GrowthStage;
  status: CropStatus;
  icon: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}
