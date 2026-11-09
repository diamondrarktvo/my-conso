import React from 'react';
import { Image } from 'expo-image';
import { ThemedView } from '@/src/components/ui/themed-view';
import { ThemedText } from '@/src/components/ui/themed-text';
import type { Vehicle } from '../types';

/** Round vehicle picture. Falls back to the first letter of the name on a soft brand tint. */
export function VehicleAvatar({ vehicle, size = 40 }: { vehicle: Pick<Vehicle, 'name' | 'photoUri'>; size?: number }) {
   const radius = size / 2;
   if (vehicle.photoUri) {
      return (
         <Image
            source={{ uri: vehicle.photoUri }}
            style={{ width: size, height: size, borderRadius: radius }}
            contentFit="cover"
            accessibilityIgnoresInvertColors
            accessibilityLabel={vehicle.name}
         />
      );
   }
   const initial = vehicle.name.trim().charAt(0).toUpperCase() || '?';
   return (
      <ThemedView
         className="bg-primary-soft items-center justify-center"
         style={{ width: size, height: size, borderRadius: radius }}
         accessibilityElementsHidden>
         <ThemedText weight="bold" color="primary" style={{ fontSize: size * 0.42 }}>
            {initial}
         </ThemedText>
      </ThemedView>
   );
}
