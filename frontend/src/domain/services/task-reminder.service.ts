import type { TaskReminder, TaskStatus } from '../types';
import { API_BASE_URL } from './config';

const mockTasks: TaskReminder[] = [
  {
    id: 'task_001',
    userId: 'user_001',
    cropId: 'crop_001',
    cropName: '水稻',
    title: '施肥',
    description: '给水稻施分蘖肥，每亩复合肥20公斤',
    reminderTime: '2026-06-16T09:00:00Z',
    status: 'pending',
    createdAt: '2026-06-15T10:00:00Z',
    updatedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'task_002',
    userId: 'user_001',
    cropId: 'crop_002',
    cropName: '番茄',
    title: '病虫害防治',
    description: '检查番茄白粉病，喷洒防治药剂',
    reminderTime: '2026-06-16T14:00:00Z',
    status: 'pending',
    createdAt: '2026-06-15T10:00:00Z',
    updatedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'task_003',
    userId: 'user_001',
    cropId: 'crop_003',
    cropName: '玉米',
    title: '浇水',
    description: '给玉米地浇水，保持土壤湿度',
    reminderTime: '2026-06-16T16:00:00Z',
    status: 'pending',
    createdAt: '2026-06-15T10:00:00Z',
    updatedAt: '2026-06-15T10:00:00Z',
  },
];

// 字段适配：将后端 DTO 转为前端类型
const convertTask = (item: any): TaskReminder => {
  return {
    id: item.id,
    userId: item.userId,
    cropId: item.relatedCropId,
    cropName: item.relatedCropName,
    title: item.title,
    description: item.content,
    reminderTime: item.reminderTime,
    status: (item.status || 'pending') as TaskStatus,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

export const taskReminderService = {
  getTasks: async (userId?: string): Promise<TaskReminder[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.code === 200 && Array.isArray(result.data)) {
        const tasks: TaskReminder[] = (result.data as unknown[]).map(convertTask);
        if (userId) {
          return tasks.filter(task => task.userId === userId);
        }
        return tasks;
      }
      console.warn('[taskReminderService] unexpected response, using fallback');
      return mockTasks.filter(task => !userId || task.userId === userId);
    } catch (error) {
      console.warn('[taskReminderService] request failed, using fallback:', error);
      return mockTasks.filter(task => !userId || task.userId === userId);
    }
  },

  getTaskById: async (id: string): Promise<TaskReminder | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.code === 200 && result.data) {
        return convertTask(result.data);
      }
      console.warn('[taskReminderService] task not found, using fallback');
      return mockTasks.find(task => task.id === id) || null;
    } catch (error) {
      console.warn('[taskReminderService] request failed, using fallback:', error);
      return mockTasks.find(task => task.id === id) || null;
    }
  },

  updateTaskStatus: async (id: string, status: TaskStatus): Promise<TaskReminder | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (result.code === 200 && result.data) {
        return convertTask(result.data);
      }
      console.warn('[taskReminderService] update failed, using fallback');
      const index = mockTasks.findIndex(task => task.id === id);
      if (index === -1) return null;
      mockTasks[index] = {
        ...mockTasks[index],
        status,
        updatedAt: new Date().toISOString(),
      };
      return mockTasks[index];
    } catch (error) {
      console.warn('[taskReminderService] request failed, using fallback:', error);
      const index = mockTasks.findIndex(task => task.id === id);
      if (index === -1) return null;
      mockTasks[index] = {
        ...mockTasks[index],
        status,
        updatedAt: new Date().toISOString(),
      };
      return mockTasks[index];
    }
  },
};