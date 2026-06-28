import type { Crop, CropStatus, GrowthStage } from '../types';
import { API_BASE_URL } from './config';

const mockCrops: Crop[] = [
  {
    id: 'crop_001',
    userId: 'user_001',
    name: '水稻',
    variety: '籼稻',
    plantingArea: 2.5,
    plantDate: '2026-03-15',
    harvestDate: '2026-07-20',
    stage: 'vegetative',
    status: 'planting',
    icon: '🌾',
    createdAt: '2026-03-15T08:00:00Z',
    updatedAt: '2026-06-16T10:00:00Z',
  },
  {
    id: 'crop_002',
    userId: 'user_001',
    name: '番茄',
    variety: '樱桃番茄',
    plantingArea: 0.5,
    plantDate: '2026-04-01',
    harvestDate: '2026-06-30',
    stage: 'fruiting',
    status: 'planting',
    icon: '🍅',
    createdAt: '2026-04-01T08:00:00Z',
    updatedAt: '2026-06-16T10:00:00Z',
  },
  {
    id: 'crop_003',
    userId: 'user_001',
    name: '玉米',
    variety: '甜玉米',
    plantingArea: 1.2,
    plantDate: '2026-03-20',
    harvestDate: '2026-07-15',
    stage: 'mature',
    status: 'planting',
    icon: '🌽',
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
}

export interface CropUpdateData {
  name?: string;
  variety?: string;
  plantingArea?: number;
  plantDate?: string;
  harvestDate?: string;
  stage?: GrowthStage;
  status?: CropStatus;
}

export const cropService = {
  getCrops: async (userId?: string): Promise<Crop[]> => {
    const timestamp = Date.now();
    try {
      const response = await fetch(`${API_BASE_URL}/api/crops?_t=${timestamp}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-cache',
      });
      const result = await response.json();
      if (result.code === 200 && Array.isArray(result.data)) {
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
      const newCrop: Crop = {
        id: `crop_${Date.now()}`,
        userId: 'user_001',
        name: data.name,
        variety: data.variety ?? '',
        plantingArea: data.plantingArea ?? 0,
        plantDate: data.plantDate,
        harvestDate: data.harvestDate,
        stage: data.stage,
        status: data.status ?? 'planting',
        icon: data.icon ?? '🌱',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newCrop;
    } catch (error) {
      console.warn('[cropService] request failed, using mock:', error);
      const newCrop: Crop = {
        id: `crop_${Date.now()}`,
        userId: 'user_001',
        name: data.name,
        variety: data.variety ?? '',
        plantingArea: data.plantingArea ?? 0,
        plantDate: data.plantDate,
        harvestDate: data.harvestDate,
        stage: data.stage,
        status: data.status ?? 'planting',
        icon: data.icon ?? '🌱',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newCrop;
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