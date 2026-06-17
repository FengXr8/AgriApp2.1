import { useState, useEffect } from 'react';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ClimateInfo, FarmingSuggestion, PlantingLog } from '../../../domain/types';
import { climateService, cropService, plantingLogService } from '../../../domain/services';

type TabParamList = {
  '首页': undefined;
  'AI问答': undefined;
  '病虫害识别': undefined;
  '作物管理': undefined;
  '我的': undefined;
};

type HomeStackParamList = {
  HomeMain: undefined;
  FarmDetail: undefined;
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<TabParamList>>();
  const homeNavigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [weather, setWeather] = useState<ClimateInfo | null>(null);
  const [todayAdvice, setTodayAdvice] = useState<FarmingSuggestion | null>(null);
  const [activities, setActivities] = useState<PlantingLog[]>([]);
  const [plantStats, setPlantStats] = useState({ totalCrops: 0, totalDays: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [climate, advice, crops, logs] = await Promise.all([
          climateService.getCurrentWeather(),
          climateService.getFarmingAdvice(),
          cropService.getCrops(),
          plantingLogService.getLogsByCrop('crop_001'),
        ]);
        setWeather(climate);
        setTodayAdvice(advice[0] || null);
        setActivities(logs);
        setPlantStats({
          totalCrops: crops.length,
          totalDays: 128,
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了';
    if (hour < 12) return '早上好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const getWeatherIcon = (weatherType: string) => {
    switch (weatherType) {
      case 'sunny': return 'sunny';
      case 'cloudy': return 'cloudy';
      case 'rain': return 'rainy';
      case 'windy': return 'cloud';
      default: return 'partly-sunny';
    }
  };

  const handleNavigate = (screenName: string) => {
    if (screenName === 'log') {
      Alert.alert('提示', '农事记录功能开发中');
      return;
    }
    navigation.navigate(screenName as keyof TabParamList);
  };

  const handleViewDetail = () => {
    homeNavigation.navigate('FarmDetail');
  };

  const quickEntries = [
    { name: '病虫害识别', icon: 'bug' as const, target: '病虫害识别', color: '#4CAF50' },
    { name: 'AI问答', icon: 'chatbubble-ellipses' as const, target: 'AI问答', color: '#2196F3' },
    { name: '作物管理', icon: 'leaf' as const, target: '作物管理', color: '#FF9800' },
    { name: '农事记录', icon: 'document-text' as const, target: 'log', color: '#9C27B0' },
  ];

  if (loading) {
    return (
      <View style={styles.page}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#4CAF50', '#388E3C']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}，农户</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.weatherCard}>
            <View style={styles.weatherMain}>
              <View>
                <Text style={styles.city}>{weather?.location.city}</Text>
                <View style={styles.tempRow}>
                  <Ionicons name={getWeatherIcon(weather?.weatherType || '')} size={32} color="#fff" />
                  <Text style={styles.temperature}>{weather?.temperature}°</Text>
                </View>
                <Text style={styles.weatherType}>{weather?.weatherType === 'sunny' ? '晴天' : weather?.weatherType === 'cloudy' ? '多云' : weather?.weatherType === 'rain' ? '雨天' : '有风'}</Text>
              </View>
            </View>
            <View style={styles.weatherDetails}>
              <View style={styles.weatherInfo}>
                <Ionicons name="water-outline" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.weatherInfoText}>{weather?.humidity}%</Text>
              </View>
              <View style={styles.weatherInfo}>
                <Ionicons name="cloud-outline" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.weatherInfoText}>{weather?.wind}</Text>
              </View>
              <View style={styles.weatherInfo}>
                <Ionicons name="leaf-outline" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.weatherInfoText}>{weather?.airQuality}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.farmOverview}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>农场概况</Text>
            <TouchableOpacity onPress={handleViewDetail} style={styles.viewDetail}>
              <Text style={styles.viewDetailText}>查看详情</Text>
              <Ionicons name="chevron-forward" size={14} color="#4CAF50" />
            </TouchableOpacity>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{plantStats.totalCrops}</Text>
              <Text style={styles.statLabel}>作物数量</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{plantStats.totalDays}</Text>
              <Text style={styles.statLabel}>种植天数</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{todayAdvice ? 1 : 0}</Text>
              <Text style={styles.statLabel}>今日建议</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{weather?.airQuality || '--'}</Text>
              <Text style={styles.statLabel}>空气质量</Text>
            </View>
          </View>
        </View>

        <View style={styles.adviceCard}>
          <View style={styles.adviceHeader}>
            <Ionicons name="bulb-outline" size={20} color="#4CAF50" />
            <Text style={styles.adviceTitle}>今日农事建议</Text>
          </View>
          <Text style={styles.adviceContent} numberOfLines={2} ellipsizeMode="tail">
            {todayAdvice?.content || '暂无农事建议'}
          </Text>
        </View>

        <View style={styles.quickSection}>
          <Text style={styles.sectionTitle}>快捷入口</Text>
          <View style={styles.quickGrid}>
            {quickEntries.slice(0, 2).map((item) => (
              <TouchableOpacity
                key={item.name}
                style={styles.quickCard}
                onPress={() => handleNavigate(item.target)}
              >
                <View style={[styles.quickIconBg, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <Text style={styles.quickName}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.quickGrid, { marginTop: 12 }]}>
            {quickEntries.slice(2, 4).map((item) => (
              <TouchableOpacity
                key={item.name}
                style={styles.quickCard}
                onPress={() => handleNavigate(item.target)}
              >
                <View style={[styles.quickIconBg, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <Text style={styles.quickName}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>最近动态</Text>
          <View style={styles.activityList}>
            {activities.slice(0, 2).map((activity) => {
              const getActivityIcon = () => {
                switch (activity.logType) {
                  case 'disease': return 'bug-outline';
                  case 'farming': return 'leaf-outline';
                  case 'growth': return 'trending-up';
                  case 'weather': return 'cloud-outline';
                  default: return 'document-text-outline';
                }
              };
              return (
                <TouchableOpacity
                  key={activity.id}
                  style={styles.activityItem}
                  onPress={() => {
                    if (activity.logType === 'disease') {
                      handleNavigate('病虫害识别');
                    } else {
                      handleNavigate('作物管理');
                    }
                  }}
                >
                  <View style={styles.activityIcon}>
                    <Ionicons name={getActivityIcon()} size={20} color="#4CAF50" />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle} numberOfLines={1}>{activity.content}</Text>
                    <Text style={styles.activityTime}>{activity.recordDate}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#ccc" />
                </TouchableOpacity>
              );
            })}
          </View>
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
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  notificationButton: {
    padding: 8,
  },
  weatherCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 20,
  },
  weatherMain: {
    marginBottom: 16,
  },
  city: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  weatherType: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weatherInfoText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  farmOverview: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  viewDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailText: {
    fontSize: 13,
    color: '#4CAF50',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
  },
  adviceCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  adviceTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  adviceContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  quickSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quickIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  activitiesSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  activityIcon: {
    width: 36,
    height: 36,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#999',
  },
  footerSpace: {
    height: 32,
  },
});