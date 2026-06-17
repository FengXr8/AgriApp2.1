import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

type HomeStackParamList = {
  HomeMain: undefined;
  FarmDetail: undefined;
};

export default function FarmDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

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
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>3</Text>
                <Text style={styles.statLabel}>作物数量</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>128</Text>
                <Text style={styles.statLabel}>种植天数</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>良</Text>
                <Text style={styles.statLabel}>空气质量</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="cloud" size={20} color="#4CAF50" />
              <Text style={styles.cardTitle}>实时数据</Text>
            </View>
            <Text style={styles.mockNote}>当前为 Mock 气候数据</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>26°</Text>
                <Text style={styles.statLabel}>温度</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>65%</Text>
                <Text style={styles.statLabel}>湿度</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>2级</Text>
                <Text style={styles.statLabel}>风力</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="warning-outline" size={20} color="#4CAF50" />
              <Text style={styles.cardTitle}>告警信息</Text>
            </View>
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
              <Text style={styles.emptyText}>暂无严重告警</Text>
            </View>
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  mockNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
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
  footerSpace: {
    height: 32,
  },
});
