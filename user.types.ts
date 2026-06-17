// 用户信息
export interface UserInfo {
  id: string;
  name: string;
  avatar: string;
  role: string;
  level: string;
  plantingDays: number;
}

// 统计数据
export interface UserStats {
  cropCount: number;
  recognitionCount: number;
  checkInDays: number;
  likesCount: number;
  todayTasks: number;
}

// 菜单项
export interface MenuItem {
  name: string;
  icon: string;
  target?: string;
  isPlaceholder?: boolean;
  badge?: string;
}

// 菜单分组
export interface MenuGroup {
  title: string;
  items: MenuItem[];
}
