import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ThemedIcon, type IconName } from '@/src/components/ui/themed-icon';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import type { TabParamList } from './types';
import { HomeScreen } from '@/src/features/home/screens/home.screen';
import { HistoryScreen } from '@/src/features/history/screens/history.screen';
import { StatsScreen } from '@/src/features/stats/screens/stats.screen';
import { SettingsScreen } from '@/src/features/settings/screens/settings.screen';

const Tab = createBottomTabNavigator<TabParamList>();

const tabIcon = (name: IconName) =>
   function TabIcon({ color, size }: { color: string; size: number }) {
      return <ThemedIcon name={name} customColor={color} customSize={size} />;
   };

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
            options={{ title: t('tabs.home'), tabBarIcon: tabIcon('home') }}
         />
         <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{ title: t('tabs.history'), tabBarIcon: tabIcon('history') }}
         />
         <Tab.Screen
            name="Stats"
            component={StatsScreen}
            options={{ title: t('tabs.stats'), tabBarIcon: tabIcon('bar-chart') }}
         />
         <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: t('tabs.settings'), tabBarIcon: tabIcon('settings') }}
         />
      </Tab.Navigator>
   );
}
