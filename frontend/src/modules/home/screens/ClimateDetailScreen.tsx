import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import type { ClimateInfo, FarmingSuggestion, WeatherType } from '../../../domain/types';
import { climateService } from '../../../domain/services';

type HomeStackParamList = {
  HomeMain: undefined;
  FarmDetail: undefined;
  ClimateDetail: undefined;
};

export default function ClimateDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [climate, setClimate] = useState<ClimateInfo | null>(null);
  const [advice, setAdvice] = useState<FarmingSuggestion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const climateData = await climateService.getCurrentWeather();
      setClimate(climateData);

      const adviceData = await climateService.getFarmingAdvice();
      setAdvice(adviceData[0]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getWeatherIcon = (weatherType: WeatherType | string) => {
    switch (weatherType) {
      case 'sunny': return 'sunny';
      case 'cloudy': return 'cloudy';
      case 'rain': return 'rainy';
      case 'rainy': return 'rainy';
      case 'windy': return 'cloud';
      case 'fog': return 'cloud';
      case 'snow': return 'snow';
      default: return 'partly-sunny';
    }
  };

  const getWeatherText = (weatherType: WeatherType | string) => {
    switch (weatherType) {
      case 'sunny': return '晴天';
      case 'cloudy': return '多云';
      case 'rain': return '雨天';
      case 'rainy': return '雨天';
      case 'windy': return '大风';
      case 'fog': return '雾天';
      case 'snow': return '雪天';
      default: return '未知';
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const formatDate = (date: Date) => `${date.getMonth() + 1}月${date.getDate()}日`;
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>天气详情</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 实时天气卡片 - 独立绿色渐变背景 */}
        <LinearGradient
          colors={['#4CAF50', '#2E7D32']}
          style={styles.weatherGradient}
        >
          <View style={styles.weatherCardInner}>
            <View style={styles.cityRow}>
              <Text style={styles.city}>{climate?.location?.city || '未知'} · {climate?.district || ''}</Text>
            </View>
            <View style={styles.tempRow}>
              <Ionicons name={getWeatherIcon(climate?.weatherType || '')} size={40} color="#fff" />
              <Text style={styles.temperature}>{climate?.temperature}°</Text>
            </View>
            <Text style={styles.weatherType}>{getWeatherText(climate?.weatherType || '')}</Text>
            <View style={styles.weatherDetails}>
              <View style={styles.weatherInfo}>
                <Ionicons name="water-outline" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.weatherInfoText}>{climate?.humidity}%</Text>
              </View>
              <View style={styles.weatherInfo}>
                <Ionicons name="navigate-outline" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.weatherInfoText}>{climate?.windDirection || climate?.wind}</Text>
              </View>
              <View style={styles.weatherInfo}>
                <Ionicons name="cloud-outline" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.weatherInfoText}>{climate?.airQuality}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* 天气详情信息 */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="speedometer-outline" size={20} color="#4CAF50" />
              <Text style={styles.cardTitle}>天气详情</Text>
            </View>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="water" size={24} color="#4CAF50" />
                <Text style={styles.detailLabel}>湿度</Text>
                <Text style={styles.detailValue}>{climate?.humidity}%</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="navigate" size={24} color="#4CAF50" />
                <Text style={styles.detailLabel}>风向</Text>
                <Text style={styles.detailValue}>{climate?.windDirection || climate?.wind}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="speedometer" size={24} color="#4CAF50" />
                <Text style={styles.detailLabel}>风速</Text>
                <Text style={styles.detailValue}>{climate?.windSpeed || '--'} km/h</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="leaf" size={24} color="#4CAF50" />
                <Text style={styles.detailLabel}>AQI</Text>
                <Text style={styles.detailValue}>{climate?.aqi || '--'} ({climate?.aqiLevel || '--'})</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="rainy" size={24} color="#4CAF50" />
                <Text style={styles.detailLabel}>降雨量</Text>
                <Text style={styles.detailValue}>{climate?.rainfall || 0} mm</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="cloud" size={24} color="#4CAF50" />
                <Text style={styles.detailLabel}>空气质量</Text>
                <Text style={styles.detailValue}>{climate?.airQuality}</Text>
              </View>
            </View>
          </View>

          {/* 节气卡片 */}
          {climate?.solarTermInfo && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="sunny" size={20} color="#4CAF50" />
                <Text style={styles.cardTitle}>节气信息</Text>
              </View>
              
              <View style={styles.currentTermSection}>
                <Text style={styles.termIcon}>{climate.solarTermInfo.currentTerm.icon || '🌾'}</Text>
                <Text style={styles.termName}>{climate.solarTermInfo.currentTerm.name}</Text>
                <Text style={styles.termDateRange}>
                  {formatDateRange(climate.solarTermInfo.currentTerm.startDate, climate.solarTermInfo.currentTerm.endDate)}
                </Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.nextTermSection}>
                <View style={styles.nextTermInfo}>
                  <Text style={styles.nextTermLabel}>距离下一节气</Text>
                  <Text style={styles.nextTermDays}>还有 {climate.solarTermInfo.nextTerm.daysUntil} 天</Text>
                </View>
                <View style={styles.nextTermDetail}>
                  <Text style={styles.nextTermName}>{climate.solarTermInfo.nextTerm.name}</Text>
                </View>
              </View>
              
              {climate.solarTermInfo.currentTerm.farmingTip && (
                <Text style={styles.termTip}>{climate.solarTermInfo.currentTerm.farmingTip}</Text>
              )}
            </View>
          )}

          {/* 天气预报卡片 */}
          {climate?.forecast && climate.forecast.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
                <Text style={styles.cardTitle}>未来三天天气预报</Text>
              </View>
              {climate.forecast.map((item: any, index: number) => (
                <View key={index} style={styles.forecastItem}>
                  <Text style={styles.forecastDate}>{item.date}</Text>
                  <Ionicons name={getWeatherIcon(item.weatherType)} size={24} color="#4CAF50" />
                  <Text style={styles.forecastTemp}>{item.tempMin}° - {item.tempMax}°</Text>
                  <Text style={styles.forecastWind}>{item.windDirection}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 天气预警卡片 */}
          {advice?.weatherAlert && (
            <View style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <Ionicons name="warning" size={20} color="#FF9800" />
                <Text style={styles.alertTitle}>天气预警</Text>
              </View>
              <Text style={styles.alertContent}>{advice.weatherAlert}</Text>
            </View>
          )}

          {/* 农事建议卡片 */}
          {advice && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="bulb-outline" size={20} color="#4CAF50" />
                <Text style={styles.cardTitle}>今日农事建议</Text>
              </View>
              
              {advice.overallAdvice && (
                <Text style={styles.overallAdvice}>{advice.overallAdvice}</Text>
              )}
              
              {advice.farmingActivities && advice.farmingActivities.length > 0 && (
                <View style={styles.activitiesSection}>
                  <Text style={styles.activitiesTitle}>农事活动</Text>
                  {advice.farmingActivities.map((activity: string, index: number) => (
                    <Text key={index} style={styles.activityItem}>• {activity}</Text>
                  ))}
                </View>
              )}
              
              {advice.warnings && advice.warnings.length > 0 && (
                <View style={styles.warningsSection}>
                  <Text style={styles.warningsTitle}>注意事项</Text>
                  {advice.warnings.map((warning: string, index: number) => (
                    <Text key={index} style={styles.warningItem}>⚠️ {warning}</Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.footerSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4CAF50',
    padding: 16,
    paddingTop: 48,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  weatherGradient: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
  },
  weatherCard: {
    // 这个样式不再使用，保持兼容性
  },
  weatherCardInner: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 20,
  },
  weatherMain: {
    alignItems: 'center',
  },
  cityRow: {
    width: '100%',
    marginBottom: 16,
  },
  city: {
    fontSize: 16,
    color: '#fff',
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  weatherType: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 16,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherInfoText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 4,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '33%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  currentTermSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  termIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  termName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  termDateRange: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  nextTermSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nextTermInfo: {
    flex: 1,
  },
  nextTermLabel: {
    fontSize: 12,
    color: '#666',
  },
  nextTermDays: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 4,
  },
  nextTermDetail: {
    alignItems: 'flex-end',
  },
  nextTermName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  termTip: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  forecastDate: {
    fontSize: 14,
    color: '#333',
    width: 60,
  },
  forecastTemp: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  forecastWind: {
    fontSize: 12,
    color: '#999',
    width: 60,
    textAlign: 'right',
  },
  alertCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  alertContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  overallAdvice: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 16,
  },
  activitiesSection: {
    marginBottom: 12,
  },
  activitiesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 8,
  },
  activityItem: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 4,
  },
  warningsSection: {
    marginTop: 8,
  },
  warningsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
    marginBottom: 8,
  },
  warningItem: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 4,
  },
  footerSpace: {
    height: 32,
  },
});