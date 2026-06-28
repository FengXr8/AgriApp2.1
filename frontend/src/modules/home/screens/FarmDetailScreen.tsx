import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { ClimateInfo, WeatherAlert, Farm } from '../../../domain/types';
import { climateService, farmService, farmSelectionService, cropService } from '../../../domain/services';

type HomeStackParamList = {
  HomeMain: undefined;
  FarmDetail: undefined;
};

function isSignificantAlert(alert: WeatherAlert): boolean {
  const severity = (alert.severity || '').toLowerCase();
  const color = (alert.severityColor || '').toLowerCase();
  return ['moderate', 'severe', 'extreme', 'major'].includes(severity)
    || ['yellow', 'orange', 'red'].includes(color);
}

function getAlertLevelLabel(alert: WeatherAlert): string {
  const severity = (alert.severity || '').toLowerCase();
  const color = (alert.severityColor || '').toLowerCase();
  if (severity === 'extreme' || color === 'red') return '红色预警';
  if (severity === 'severe' || severity === 'major' || color === 'orange') return '橙色预警';
  if (severity === 'moderate' || color === 'yellow') return '黄色预警';
  return '预警';
}

function getAlertColor(alert: WeatherAlert): string {
  const severity = (alert.severity || '').toLowerCase();
  const color = (alert.severityColor || '').toLowerCase();
  if (severity === 'extreme' || color === 'red') return '#D32F2F';
  if (severity === 'severe' || severity === 'major' || color === 'orange') return '#F57C00';
  if (severity === 'moderate' || color === 'yellow') return '#FBC02D';
  return '#FF9800';
}

function formatFarmAddress(farm: Farm | null): string {
  const parts = [farm?.province, farm?.city, farm?.district].filter(Boolean);
  return parts.length > 0 ? parts.join('-') : '未知位置';
}

export default function FarmDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [currentFarm, setCurrentFarm] = useState<Farm | null>(null);
  const [climate, setClimate] = useState<ClimateInfo | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [cropCount, setCropCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const selection = farmSelectionService.getSelection();
        const farms = await farmService.getFarms();
        const selectedFarm = selection?.farmId
          ? farms.find(farm => farm.id === selection.farmId)
          : farms[0];

        if (!selection?.farmId && selectedFarm) {
          farmSelectionService.setSelection({ farmId: selectedFarm.id });
        }

        setCurrentFarm(selectedFarm || null);

        if (selectedFarm) {
          const location = {
            city: selectedFarm.city,
            longitude: selectedFarm.longitude,
            latitude: selectedFarm.latitude,
          };

          const [climateData, alertData, crops] = await Promise.all([
            climateService.getCurrentWeather(location),
            climateService.getWeatherAlerts(location),
            cropService.getCrops(),
          ]);

          setClimate(climateData);
          setAlerts(alertData);
          setCropCount(crops.filter(crop => crop.farmId === selectedFarm.id).length || crops.length);
        }
      } catch (error) {
        console.error('[FarmDetailScreen] 获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const significantAlerts = alerts.filter(isSignificantAlert);

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#4CAF50';
    if (aqi <= 100) return '#FFB300';
    if (aqi <= 150) return '#FF9800';
    if (aqi <= 200) return '#F44336';
    return '#9C27B0';
  };

  if (loading) {
    return (
      <View style={styles.page}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>农场详情</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="leaf" size={20} color="#4CAF50" />
              <Text style={styles.cardTitle}>农场概况</Text>
            </View>
            {currentFarm ? (
              <View style={styles.farmInfo}>
                <Text style={styles.farmName}>{currentFarm.name}</Text>
                <Text style={styles.farmLocation}>{formatFarmAddress(currentFarm)}</Text>
              </View>
            ) : null}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{cropCount}</Text>
                <Text style={styles.statLabel}>作物数量</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{currentFarm?.area || '--'}</Text>
                <Text style={styles.statLabel}>面积(亩)</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: getAQIColor(climate?.aqi || 0) }]}>
                  {climate?.airQuality || '--'}
                </Text>
                <Text style={styles.statLabel}>空气质量</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="cloud" size={20} color="#4CAF50" />
              <Text style={styles.cardTitle}>实时数据</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{climate?.temperature ?? '--'}°</Text>
                <Text style={styles.statLabel}>温度</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{climate?.humidity ?? '--'}%</Text>
                <Text style={styles.statLabel}>湿度</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValueSmall}>{climate?.windSpeed ?? '--'} km/h</Text>
                <Text style={styles.statLabel}>风速</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValueSmall}>{climate?.windDirection || climate?.wind || '--'}</Text>
                <Text style={styles.statLabel}>风向</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValueSmall}>{climate?.rainfall ?? 0} mm</Text>
                <Text style={styles.statLabel}>降雨量</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValueSmall}>{climate?.aqi || '--'}</Text>
                <Text style={styles.statLabel}>AQI</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="warning-outline" size={20} color="#FF9800" />
              <Text style={styles.cardTitle}>天气预警</Text>
            </View>
            {significantAlerts.length > 0 ? (
              <View>
                {significantAlerts.map((alert) => (
                  <View key={alert.id || alert.alertSourceId || alert.headline} style={styles.alertItem}>
                    <View style={[styles.alertBadge, { backgroundColor: getAlertColor(alert) }]}>
                      <Text style={styles.alertSeverity}>{getAlertLevelLabel(alert)}</Text>
                    </View>
                    <View style={styles.alertContent}>
                      <Text style={styles.alertTitle}>{alert.headline || alert.eventTypeName || '天气预警'}</Text>
                      <Text style={styles.alertSource}>来源：{alert.senderName || '和风天气官方预警数据'}</Text>
                      {alert.description ? <Text style={styles.alertDesc}>{alert.description}</Text> : null}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
                <Text style={styles.emptyText}>暂无严重天气预警</Text>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="checkbox-outline" size={20} color="#4CAF50" />
              <Text style={styles.cardTitle}>今日任务</Text>
            </View>
            <View style={styles.emptyState}>
              <Ionicons name="construct-outline" size={32} color="#999" />
              <Text style={styles.emptyText}>任务功能开发中</Text>
            </View>
          </View>
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
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
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
  farmInfo: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  farmName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  farmLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statValueSmall: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  alertItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  alertBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  alertSeverity: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  alertSource: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  alertDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
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
