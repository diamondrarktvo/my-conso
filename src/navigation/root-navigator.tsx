import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { TabNavigator } from './tab-navigator';
import { VehicleFormScreen } from '@/src/features/settings/screens/vehicle-form.screen';
import { FuelFormScreen } from '@/src/features/fuel-form/screens/fuel-form.screen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
   return (
      <NavigationContainer>
         <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tabs" component={TabNavigator} />
            <Stack.Screen name="FuelForm" component={FuelFormScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="VehicleForm" component={VehicleFormScreen} options={{ presentation: 'modal' }} />
         </Stack.Navigator>
      </NavigationContainer>
   );
}
