import type { ClimateInfo, FarmingSuggestion, WeatherType } from '../types';
import { API_BASE_URL } from './config';

const mockClimateInfo: ClimateInfo = {
  id: 'climate_001',
  location: {
    longitude: -99,
    latitude: -99,
    address: 'Fallback城市',
    city: 'Fallback城市',
  },
  date: '2026-06-16',
  temperature: -99,
  humidity: -99,
  wind: 'Fallback风',
  weatherType: 'sunny',
  airQuality: 'Fallback空气',
  solarTerm: 'Fallback节气',
  createdAt: '2026-06-16T06:00:00Z',
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
        };
        return climateInfo;
      }
      console.warn('[climateService] unexpected response, using fallback');
      return mockClimateInfo;
    } catch (error) {
      console.warn('[climateService] request failed, using fallback:', error);
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