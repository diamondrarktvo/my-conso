import React from 'react';
import { ThemedView } from '@/src/components/ui/themed-view';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedImage } from '@/src/components/ui/themed-image';
import { cn } from '@/src/utils/tailwind';
import type { Vehicle } from '../types';

export type VehicleAvatarSize = 'sm' | 'md' | 'lg' | 'xl';

// Pixel size (for the image) + matching Tailwind classes (for the fallback)
const SIZES: Record<VehicleAvatarSize, { px: number; box: string; text: string }> = {
   sm: { px: 32, box: 'size-8', text: 'text-sm' },
   md: { px: 44, box: 'size-11', text: 'text-lg' },
   lg: { px: 52, box: 'size-13', text: 'text-xl' },
   xl: { px: 112, box: 'size-28', text: 'text-5xl' },
};

/** Round vehicle picture. Falls back to the first letter of the name on a soft brand tint. */
export function VehicleAvatar({ vehicle, size = 'md' }: { vehicle: Pick<Vehicle, 'name' | 'photoUri'>; size?: VehicleAvatarSize }) {
   const s = SIZES[size];
   if (vehicle.photoUri) {
      return (
         <ThemedImage
            source={{ uri: vehicle.photoUri }}
            width={s.px}
            height={s.px}
            rounded="full"
            minLoadingTime={0}
            accessibilityLabel={vehicle.name}
         />
      );
   }
   const initial = vehicle.name.trim().charAt(0).toUpperCase() || '?';
   return (
      <ThemedView className={cn('bg-primary-soft items-center justify-center rounded-full', s.box)} accessibilityElementsHidden>
         <ThemedText weight="bold" color="primary" className={s.text}>
            {initial}
         </ThemedText>
      </ThemedView>
   );
}
