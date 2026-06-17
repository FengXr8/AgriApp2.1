import type { PlantingLog, LogType } from '../types';
import { API_BASE_URL } from './config';

const mockLogs: PlantingLog[] = [
  {
    id: 'log_001',
    userId: 'user_001',
    cropId: 'crop_001',
    cropName: 'Fallback-水稻',
    logType: 'farming',
    recordDate: 'Fallback-date',
    content: 'Fallback-本地农事记录',
    images: [],
    createdAt: '2026-06-16T09:00:00Z',
  },
  {
    id: 'log_002',
    userId: 'user_001',
    cropId: 'crop_002',
    cropName: 'Fallback-番茄',
    logType: 'disease',
    recordDate: 'Fallback-date',
    content: 'Fallback-本地记录',
    images: [],
    createdAt: '2026-06-15T14:00:00Z',
  },
  {
    id: 'log_003',
    userId: 'user_001',
    cropId: 'crop_001',
    cropName: 'Fallback-水稻',
    logType: 'growth',
    recordDate: 'Fallback-date',
    content: 'Fallback-本地记录',
    images: [],
    createdAt: '2026-06-14T10:00:00Z',
  },
];

export interface PlantingLogCreateData {
  cropId: string;
  cropName: string;
  logType: LogType;
  recordDate: string;
  content: string;
  images?: string[];
}

// 转换后端数据到前端格式
const convertLog = (item: any): PlantingLog => {
  return {
    id: item.id,
    userId: item.userId,
    cropId: item.cropId,
    cropName: item.cropName,
    logType: item.logType,
    recordDate: item.recordDate ?? item.logDate,
    content: item.content,
    images: item.images ?? (item.imageUrl ? [item.imageUrl] : []),
    createdAt: item.createdAt,
  };
};

export const plantingLogService = {
  getLogsByCrop: async (cropId: string): Promise<PlantingLog[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/planting-logs/crop/${cropId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.code === 200 && Array.isArray(result.data)) {
        const logs = result.data.map(convertLog);
        return logs;
      }
      console.warn('[plantingLogService] unexpected response, using fallback');
      return mockLogs;
    } catch (error) {
      console.warn('[plantingLogService] request failed, using fallback:', error);
      return mockLogs;
    }
  },

  addLog: async (data: PlantingLogCreateData): Promise<PlantingLog> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/planting-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.code === 200 && result.data) {
        return convertLog(result.data);
      }
      console.warn('[plantingLogService] unexpected response, creating local mock');
      const newLog: PlantingLog = {
        id: `log_${Date.now()}`,
        userId: 'user_001',
        ...data,
        createdAt: new Date().toISOString(),
      };
      return newLog;
    } catch (error) {
      console.warn('[plantingLogService] request failed, creating local mock:', error);
      const newLog: PlantingLog = {
        id: `log_${Date.now()}`,
        userId: 'user_001',
        ...data,
        createdAt: new Date().toISOString(),
      };
      return newLog;
    }
  },
};
