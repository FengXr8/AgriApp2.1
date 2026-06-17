import { useState, useCallback } from 'react';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { User, UserStats } from '../../../domain/types';
import type { MenuGroup } from '../types/profile.types';
import { userService, taskReminderService } from '../../../domain/services';
import { useFocusEffect } from '@react-navigation/native';

type TabParamList = {
  '首页': undefined;
  'AI问答': undefined;
  '病虫害识别': undefined;
  '作物管理': undefined;
  '我的': undefined;
};

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp<TabParamList>>();
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [pendingTaskCount, setPendingTaskCount] = useState(0);
  const [unreadCount] = useState(0);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
  useCallback(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const [user, userStats, tasks] = await Promise.all([
          userService.getCurrentUser(),
          userService.getUserStats(),
          taskReminderService.getTasks(),
        ]);

        const pendingCount = tasks.filter(task => task.status === 'pending').length;

        setUserInfo(user);
        setStats(userStats);
        setPendingTaskCount(pendingCount);
      } catch (error) {
        console.error('[ProfileScreen] Failed to fetch profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [])
);

  const menuGroups: MenuGroup[] = [
    {
      title: '个人管理',
      items: [
        { name: '我的作物', icon: 'leaf', target: '作物管理' },
        { name: '识别历史', icon: 'scan', target: '病虫害识别', isPlaceholder: true },
        { name: '我的收藏', icon: 'heart', isPlaceholder: true },
      ],
    },
    {
      title: '工具与服务',
      items: [
        { name: '农事日历', icon: 'calendar', isPlaceholder: true },
        { name: '离线数据', icon: 'cloud-download', isPlaceholder: true },
        { name: '我的二维码', icon: 'qr-code', isPlaceholder: true, badge: 'NEW' },
      ],
    },
    {
      title: '设置与帮助',
      items: [
        { name: '系统设置', icon: 'settings', isPlaceholder: true },
        { name: '帮助中心', icon: 'help-circle', isPlaceholder: true },
        { name: '关于我们', icon: 'information-circle', isPlaceholder: true },
      ],
    },
  ];

  const handleMenuPress = (item: MenuGroup['items'][0]) => {
    if (item.target) {
      navigation.navigate(item.target as keyof TabParamList);
    } else if (item.name === '我的二维码') {
      setShowQRCode(true);
    } else {
      Alert.alert('提示', `${item.name} 功能开发中`);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      '退出登录',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.logout();
              Alert.alert('提示', '已退出登录');
            } catch (error) {
              console.error('Logout failed:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.page}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 头部 */}
        <LinearGradient
          colors={['#4CAF50', '#388E3C']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* 消息通知按钮 */}
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* 用户信息 */}
          <View style={styles.userInfo}>
            <TouchableOpacity onPress={() => setShowAvatar(true)}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatar}>{userInfo?.avatar || '👤'}</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => Alert.alert('提示', '头像编辑功能开发中')}
                >
                  <Ionicons name="pencil" size={14} color="#4CAF50" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            <Text style={styles.userName}>{userInfo?.name || '农户'}</Text>
            <Text style={styles.plantingDays}>已种植 {userInfo?.plantingDays || 0} 天</Text>

            <View style={styles.levelTag}>
              <Text style={styles.levelText}>{userInfo?.level || '初级'}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* 今日任务卡片 */}
        <View style={styles.taskCard}>
          <View style={styles.taskIcon}>
            <Ionicons name="clipboard" size={28} color="#4CAF50" />
          </View>
          <View style={styles.taskContent}>
            <Text style={styles.taskTitle}>今日任务</Text>
            <Text style={styles.taskDesc}>待完成 {pendingTaskCount} 项农事任务</Text>
          </View>
          <TouchableOpacity style={styles.taskButton}>
            <Text style={styles.taskButtonText}>查看</Text>
            <Ionicons name="chevron-forward" size={18} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* 统计数据卡片 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsContainer}
          contentContainerStyle={styles.statsContent}
        >
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.cropCount ?? 0}</Text>
            <Text style={styles.statLabel}>种植作物</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.recognitionCount ?? 0}</Text>
            <Text style={styles.statLabel}>识别记录</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.checkInDays ?? 0}</Text>
            <Text style={styles.statLabel}>连续签到</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.likesCount ?? 0}</Text>
            <Text style={styles.statLabel}>获得点赞</Text>
          </View>
        </ScrollView>

        {/* 菜单分组 */}
        {menuGroups.map((group, groupIndex) => (
          <View key={group.title} style={styles.menuGroup}>
            <Text style={styles.menuGroupTitle}>{group.title}</Text>
            <View style={styles.menuCard}>
              {group.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.name}
                  style={[
                    styles.menuItem,
                    itemIndex < group.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => handleMenuPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIconBg}>
                      <Ionicons name={item.icon as any} size={22} color="#4CAF50" />
                    </View>
                    <Text style={styles.menuName}>{item.name}</Text>
                  </View>
                  <View style={styles.menuItemRight}>
                    {item.badge && (
                      <View style={styles.menuBadge}>
                        <Text style={styles.menuBadgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* 底部信息 */}
        <View style={styles.footer}>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => Alert.alert('提示', '隐私政策功能开发中')}>
              <Text style={styles.footerLink}>隐私政策</Text>
            </TouchableOpacity>
            <Text style={styles.footerDivider}>|</Text>
            <TouchableOpacity onPress={() => Alert.alert('提示', '用户协议功能开发中')}>
              <Text style={styles.footerLink}>用户协议</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.version}>v1.0.0</Text>

          {/* 退出登录 */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#f44336" />
            <Text style={styles.logoutText}>退出登录</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* 头像放大查看Modal */}
      <Modal visible={showAvatar} transparent animationType="fade" onRequestClose={() => setShowAvatar(false)}>
        <TouchableOpacity style={styles.avatarModal} activeOpacity={1} onPress={() => setShowAvatar(false)}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{userInfo?.avatar || '👤'}</Text>
          </View>
          <Text style={styles.avatarHint}>点击任意处关闭</Text>
        </TouchableOpacity>
      </Modal>

      {/* 二维码Modal */}
      <Modal visible={showQRCode} transparent animationType="slide" onRequestClose={() => setShowQRCode(false)}>
        <TouchableOpacity style={styles.qrModal} activeOpacity={1} onPress={() => setShowQRCode(false)}>
          <View style={styles.qrCard}>
            <View style={styles.qrHeader}>
              <Text style={styles.qrTitle}>我的二维码</Text>
              <TouchableOpacity onPress={() => setShowQRCode(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.qrCode}>
              <Ionicons name="qr-code" size={180} color="#333" />
            </View>
            <Text style={styles.qrName}>{userInfo?.name || '农户'}</Text>
            <Text style={styles.qrRole}>{userInfo?.role || '未认证'}</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  notificationButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#f44336',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  userInfo: {
    alignItems: 'center',
    marginTop: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 72,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 28,
    height: 28,
    backgroundColor: '#fff',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  plantingDays: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 10,
  },
  levelTag: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: -20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  taskIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#E8F5E9',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  taskDesc: {
    fontSize: 13,
    color: '#666',
  },
  taskButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginRight: 2,
  },
  statsContainer: {
    marginTop: 16,
  },
  statsContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
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
  menuGroup: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  menuGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginBottom: 10,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconBg: {
    width: 40,
    height: 40,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuBadge: {
    backgroundColor: '#ff5722',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  menuBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerLink: {
    fontSize: 13,
    color: '#4CAF50',
  },
  footerDivider: {
    fontSize: 13,
    color: '#ccc',
    marginHorizontal: 10,
  },
  version: {
    fontSize: 13,
    color: '#999',
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    color: '#f44336',
    fontWeight: '600',
  },
  bottomSpace: {
    height: 30,
  },
  avatarModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLarge: {
    width: 200,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLargeText: {
    fontSize: 100,
  },
  avatarHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 20,
  },
  qrModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '85%',
  },
  qrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  qrCode: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
  },
  qrName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  qrRole: {
    fontSize: 13,
    color: '#666',
  },
});
