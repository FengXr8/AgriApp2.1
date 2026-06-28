import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import type { ClimateInfo, FarmingSuggestion, SolarTermInfo, WeatherAlert, WeatherType } from '../../../domain/types';
import { climateService, farmSelectionService } from '../../../domain/services';
import { getSolarTermInfo } from '../../../domain/services/solar-term.service';

type HomeStackParamList = {
  HomeMain: undefined;
  FarmDetail: undefined;
  ClimateDetail: undefined;
};

function isSignificantAlert(alert: WeatherAlert): boolean {
  const severity = (alert.severity || '').toLowerCase();
  const color = (alert.severityColor || '').toLowerCase();
  return ['moderate', 'severe', 'extreme'].includes(severity)
    || ['yellow', 'orange', 'red'].includes(color);
}

function getAlertColor(alert?: WeatherAlert): string {
  const severity = (alert?.severity || '').toLowerCase();
  const color = (alert?.severityColor || '').toLowerCase();
  if (severity === 'extreme' || color === 'red') return '#D32F2F';
  if (severity === 'severe' || color === 'orange') return '#F57C00';
  if (severity === 'moderate' || color === 'yellow') return '#FBC02D';
  return '#E3F2FD';
}

function getAlertLevelLabel(alert: WeatherAlert): string {
  const severity = (alert.severity || '').toLowerCase();
  const color = (alert.severityColor || '').toLowerCase();
  if (severity === 'extreme' || color === 'red') return '红色预警';
  if (severity === 'severe' || color === 'orange') return '橙色预警';
  if (severity === 'moderate' || color === 'yellow') return '黄色预警';
  return '预警';
}

function formatForecastDate(date: string): string {
  const parts = String(date || '').split('-');
  return parts.length >= 3 ? `${parts[1]}-${parts[2]}` : String(date || '--');
}

function formatClimateAddress(climate: ClimateInfo | null): string {
  const province = climate?.province || '';
  const city = climate?.location?.city || '';
  const district = climate?.district || '';
  const parts = [province, city, district].filter(Boolean);
  return parts.length > 0 ? parts.join('-') : '未知位置';
}

export default function ClimateDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [climate, setClimate] = useState<ClimateInfo | null>(null);
  const [advice, setAdvice] = useState<FarmingSuggestion | null>(null);
  const [solarTerm, setSolarTerm] = useState<SolarTermInfo | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFarmSelection, setHasFarmSelection] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const savedSelection = farmSelectionService.getSelection();
        if (!savedSelection?.farmId) {
          setHasFarmSelection(false);
          setClimate(null);
          setAdvice(null);
          setAlerts([]);
          setSolarTerm(getSolarTermInfo());
          setLoading(false);
          return;
        }

        setHasFarmSelection(true);
        const location = { farmId: savedSelection.farmId };
        const [climateData, adviceData, alertData] = await Promise.all([
          climateService.getCurrentWeather(location),
          climateService.getFarmingAdvice(location),
          climateService.getWeatherAlerts(location),
        ]);

        setClimate(climateData);
        setAdvice(adviceData[0] || null);
        setAlerts(alertData);
        setSolarTerm(climateData.solarTermInfo || getSolarTermInfo());
      } catch (error) {
        console.error('Failed to fetch climate data:', error);
        setClimate(null);
        setAdvice(null);
        setAlerts([]);
        setSolarTerm(getSolarTermInfo());
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const significantAlerts = useMemo(() => alerts.filter(isSignificantAlert), [alerts]);
  const primaryAlert = significantAlerts[0];

  const getWeatherIcon = (weatherType: WeatherType | string) => {
    switch (weatherType) {
      case 'sunny': return 'sunny';
      case 'cloudy': return 'cloudy';
      case 'rain':
      case 'rainy': return 'rainy';
      case 'windy': return 'flag';
      case 'fog': return 'cloud';
      case 'snow': return 'snow';
      default: return 'partly-sunny';
    }
  };

  const getWeatherText = (weatherType: WeatherType | string) => {
    switch (weatherType) {
      case 'sunny': return '晴天';
      case 'cloudy': return '多云';
      case 'rain':
      case 'rainy': return '雨天';
      case 'windy': return '大风';
      case 'fog': return '雾天';
      case 'snow': return '雪天';
      default: return '未知';
    }
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
        <Text style={styles.headerTitle}>农场天气</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.weatherGradient}>
          <View style={styles.weatherCardInner}>
            <Text style={styles.city}>{hasFarmSelection ? formatClimateAddress(climate) : '请选择农场'}</Text>
            <View style={styles.tempRow}>
              <Ionicons name={getWeatherIcon(hasFarmSelection ? climate?.weatherType || '' : '')} size={40} color="#fff" />
              <Text style={styles.temperature}>{hasFarmSelection ? climate?.temperature ?? '--' : '--'}°</Text>
            </View>
            <Text style={styles.weatherType}>{hasFarmSelection ? getWeatherText(climate?.weatherType || '') : '暂无农场天气'}</Text>
            <View style={styles.weatherDetails}>
              <View style={styles.weatherInfo}>
                <Ionicons name="water-outline" size={16} color="rgba(255,255,255,0.85)" />
                <Text style={styles.weatherInfoText}>{climate?.humidity ?? '--'}%</Text>
              </View>
              <View style={styles.weatherInfo}>
                <Ionicons name="navigate-outline" size={16} color="rgba(255,255,255,0.85)" />
                <Text style={styles.weatherInfoText}>{climate?.windDirection || climate?.wind || '--'}</Text>
              </View>
              <View style={styles.weatherInfo}>
                <Ionicons name="leaf-outline" size={16} color="rgba(255,255,255,0.85)" />
                <Text style={styles.weatherInfoText}>{climate?.airQuality || '--'}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={[styles.alertCard, { backgroundColor: getAlertColor(primaryAlert) }]}>
            <View style={styles.alertCardHeader}>
              <Ionicons name="warning-outline" size={20} color={primaryAlert ? '#fff' : '#455A64'} />
              <Text style={[styles.alertCardTitle, { color: primaryAlert ? '#fff' : '#455A64' }]}>天气预警</Text>
            </View>
            {significantAlerts.length > 0 ? (
              <View>
                {significantAlerts.map((alert) => (
                  <View key={alert.id || alert.alertSourceId || alert.headline} style={styles.alertItem}>
                    <Text style={styles.alertBadgeText}>{getAlertLevelLabel(alert)}</Text>
                    <View style={styles.alertInfo}>
                      <Text style={styles.alertTitleWhite}>{alert.headline || alert.eventTypeName || '天气预警'}</Text>
                      <Text style={styles.alertSourceWhite}>来源：{alert.senderName || '和风天气官方预警数据'}</Text>
                      {alert.description ? <Text style={styles.alertDescWhite}>{alert.description}</Text> : null}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.alertEmptyText}>无</Text>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="speedometer-outline" size={20} color="#4CAF50" />
              <Text style={styles.cardTitle}>天气详情</Text>
            </View>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="water" size={24} color="#4CAF50" />
                <Text style={styles.detailLabel}>湿度</Text>
                <Text style={styles.detailValue}>{climate?.humidity ?? '--'}%</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="navigate" size={24} color="#4CAF50" />
                <Text style={styles.detailLabel}>风向</Text>
                <Text style={styles.detailValue}>{climate?.windDirection || climate?.wind || '--'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="speedometer" size={24} color="#4CAF50" />
                <Text style={styles.detailLabel}>风速</Text>
                <Text style={styles.detailValue}>{climate?.windSpeed ?? '--'} km/h</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="leaf" size={24} color="#4CAF50" />
                <Text style={styles.detailLabel}>AQI</Text>
                <Text style={styles.detailValue}>{climate?.aqi ?? '--'} ({climate?.aqiLevel || '--'})</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="rainy" size={24} color="#4CAF50" />
                <Text style={styles.detailLabel}>降雨量</Text>
                <Text style={styles.detailValue}>{climate?.rainfall ?? 0} mm</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="cloud" size={24} color="#4CAF50" />
                <Text style={styles.detailLabel}>空气质量</Text>
                <Text style={styles.detailValue}>{climate?.airQuality || '--'}</Text>
              </View>
            </View>
          </View>

          {solarTerm ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="sunny" size={20} color="#4CAF50" />
                <Text style={styles.cardTitle}>节气信息</Text>
              </View>
              <View style={styles.currentTermSection}>
                <Text style={styles.termName}>{solarTerm.currentTerm.name}</Text>
                <Text style={styles.termDateRange}>{solarTerm.currentTerm.dateRange}</Text>
              </View>
              {solarTerm.currentTerm.farmingTip ? (
                <Text style={styles.termProverb}>{solarTerm.currentTerm.farmingTip}</Text>
              ) : null}
              <View style={styles.divider} />
              <View style={styles.nextTermSection}>
                <View style={styles.nextTermInfo}>
                  <Text style={styles.nextTermLabel}>距离下一节气</Text>
                  <Text style={styles.nextTermDays}>还有 {solarTerm.nextTerm.daysUntil} 天</Text>
                </View>
                <Text style={styles.nextTermName}>{solarTerm.nextTerm.name}</Text>
              </View>
            </View>
          ) : null}

          {climate?.forecast?.length ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
                <Text style={styles.cardTitle}>未来七天天气预报</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.forecastScroll}
                contentContainerStyle={styles.forecastContent}
              >
                {climate.forecast.map((item, index) => (
                  <View key={`${item.date}-${index}`} style={styles.forecastItem}>
                    <Text style={styles.forecastDate}>{formatForecastDate(item.date)}</Text>
                    <Ionicons name={getWeatherIcon(item.weatherType)} size={28} color="#4CAF50" />
                    <Text style={styles.forecastText}>{getWeatherText(item.weatherType)}</Text>
                    <Text style={styles.forecastTemp}>{item.tempMin}°~{item.tempMax}°</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {advice ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="bulb-outline" size={20} color="#4CAF50" />
                <Text style={styles.cardTitle}>今日农事建议</Text>
              </View>
              {advice.overallAdvice ? <Text style={styles.overallAdvice}>{advice.overallAdvice}</Text> : null}
              {advice.farmingActivities?.length ? (
                <View style={styles.activitiesSection}>
                  <Text style={styles.activitiesTitle}>农事活动</Text>
                  {advice.farmingActivities.map((activity, index) => (
                    <Text key={`${activity}-${index}`} style={styles.activityItem}>• {activity}</Text>
                  ))}
                </View>
              ) : null}
              {advice.warnings?.length ? (
                <View style={styles.warningsSection}>
                  <Text style={styles.warningsTitle}>注意事项</Text>
                  {advice.warnings.map((warning, index) => (
                    <Text key={`${warning}-${index}`} style={styles.warningItem}>• {warning}</Text>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        <Text style={styles.dataSource}>数据来源：和风天气</Text>
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
  headerSpacer: {
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
  weatherCardInner: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 20,
  },
  city: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
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
  termProverb: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 12,
    paddingHorizontal: 4,
    fontStyle: 'italic',
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
  nextTermName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  forecastScroll: {
    marginTop: 8,
  },
  forecastContent: {
    paddingRight: 8,
    columnGap: 10,
  },
  forecastItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    width: 96,
  },
  forecastDate: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  forecastText: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
    marginBottom: 2,
  },
  forecastTemp: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 2,
  },
  alertCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  alertCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  alertItem: {
    marginBottom: 12,
  },
  alertBadgeText: {
    alignSelf: 'flex-start',
    fontSize: 13,
    color: '#fff',
    fontWeight: 'bold',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  alertInfo: {
    flex: 1,
  },
  alertTitleWhite: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  alertSourceWhite: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  alertDescWhite: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  alertEmptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#455A64',
    textAlign: 'center',
    paddingVertical: 16,
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
  dataSource: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
});
