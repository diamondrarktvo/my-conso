import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BarChart3, History, Home, Settings } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import type { TabParamList } from './types';
import { HomeScreen } from '@/src/features/home/screens/home.screen';
import { HistoryScreen } from '@/src/features/history/screens/history.screen';
import { StatsScreen } from '@/src/features/stats/screens/stats.screen';
import { SettingsScreen } from '@/src/features/settings/screens/settings.screen';

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
   const { t } = useTranslation('fuel');
   const active = useThemeColor('--color-primary', 'primary');
   const inactive = useThemeColor('--color-foreground-secondary', 'foregroundSecondary');
   const background = useThemeColor('--color-card', 'card');
   const border = useThemeColor('--color-border-subtle', 'borderSubtle');

   return (
      <Tab.Navigator
         screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: active,
            tabBarInactiveTintColor: inactive,
            tabBarStyle: { backgroundColor: background, borderTopColor: border, minHeight: 56 },
            tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
         }}>
         <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: t('tabs.home'), tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
         />
         <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{ title: t('tabs.history'), tabBarIcon: ({ color, size }) => <History color={color} size={size} /> }}
         />
         <Tab.Screen
            name="Stats"
            component={StatsScreen}
            options={{ title: t('tabs.stats'), tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} /> }}
         />
         <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: t('tabs.settings'), tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }}
         />
      </Tab.Navigator>
   );
}
