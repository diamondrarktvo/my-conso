import React from 'react';
import { Pressable, ScrollView } from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';
import { cn } from '@/src/utils/tailwind';
import { VehicleAvatar } from './vehicle-avatar';
import { useFuelStore } from '../store';

/** Horizontal chips to pick the active vehicle. Renders nothing when there is only one vehicle. */
export function VehicleSwitcher() {
   const vehicles = useFuelStore(s => s.vehicles);
   const activeId = useFuelStore(s => s.activeVehicleId);
   const setActive = useFuelStore(s => s.setActiveVehicle);

   if (vehicles.length < 2) return null;

   return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
         {vehicles.map(v => {
            const active = v.id === activeId;
            return (
               <Pressable
                  key={v.id}
                  onPress={() => setActive(v.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={{ minHeight: 44 }}
                  className={cn('flex-row items-center gap-2 rounded-full border py-1 pr-4 pl-1', active ? 'bg-primary border-primary' : 'bg-card border-border')}>
                  <VehicleAvatar vehicle={v} size={36} />
                  <ThemedText weight="semibold" color={active ? 'inverse' : 'default'} numberOfLines={1}>
                     {v.name}
                  </ThemedText>
               </Pressable>
            );
         })}
      </ScrollView>
   );
}
