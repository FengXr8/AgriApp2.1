export type CropStatus = 'planting' | 'harvested' | 'ended';

export type GrowthStage = 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'mature';

export interface Crop {
  id: string;
  userId: string;
  name: string;
  variety: string;
  plantingArea: number;
  plantDate: string;
  harvestDate?: string;
  stage: GrowthStage;
  status: CropStatus;
  icon: string;
  createdAt: string;
  updatedAt: string;
}