import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/src/navigation/types';
import { useActiveVehicle } from './store';

/**
 * Opens the fill-up form. Without any vehicle there is nothing to attach a fill-up to,
 * so the user is sent to the "add a vehicle" form first.
 */
export function useOpenFuelForm() {
   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
   const vehicle = useActiveVehicle();
   const hasVehicle = !!vehicle;
   return useCallback(
      (entryId?: string) => {
         if (!hasVehicle) navigation.navigate('VehicleForm');
         else navigation.navigate('FuelForm', entryId ? { entryId } : undefined);
      },
      [hasVehicle, navigation],
   );
}
