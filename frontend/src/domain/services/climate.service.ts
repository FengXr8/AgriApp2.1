import type { ClimateInfo, FarmingSuggestion, WeatherAlert } from '../types';
import { API_BASE_URL } from './config';
import { getSolarTermInfo } from './solar-term.service';

const createMockClimateInfo = (): ClimateInfo => {
  const solarTermInfo = getSolarTermInfo();
  const today = new Date();
  const forecast = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return {
      date: `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      weatherType: (index % 3 === 0 ? 'cloudy' : index % 3 === 1 ? 'sunny' : 'rainy') as ClimateInfo['weatherType'],
      tempMin: [22, 23, 21, 24, 25, 23, 22][index],
      tempMax: [28, 30, 26, 31, 32, 29, 28][index],
      windDirection: '东南风',
    };
  });

  return {
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
  solarTerm: solarTermInfo.currentTerm.name,
  createdAt: '2026-06-16T06:00:00Z',
  province: '江苏省',
  district: '江宁区',
  aqi: 42,
  aqiLevel: '优',
  rainfall: 0.0,
  windSpeed: 12,
  windDirection: '东南风',
  updateTime: '2026-06-17T10:00:00',
  forecast,
  solarTermInfo,
  };
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

const mapClimateData = (data: any): ClimateInfo => {
  const solarTermInfo = getSolarTermInfo();
  return {
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
    solarTerm: data.solarTerm || solarTermInfo.currentTerm.name,
    createdAt: data.createdAt,
    province: data.province,
    district: data.district,
    aqi: data.aqi,
    aqiLevel: data.aqiLevel,
    rainfall: data.rainfall,
    windSpeed: data.windSpeed,
    windDirection: data.windDirection,
    updateTime: data.updateTime,
    visibility: data.visibility,
    pressure: data.pressure,
    pm25: data.pm25,
    forecast: data.forecast?.map((item: any) => ({
      date: item.date,
      weatherType: item.weatherType,
      tempMin: item.tempMin,
      tempMax: item.tempMax,
      windDirection: item.windDirection,
    })),
    solarTermInfo,
  };
};

export const climateService = {
  getCurrentWeather: async (location?: { city?: string; longitude?: number; latitude?: number; farmId?: string }): Promise<ClimateInfo> => {
    try {
      const params = new URLSearchParams();
      if (location?.city) params.append('city', location.city);
      if (typeof location?.longitude === 'number') params.append('longitude', String(location.longitude));
      if (typeof location?.latitude === 'number') params.append('latitude', String(location.latitude));
      if (location?.farmId) params.append('farmId', location.farmId);

      // 如果有 farmId，优先使用 weather-by-farm 接口
      if (location?.farmId) {
        const url = `${API_BASE_URL}/api/climate/weather-by-farm?farmId=${location.farmId}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const result = await response.json();
        if (result.code === 200 && result.data) {
          return mapClimateData(result.data);
        }
      }

      const queryString = params.toString();
      const url = `${API_BASE_URL}/api/climate/current${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      
      if (result.code === 200 && result.data) {
        return mapClimateData(result.data);
      }
      return createMockClimateInfo();
    } catch (error) {
      return createMockClimateInfo();
    }
  },

  getWeatherAlerts: async (location?: { longitude?: number; latitude?: number; farmId?: string }): Promise<WeatherAlert[]> => {
    try {
      const params = new URLSearchParams();
      if (typeof location?.longitude === 'number') params.append('longitude', String(location.longitude));
      if (typeof location?.latitude === 'number') params.append('latitude', String(location.latitude));
      if (location?.farmId) params.append('farmId', location.farmId);
      const queryString = params.toString();
      const response = await fetch(`${API_BASE_URL}/api/climate/alerts${queryString ? `?${queryString}` : ''}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.code === 200 && Array.isArray(result.data)) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.warn('[climateService] alerts request failed:', error);
      return [];
    }
  },

  getFarmingAdvice: async (location?: { city?: string; farmId?: string }, cropType?: string): Promise<FarmingSuggestion[]> => {
    try {
      const params = new URLSearchParams();
      if (location?.city) params.append('location', location.city);
      if (location?.farmId) params.append('farmId', location.farmId);
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

  searchCities: async (query: string): Promise<Array<{ id: string; name: string; province: string; city: string; district: string; longitude: number; latitude: number }>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/climate/city/search?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.code === 200 && Array.isArray(result.data)) {
        return result.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          province: item.province,
          city: item.city,
          district: item.district || item.name,
          longitude: Number(item.longitude),
          latitude: Number(item.latitude),
        }));
      }
      return [];
    } catch (error) {
      console.warn('[climateService] city search failed:', error);
      return [];
    }
  },
};
