import type { Weather, Activity, FarmAdvice, PlantStats } from '../types/home.types';

// 获取天气数据（Mock）
export const getWeather = (): Weather => {
  return {
    city: '广州市',
    temperature: 26,
    status: 'sunny',
    humidity: 65,
    wind: '东南风 2级',
    airQuality: '良',
  };
};

// 获取天气背景色
export const getWeatherBackgroundColor = (status: Weather['status']): string => {
  switch (status) {
    case 'sunny':
      return '#FFE082'; // 阳光金
    case 'cloudy':
      return '#90A4AE'; // 阴天灰
    case 'rainy':
      return '#78909C'; // 雨天灰蓝
    default:
      return '#FFE082';
  }
};

// 获取天气图标
export const getWeatherIcon = (status: Weather['status']): string => {
  switch (status) {
    case 'sunny':
      return '☀️';
    case 'cloudy':
      return '⛅';
    case 'rainy':
      return '🌧️';
    default:
      return '☀️';
  }
};

// 获取动态问候语
export const getGreeting = (): { greeting: string; advice: string } => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return {
      greeting: '早上好',
      advice: '🌱 今日宜播种',
    };
  } else if (hour >= 12 && hour < 14) {
    return {
      greeting: '中午好',
      advice: '☀️ 注意防暑降温',
    };
  } else if (hour >= 14 && hour < 18) {
    return {
      greeting: '下午好',
      advice: '🌿 适合田间巡查',
    };
  } else if (hour >= 18 && hour < 22) {
    return {
      greeting: '傍晚好',
      advice: '🌙 明日天气转晴',
    };
  } else {
    return {
      greeting: '晚上好',
      advice: '🌙 早点休息',
    };
  }
};

// 获取今日农事建议
export const getTodayAdvice = (): FarmAdvice => {
  const advices: FarmAdvice[] = [
    { icon: '💧', content: '未来6小时可能降雨，建议暂停露天施肥' },
    { icon: '☀️', content: '今日气温适宜，适合进行田间巡查' },
    { icon: '🌱', content: '当前是水稻分蘖关键期，注意保持水层' },
    { icon: '🐛', content: '近期蚜虫高发，建议加强田间监测' },
    { icon: '🌾', content: '玉米进入拔节期，建议追施氮肥' },
    { icon: '🌡️', content: '气温较高，注意防范作物热害' },
    { icon: '⛅', content: '明日多云转晴，适合喷洒农药' },
  ];
  
  return advices[Math.floor(Math.random() * advices.length)];
};

// 获取最近动态
export const getRecentActivities = (): Activity[] => {
  return [
    {
      id: '1',
      icon: '🔍',
      title: '识别到番茄晚疫病',
      time: '2分钟前',
      type: 'disease',
    },
    {
      id: '2',
      icon: '🌾',
      title: '添加了新作物：水稻',
      time: '15分钟前',
      type: 'crop',
    },
    {
      id: '3',
      icon: '💬',
      title: 'AI助手回答了你的问题',
      time: '1小时前',
      type: 'ai',
    },
  ];
};

// 获取种植统计
export const getPlantStats = (): PlantStats => {
  return {
    totalCrops: 3,
    totalDays: 76,
  };
};

// 获取未读消息数量
export const getUnreadCount = (): number => {
  return 2;
};
