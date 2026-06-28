// 天气类型枚举
export type WeatherType = 'sunny' | 'cloudy' | 'rain' | 'rainy' | 'windy' | 'fog' | 'snow';

export interface Location {
  longitude: number;
  latitude: number;
  address: string;
  city: string;
}

// 天气预报接口
export interface Forecast {
  date: string;            // 日期（今天/明天/后天）
  weatherType: WeatherType; // 天气类型
  tempMin: number;         // 最低温度
  tempMax: number;         // 最高温度
  windDirection: string;   // 风向
}

// 节气信息接口
export interface SolarTermInfo {
  currentTerm: {
    name: string;           // 节气名称（如：芒种）
    startDate: string;      // 开始日期（如：2026-06-05）
    endDate: string;        // 结束日期（如：2026-06-20）
    dateRange: string;      // 展示用时间范围（如：6月5日 - 6月20日）
    dayIndex?: number;      // 当前是本节气第几天
    icon?: string;          // 节气图标（如：🌾）
    farmingTip: string;     // 节气农业相关提示
  };
  nextTerm: {
    name: string;           // 下一节气名称（如：夏至）
    date: string;           // 下一节气日期（如：2026-06-21）
    daysUntil: number;      // 距离天数（如：5）
  };
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

  // 扩展字段
  province?: string;       // 省份
  district?: string;       // 区县
  aqi?: number;            // AQI指数
  aqiLevel?: string;       // AQI等级
  rainfall?: number;       // 降雨量
  windSpeed?: number;      // 风速
  windDirection?: string;  // 风向
  visibility?: number;     // 能见度（公里）
  pressure?: number;       // 大气压强（百帕）
  pm25?: number;           // PM2.5浓度
  updateTime?: string;     // 更新时间
  forecast?: Forecast[];   // 天气预报
  solarTermInfo?: SolarTermInfo; // 节气详细信息
}

export interface WeatherAlert {
  id: string;
  alertSourceId?: string;
  senderName?: string;
  eventTypeName?: string;
  eventTypeCode?: string;
  severity?: string;
  severityColor?: string;
  headline?: string;
  description?: string;
  instruction?: string;
  issuedTime?: string;
  effectiveTime?: string;
  onsetTime?: string;
  expireTime?: string;
  status?: string;
}

// 农事建议接口
export interface FarmingSuggestion {
  id: string;
  climateInfoId: string;
  content: string;
  cropTypes?: string[];
  createdAt: string;

  // 扩展字段（后端返回）
  date?: string;
  location?: string;
  cropType?: string;
  weatherAlert?: string;
  farmingActivities?: string[];
  warnings?: string[];
  overallAdvice?: string;
}
