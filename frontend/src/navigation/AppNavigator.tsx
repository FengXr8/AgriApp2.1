import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import HomeScreen from '../modules/home/screens/HomeScreen';
import FarmDetailScreen from '../modules/home/screens/FarmDetailScreen';
import ClimateDetailScreen from '../modules/home/screens/ClimateDetailScreen';
import AIChatScreen from '../modules/ai/screens/AIChatScreen';
import DiseaseScreen from '../modules/disease/screens/DiseaseScreen';
import CropScreen from '../modules/crop/screens/CropScreen';
import ProfileScreen from '../modules/profile/screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

type IoniconName = ComponentProps<typeof Ionicons>['name'];

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="FarmDetail" component={FarmDetailScreen} />
      <HomeStack.Screen name="ClimateDetail" component={ClimateDetailScreen} />
    </HomeStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: IoniconName = 'home-outline';

              switch (route.name) {
                case '首页':
                  iconName = focused ? 'home' : 'home-outline';
                  break;
                case 'AI问答':
                  iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
                  break;
                case '病虫害识别':
                  iconName = focused ? 'bug' : 'bug-outline';
                  break;
                case '作物管理':
                  iconName = focused ? 'leaf' : 'leaf-outline';
                  break;
                case '我的':
                  iconName = focused ? 'person' : 'person-outline';
                  break;
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#4CAF50',
            tabBarInactiveTintColor: '#999',
          })}
        >
          <Tab.Screen name="首页" component={HomeStackNavigator} />
          <Tab.Screen name="AI问答" component={AIChatScreen} />
          <Tab.Screen name="病虫害识别" component={DiseaseScreen} />
          <Tab.Screen name="作物管理" component={CropScreen} />
          <Tab.Screen name="我的" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
