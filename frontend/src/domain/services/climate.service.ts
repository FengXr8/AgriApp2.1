import type { ClimateInfo, FarmingSuggestion, WeatherType } from '../types';
import { API_BASE_URL } from './config';

const mockClimateInfo: ClimateInfo = {
  id: 'climate_001',
  location: {
    longitude: 118.9074,
    latitude: 31.9544,
    address: '江苏省南京市江宁区',
    city: '南京市',
  },
  date: '2026-06-16',
  temperature: 28,
  humidity: 65,
  wind: '东南风',
  weatherType: 'cloudy',
  airQuality: '良',
  solarTerm: '芒种',
  createdAt: '2026-06-16T06:00:00Z',
  province: '江苏省',
  district: '江宁区',
  aqi: 42,
  aqiLevel: '优',
  rainfall: 0.0,
  windSpeed: 12,
  windDirection: '东南风',
  updateTime: '2026-06-17T10:00:00',
  forecast: [
    { date: '今天', weatherType: 'cloudy', tempMin: 22, tempMax: 28, windDirection: '东南风' },
    { date: '明天', weatherType: 'sunny', tempMin: 23, tempMax: 30, windDirection: '南风' },
    { date: '后天', weatherType: 'rainy', tempMin: 21, tempMax: 26, windDirection: '东风' },
  ],
  solarTermInfo: {
    currentTerm: {
      name: '芒种',
      startDate: '2026-06-05',
      endDate: '2026-06-20',
      icon: '🌾',
      farmingTip: '芒种时节，适宜播种晚稻、移栽秧苗',
    },
    nextTerm: {
      name: '夏至',
      daysUntil: 5,
    },
  },
};

const mockFarmingSuggestions: FarmingSuggestion[] = [
  {
    id: 'fs_001',
    climateInfoId: 'climate_001',
    content: 'Fallback：今日天气晴朗，适合进行田间管理。建议：1. 及时浇水，保持土壤湿润；2. 检查作物病虫害情况；3. 根据作物生长阶段进行施肥。',
    cropTypes: ['水稻', '玉米', '蔬菜'],
    createdAt: '2026-06-16T06:00:00Z',
  },
];

const weatherTypes: WeatherType[] = ['sunny', 'cloudy', 'rain', 'windy'];

export const climateService = {
  getCurrentWeather: async (location?: { city?: string }): Promise<ClimateInfo> => {
    try {
      const url = location?.city
        ? `${API_BASE_URL}/api/climate/current?city=${encodeURIComponent(location.city)}`
        : `${API_BASE_URL}/api/climate/current`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      
      if (result.code === 200 && result.data) {
        const data = result.data;
        // 完整映射所有字段，包括新增的 solarTermInfo、forecast 等
        const climateInfo: ClimateInfo = {
          id: data.id,
          location: {
            longitude: data.longitude,
            latitude: data.latitude,
            address: data.address,
            city: data.city,
          },
          date: data.date,
          temperature: data.temperature,
          humidity: data.humidity,
          wind: data.wind,
          weatherType: data.weatherType,
          airQuality: data.airQuality,
          solarTerm: data.solarTerm,
          createdAt: data.createdAt,
          // 新增字段映射
          province: data.province,
          district: data.district,
          aqi: data.aqi,
          aqiLevel: data.aqiLevel,
          rainfall: data.rainfall,
          windSpeed: data.windSpeed,
          windDirection: data.windDirection,
          updateTime: data.updateTime,
          forecast: data.forecast?.map((item: any) => ({
            date: item.date,
            weatherType: item.weatherType,
            tempMin: item.tempMin,
            tempMax: item.tempMax,
            windDirection: item.windDirection,
          })),
          solarTermInfo: data.solarTermInfo ? {
            currentTerm: {
              name: data.solarTermInfo.currentTerm?.name,
              startDate: data.solarTermInfo.currentTerm?.startDate,
              endDate: data.solarTermInfo.currentTerm?.endDate,
              icon: data.solarTermInfo.currentTerm?.icon,
              farmingTip: data.solarTermInfo.currentTerm?.farmingTip,
            },
            nextTerm: {
              name: data.solarTermInfo.nextTerm?.name,
              daysUntil: data.solarTermInfo.nextTerm?.daysUntil,
            },
          } : undefined,
        };
        return climateInfo;
      }
      return mockClimateInfo;
    } catch (error) {
      return mockClimateInfo;
    }
  },

  getFarmingAdvice: async (location?: { city?: string }, cropType?: string): Promise<FarmingSuggestion[]> => {
    try {
      const params = new URLSearchParams();
      if (location?.city) params.append('location', location.city);
      if (cropType) params.append('cropType', cropType);
      const queryString = params.toString();
      const url = `${API_BASE_URL}/api/climate/farming-advice${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.code === 200 && result.data) {
  const rawAdviceList = Array.isArray(result.data)
    ? result.data
    : [result.data];

  return rawAdviceList.map((item: any): FarmingSuggestion => {
    const content =
      item.content ??
      [
        item.overallAdvice,
        item.weatherAlert,
        ...(Array.isArray(item.farmingActivities) ? item.farmingActivities : []),
        ...(Array.isArray(item.warnings) ? item.warnings : []),
      ]
        .filter(Boolean)
        .join('\n');

    return {
      ...item,
      content,
    } as FarmingSuggestion;
  });
}
      console.warn('[climateService] unexpected response, using fallback');
      return mockFarmingSuggestions;
    } catch (error) {
      console.warn('[climateService] request failed, using fallback:', error);
      return mockFarmingSuggestions;
    }
  },
};