import React from 'react';
import { ThemedPressable } from './themed-pressable';
import { ThemedText } from './themed-text';
import { ThemedIcon, type IconName } from './themed-icon';

interface ThemedFabProps {
   label: string;
   icon?: IconName;
   onPress: () => void;
}

/** Extended floating action button, pinned bottom-right of its relatively positioned parent. */
export function ThemedFab({ label, icon = 'plus', onPress }: ThemedFabProps) {
   return (
      <ThemedPressable
         onPress={onPress}
         accessibilityLabel={label}
         className="bg-primary absolute right-4 bottom-4 min-h-13 flex-row items-center gap-2 rounded-full px-5 py-3 shadow-lg active:opacity-80">
         <ThemedIcon name={icon} color="inverse" strokeWidth={3} />
         <ThemedText weight="bold" color="inverse">
            {label}
         </ThemedText>
      </ThemedPressable>
   );
}
