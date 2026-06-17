// 天气数据
export interface Weather {
  city: string;
  temperature: number;
  status: 'sunny' | 'cloudy' | 'rainy';
  humidity: number;
  wind: string;
  airQuality: string;
}

// 活动记录
export interface Activity {
  id: string;
  icon: string;
  title: string;
  time: string;
  type: 'disease' | 'crop' | 'ai';
}

// 菜单项
export interface MenuItem {
  name: string;
  icon: string;
  target: string;
  isPlaceholder?: boolean;
}

// 农事建议
export interface FarmAdvice {
  icon: string;
  content: string;
}

// 种植统计
export interface PlantStats {
  totalCrops: number;
  totalDays: number;
}
