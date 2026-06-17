import type { User, UserStats } from '../types';
import { API_BASE_URL } from './config';

export interface UserService {
  getCurrentUser: () => Promise<User>;
  getUserStats: () => Promise<UserStats>;
  login: (phone: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

// 本地 Mock 数据（fallback 用）
const mockUser: User = {
  id: '1',
  phone: '138****8888',
  role: 'farmer',
  status: 'authenticated',
  name: '李明',
  avatar: '👨‍🌾',
  plantingDays: 128,
  level: '初级农艺师',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-06-16T10:00:00Z',
};

const mockUserStats: UserStats = {
  cropCount: 5,
  recognitionCount: 23,
  checkInDays: 7,
  likesCount: 42,
  todayTasks: 3,
};

// 获取当前用户信息
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json();
    if (result.code === 200 && result.data) {
      return result.data as User;
    }
    console.warn('[userService] unexpected response code, using fallback');
    return mockUser;
  } catch (error) {
    console.warn('[userService] request failed, using fallback:', error);
    return mockUser;
  }
};

// 获取用户统计数据
export const getUserStats = async (): Promise<UserStats> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile/stats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json();
    if (result.code === 200 && result.data) {
      return result.data as UserStats;
    }
    console.warn('[userService] unexpected response code, using fallback');
    return mockUserStats;
  } catch (error) {
    console.warn('[userService] request failed, using fallback:', error);
    return mockUserStats;
  }
};

// 登录（Mock）
export const login = async (phone: string, password: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return getCurrentUser();
};

// 登出（Mock）
export const logout = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
};

export const userService: UserService = {
  getCurrentUser,
  getUserStats,
  login,
  logout,
};
