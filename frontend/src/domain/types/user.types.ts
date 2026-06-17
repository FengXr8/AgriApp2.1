export type UserRole = 'farmer' | 'enterprise' | 'researcher';

export type UserStatus = 'registered' | 'authenticated';

export interface User {
  id: string;
  phone: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  name: string;
  avatar: string;
  plantingDays: number;
  level: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  cropCount: number;
  recognitionCount: number;
  checkInDays: number;
  likesCount: number;
  todayTasks: number;
}