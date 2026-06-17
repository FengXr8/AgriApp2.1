import type { RecognitionResult, RecognitionStatus, RecognitionHistoryItem, ControlSuggestion } from '../types';
import { API_BASE_URL } from './config';

// Fallback 数据，用于请求失败时使用
const fallbackResults: RecognitionResult[] = [
  {
    id: 'rec_001',
    userId: 'user_001',
    imageUri: 'mock://fallback1',
    status: 'completed',
    pestName: 'Fallback-番茄晚疫病',
    confidence: '95%',
    dangerLevel: 'high',
    createdAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'rec_002',
    userId: 'user_001',
    imageUri: 'mock://fallback2',
    status: 'completed',
    pestName: 'Fallback-水稻稻瘟病',
    confidence: '87%',
    dangerLevel: 'medium',
    createdAt: '2026-06-14T15:00:00Z',
  },
  {
    id: 'rec_003',
    userId: 'user_001',
    imageUri: 'mock://fallback3',
    status: 'completed',
    pestName: 'Fallback-玉米螟虫',
    confidence: '92%',
    dangerLevel: 'high',
    createdAt: '2026-06-13T09:00:00Z',
  },
];

const fallbackSuggestion: ControlSuggestion = {
  id: 'sug_fallback',
  recognitionId: '',
  pestName: '未知病害',
  measures: ['请咨询当地农业专家', '定期观察作物生长情况', '保持良好的田间管理'],
  medication: {
    name: '建议咨询',
    usage: '请咨询专家',
    dosage: '请咨询专家',
    notes: '请咨询专家',
  },
  precautions: ['注意观察病情变化', '及时隔离病株', '做好记录'],
  createdAt: new Date().toISOString(),
};

// 后端数据转换为前端格式
const convertResult = (item: any): RecognitionResult => {
  // 将 0.92 转换为 "92%"
  const confidenceStr = item.confidence != null
    ? `${Math.round(item.confidence * 100)}%`
    : '0%';

  // 根据置信度估算危险等级
  let dangerLevel: 'high' | 'medium' | 'low' = 'medium';
  if (item.confidence >= 0.9) {
    dangerLevel = 'high';
  } else if (item.confidence >= 0.75) {
    dangerLevel = 'medium';
  } else {
    dangerLevel = 'low';
  }

  return {
    id: item.id,
    userId: item.userId || 'user_001',
    imageUri: item.imageUrl || item.imageUri || '',
    status: item.status || 'completed',
    pestName: item.diseaseName || item.pestName || '未知病害',
    confidence: confidenceStr,
    dangerLevel,
    createdAt: item.createdAt,
  };
};

export interface RecognitionUploadResult {
  id: string;
  status: RecognitionStatus;
}

export const recognitionService = {
  uploadImage: async (imageUri: string, source: 'camera' | 'album' = 'camera'): Promise<RecognitionUploadResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recognitions/mock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUri, source }),
      });
      const result = await response.json();
      if (result.code === 200 && result.data) {
        return { id: result.data.id, status: result.data.status };
      }
      console.warn('[recognitionService] unexpected response, using fallback');
      return { id: `fallback_${Date.now()}`, status: 'completed' };
    } catch (error) {
      console.warn('[recognitionService] request failed, using fallback:', error);
      return { id: `fallback_${Date.now()}`, status: 'completed' };
    }
  },

  getResult: async (id: string): Promise<RecognitionResult | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recognitions/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.code === 200 && result.data) {
        return convertResult(result.data);
      }
      console.warn('[recognitionService] unexpected response, using fallback');
      return null;
    } catch (error) {
      console.warn('[recognitionService] request failed, using fallback:', error);
      return null;
    }
  },

  getSuggestion: async (recognitionId: string): Promise<ControlSuggestion> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recognitions/${recognitionId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.code === 200 && result.data?.suggestion) {
        const sug = result.data.suggestion;
        return {
          id: sug.suggestionId || '',
          recognitionId,
          pestName: sug.diseaseName || '',
          measures: sug.preventionMethods || [],
          medication: {
            name: sug.chemicalControls?.[0] || '建议咨询',
            usage: '详见农业专家建议',
            dosage: '详见农业专家建议',
            notes: sug.precautions || '',
          },
          precautions: sug.precautions ? [sug.precautions] : [],
          createdAt: sug.createdAt || new Date().toISOString(),
        };
      }
      console.warn('[recognitionService] no suggestion found, using fallback');
      return { ...fallbackSuggestion, recognitionId };
    } catch (error) {
      console.warn('[recognitionService] request failed, using fallback:', error);
      return { ...fallbackSuggestion, recognitionId };
    }
  },

  getHistory: async (userId?: string): Promise<RecognitionHistoryItem[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recognitions`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.code === 200 && Array.isArray(result.data)) {
        const converted = result.data.map(convertResult);
        return converted as RecognitionHistoryItem[];
      }
      console.warn('[recognitionService] unexpected response, using fallback');
      return fallbackResults as RecognitionHistoryItem[];
    } catch (error) {
      console.warn('[recognitionService] request failed, using fallback:', error);
      return fallbackResults as RecognitionHistoryItem[];
    }
  },
};