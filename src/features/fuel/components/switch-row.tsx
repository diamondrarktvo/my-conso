import React from 'react';
import { Switch } from 'react-native';
import { ThemedView } from '@/src/components/ui/themed-view';
import { ThemedText } from '@/src/components/ui/themed-text';
import { useThemeColor } from '@/src/hooks/use-theme-color';

export function SwitchRow({
   label,
   help,
   value,
   onValueChange,
}: {
   label: string;
   help?: string;
   value: boolean;
   onValueChange: (v: boolean) => void;
}) {
   const track = useThemeColor('--color-primary', 'primary');
   const off = useThemeColor('--color-border', 'border');
   return (
      <ThemedView gap="xs">
         <ThemedView flex="row" items="center" justify="between" gap="md" className="bg-transparent min-h-[44px]">
            <ThemedText weight="medium" className="flex-1">
               {label}
            </ThemedText>
            <Switch
               value={value}
               onValueChange={onValueChange}
               trackColor={{ false: off, true: track }}
               accessibilityLabel={label}
            />
         </ThemedView>
         {help ? (
            <ThemedText variant="caption" color="secondary">
               {help}
            </ThemedText>
         ) : null}
      </ThemedView>
   );
}
