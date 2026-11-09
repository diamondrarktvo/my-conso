import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { HomeScreen } from '@/src/features/home/screens/home.screen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
   return (
      <NavigationContainer>
         <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
         </Stack.Navigator>
      </NavigationContainer>
   );
}
