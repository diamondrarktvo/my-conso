import React from 'react';
import { Row } from '@/src/components/ui/themed-view';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedPressable } from '@/src/components/ui/themed-pressable';
import { cn } from '@/src/utils/tailwind';
import { useFuelStore } from '../store';
import { VehicleAvatar } from './vehicle-avatar';

/** Chips to pick the active vehicle (wraps on several lines). Renders nothing for a single vehicle. */
export function VehicleSwitcher() {
   const vehicles = useFuelStore(s => s.vehicles);
   const activeId = useFuelStore(s => s.activeVehicleId);
   const setActive = useFuelStore(s => s.setActiveVehicle);

   if (vehicles.length < 2) return null;

   return (
      <Row wrap="wrap" gap="sm" bg="transparent">
         {vehicles.map(v => {
            const active = v.id === activeId;
            return (
               <ThemedPressable
                  key={v.id}
                  onPress={() => setActive(v.id)}
                  accessibilityState={{ selected: active }}
                  className={cn(
                     'max-w-full min-h-11 flex-row items-center gap-2 rounded-full border py-1 pr-4 pl-1',
                     active ? 'bg-primary border-primary' : 'bg-card border-border',
                  )}>
                  <VehicleAvatar vehicle={v} size="sm" />
                  <ThemedText weight="semibold" color={active ? 'inverse' : 'default'} numberOfLines={1} className="shrink">
                     {v.name}
                  </ThemedText>
               </ThemedPressable>
            );
         })}
      </Row>
   );
}
