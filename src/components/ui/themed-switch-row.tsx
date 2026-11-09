import React from 'react';
import { Switch } from 'react-native';
import { Row, ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
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
      <ThemedView gap="xs" bg="transparent">
         <Row items="center" justify="between" gap="md" bg="transparent" className="min-h-11">
            <ThemedText weight="medium" className="flex-1">
               {label}
            </ThemedText>
            <Switch
               value={value}
               onValueChange={onValueChange}
               trackColor={{ false: off, true: track }}
               accessibilityLabel={label}
            />
         </Row>
         {help ? (
            <ThemedText variant="caption" color="secondary">
               {help}
            </ThemedText>
         ) : null}
      </ThemedView>
   );
}
