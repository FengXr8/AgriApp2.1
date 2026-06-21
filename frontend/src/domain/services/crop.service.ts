import type { Crop, CropStatus, GrowthStage } from '../types';
import { API_BASE_URL } from './config';

const mockCrops: Crop[] = [
  {
    id: 'crop_001',
    userId: 'user_001',
    farmId: 'farm_001',
    plotId: 'plot_001',
    name: '水稻',
    variety: '杂交水稻',
    plantingArea: 2.5,
    plantDate: '2026-03-15',
    expectedHarvestDate: '2026-09-15',
    stage: 'fruiting',
    status: 'normal',
    icon: '🌾',
    remark: '第一批水稻',
    createdAt: '2026-03-15T08:00:00Z',
    updatedAt: '2026-06-16T10:00:00Z',
  },
  {
    id: 'crop_002',
    userId: 'user_001',
    farmId: 'farm_001',
    plotId: 'plot_001',
    name: '西红柿',
    variety: '樱桃番茄',
    plantingArea: 0.5,
    plantDate: '2026-05-01',
    expectedHarvestDate: '2026-08-15',
    stage: 'vegetative',
    status: 'need_water',
    icon: '🍅',
    remark: '大棚西红柿',
    createdAt: '2026-04-01T08:00:00Z',
    updatedAt: '2026-06-16T10:00:00Z',
  },
  {
    id: 'crop_003',
    userId: 'user_001',
    farmId: 'farm_001',
    plotId: 'plot_002',
    name: '小麦',
    variety: '冬小麦',
    plantingArea: 1.2,
    plantDate: '2025-10-15',
    harvestDate: '2026-06-10',
    stage: 'mature',
    status: 'harvested',
    icon: '🌾',
    remark: '已完成收割',
    createdAt: '2026-03-20T08:00:00Z',
    updatedAt: '2026-06-16T10:00:00Z',
  },
];

export interface CropCreateData {
  name: string;
  variety?: string;
  plantingArea?: number;
  plantDate: string;
  harvestDate?: string;
  stage: GrowthStage;
  status?: CropStatus;
  icon?: string;
  farmId?: string;
  plotId?: string;
  expectedHarvestDate?: string;
  remark?: string;
}

export interface CropUpdateData {
  name?: string;
  variety?: string;
  plantingArea?: number;
  plantDate?: string;
  harvestDate?: string;
  stage?: GrowthStage;
  status?: CropStatus;
  farmId?: string;
  plotId?: string;
  expectedHarvestDate?: string;
  remark?: string;
  icon?: string;
}

export const cropService = {
  getCrops: async (userId?: string): Promise<Crop[]> => {
    const timestamp = Date.now();
    const userQuery = userId ? `&userId=${encodeURIComponent(userId)}` : '';

    try {
      const response = await fetch(`${API_BASE_URL}/api/crops?_t=${timestamp}${userQuery}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-cache',
      });
      const result = await response.json();
      if (result.code === 200 && Array.isArray(result.data)) {
        if (result.data.length === 0) {
          console.warn('[cropService] empty response, using fallback');
          return mockCrops;
        }
        return result.data as Crop[];
      }
      console.warn('[cropService] unexpected response, using fallback');
      return mockCrops;
    } catch (error) {
      console.warn('[cropService] request failed, using fallback:', error);
      return mockCrops;
    }
  },

  getCropById: async (id: string): Promise<Crop | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/crops/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.code === 200 && result.data) {
        return result.data as Crop;
      }
      console.warn('[cropService] unexpected response, using fallback');
      return mockCrops.find(crop => crop.id === id) || null;
    } catch (error) {
      console.warn('[cropService] request failed, using fallback:', error);
      return mockCrops.find(crop => crop.id === id) || null;
    }
  },

  addCrop: async (data: CropCreateData): Promise<Crop> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/crops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.code === 200 && result.data) {
        return result.data as Crop;
      }
      console.warn('[cropService] unexpected response, using mock');
      return createLocalCrop(data);
    } catch (error) {
      console.warn('[cropService] request failed, using mock:', error);
      return createLocalCrop(data);
    }
  },

  updateCrop: async (id: string, data: CropUpdateData): Promise<Crop | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/crops/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.code === 200 && result.data) {
        return result.data as Crop;
      }
      console.warn('[cropService] unexpected response, using fallback');
      return mockCrops.find(crop => crop.id === id) || null;
    } catch (error) {
      console.warn('[cropService] request failed, using fallback:', error);
      return mockCrops.find(crop => crop.id === id) || null;
    }
  },

  deleteCrop: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/crops/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.code === 200) {
        return true;
      }
      console.warn('[cropService] unexpected response, using fallback');
      return false;
    } catch (error) {
      console.warn('[cropService] request failed, using fallback:', error);
      return false;
    }
  },
};

const createLocalCrop = (data: CropCreateData): Crop => ({
  id: `crop_${Date.now()}`,
  userId: 'user_001',
  name: data.name,
  variety: data.variety ?? '',
  farmId: data.farmId ?? '',
  plotId: data.plotId ?? '',
  plantingArea: data.plantingArea ?? 0,
  plantDate: data.plantDate,
  harvestDate: data.harvestDate,
  expectedHarvestDate: data.expectedHarvestDate,
  stage: data.stage,
  status: data.status ?? 'planting',
  remark: data.remark ?? '',
  icon: data.icon ?? '🌱',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
