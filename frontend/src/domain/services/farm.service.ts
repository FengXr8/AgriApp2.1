import type { Farm, FieldPlot } from '../types';
import { API_BASE_URL } from './config';

const defaultFarms: Farm[] = [
  {
    id: 'farm_001',
    userId: 'user_001',
    name: '阳光农场',
    province: '广东省',
    city: '广州市',
    district: '白云区',
    address: '广东省广州市白云区',
    longitude: 113.2644,
    latitude: 23.1291,
    area: 100,
    areaUnit: 'mu',
    status: 'active',
  },
];

const defaultPlots: FieldPlot[] = [
  {
    id: 'plot_001',
    userId: 'user_001',
    farmId: 'farm_001',
    name: '一号田',
    area: 50,
    areaUnit: 'mu',
    soilType: 'loam',
    status: 'active',
  },
];

let memoryFarms = [...defaultFarms];
let memoryPlots = [...defaultPlots];

export const farmService = {
  getFarms: async (): Promise<Farm[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/farms`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.code === 200 && Array.isArray(result.data)) {
        memoryFarms = result.data;
        return result.data;
      }
      return memoryFarms;
    } catch (error) {
      console.warn('[farmService] request failed, using fallback:', error);
      return memoryFarms;
    }
  },

  createFarm: async (data: Partial<Farm> & { name: string }): Promise<Farm> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/farms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.code === 200 && result.data) {
        return result.data;
      }
      throw new Error(result.message || 'Failed to create farm');
    } catch (error) {
      console.warn('[farmService] create farm fallback:', error);
      const farm = {
        id: `farm_${Date.now()}`,
        userId: 'user_001',
        areaUnit: 'mu',
        status: 'active',
        ...data,
      };
      memoryFarms = [farm, ...memoryFarms];
      return farm;
    }
  },

  getPlots: async (farmId: string): Promise<FieldPlot[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/farms/${farmId}/plots`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.code === 200 && Array.isArray(result.data)) {
        memoryPlots = [
          ...memoryPlots.filter(plot => plot.farmId !== farmId),
          ...result.data,
        ];
        return result.data;
      }
      return memoryPlots.filter(plot => plot.farmId === farmId);
    } catch (error) {
      console.warn('[farmService] plots request failed, using fallback:', error);
      return memoryPlots.filter(plot => plot.farmId === farmId);
    }
  },

  createPlot: async (farmId: string, data: Partial<FieldPlot> & { name: string }): Promise<FieldPlot> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/farms/${farmId}/plots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.code === 200 && result.data) {
        return result.data;
      }
      throw new Error(result.message || 'Failed to create plot');
    } catch (error) {
      console.warn('[farmService] create plot fallback:', error);
      const plot = {
        id: `plot_${Date.now()}`,
        userId: 'user_001',
        farmId,
        areaUnit: 'mu',
        soilType: 'unknown',
        status: 'active',
        ...data,
      };
      memoryPlots = [plot, ...memoryPlots];
      return plot;
    }
  },
};
