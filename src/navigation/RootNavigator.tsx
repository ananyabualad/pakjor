import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBreakFlow } from '../hooks/BreakFlowContext';
import { ActivityScreen } from '../screens/ActivityScreen';
import { AlarmScreen } from '../screens/AlarmScreen';
import { BMIScreen } from '../screens/BMIScreen';
import { BreakCompleteScreen } from '../screens/BreakCompleteScreen';
import { BreakModeScreen } from '../screens/BreakModeScreen';
import { ExerciseScreen } from '../screens/ExerciseScreen';
import { HealthScreen } from '../screens/HealthScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MenstrualScreen } from '../screens/MenstrualScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ScreenBreakScreen } from '../screens/ScreenBreakScreen';
import { SetScreenTimeScreen } from '../screens/SetScreenTimeScreen';
import { SexualHealthScreen } from '../screens/SexualHealthScreen';
import { SleepScreen } from '../screens/SleepScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { TimerScreen } from '../screens/TimerScreen';
import { colors, fonts } from '../utils/theme';
import { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

type IconName = keyof typeof Ionicons.glyphMap;
const TAB_META: Record<keyof TabParamList, { label: string; icon: IconName; iconActive: IconName }> = {
  Home: { label: 'หน้าหลัก', icon: 'home-outline', iconActive: 'home' },
  ScreenBreak: { label: 'พักจอ', icon: 'phone-portrait-outline', iconActive: 'phone-portrait' },
  Sleep: { label: 'การนอน', icon: 'moon-outline', iconActive: 'moon' },
  Health: { label: 'สุขภาพ', icon: 'heart-outline', iconActive: 'heart' },
  Stats: { label: 'สถิติ', icon: 'stats-chart-outline', iconActive: 'stats-chart' },
};

function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabel: TAB_META[route.name].label,
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 12 },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          height: 62 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : Math.max(insets.bottom, 8),
        },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? TAB_META[route.name].iconActive : TAB_META[route.name].icon} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="ScreenBreak" component={ScreenBreakScreen} />
      <Tab.Screen name="Sleep" component={SleepScreen} />
      <Tab.Screen name="Health" component={HealthScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { settings } = useBreakFlow();
  return (
    <Stack.Navigator
      initialRouteName={settings.onboarded ? 'Main' : 'Onboarding'}
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="SetScreenTime" component={SetScreenTimeScreen} />
      <Stack.Screen name="Timer" component={TimerScreen} />
      <Stack.Screen
        name="Alarm"
        component={AlarmScreen}
        options={{ presentation: 'fullScreenModal', gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name="Activity" component={ActivityScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="BreakMode" component={BreakModeScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="BreakComplete" component={BreakCompleteScreen} options={{ gestureEnabled: false, animation: 'fade' }} />
      <Stack.Screen name="Menstrual" component={MenstrualScreen} />
      <Stack.Screen name="SexualHealth" component={SexualHealthScreen} />
      <Stack.Screen name="BMI" component={BMIScreen} />
      <Stack.Screen name="Exercise" component={ExerciseScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
