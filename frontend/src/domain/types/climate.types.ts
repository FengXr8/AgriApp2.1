export type WeatherType = 'sunny' | 'cloudy' | 'rain' | 'windy' | 'fog' | 'snow';

export interface Location {
  longitude: number;
  latitude: number;
  address: string;
  city: string;
}

export interface ClimateInfo {
  id: string;
  location: Location;
  date: string;
  temperature: number;
  humidity: number;
  wind: string;
  weatherType: WeatherType;
  airQuality: string;
  solarTerm?: string;
  createdAt: string;
}

export interface FarmingSuggestion {
  id: string;
  climateInfoId: string;
  content: string;
  cropTypes?: string[];
  createdAt: string;
}