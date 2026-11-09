import React from 'react';
import { Pressable } from 'react-native';
import { ThemedView } from '@/src/components/ui/themed-view';
import { ThemedText } from '@/src/components/ui/themed-text';
import { cn } from '@/src/utils/tailwind';

interface Option<T extends string> {
   value: T;
   label: string;
}

export function SegmentedControl<T extends string>({
   options,
   value,
   onChange,
}: {
   options: Option<T>[];
   value: T;
   onChange: (v: T) => void;
}) {
   return (
      <ThemedView flex="row" rounded="lg" padding="xs" gap="xs" className="bg-background-secondary">
         {options.map(o => {
            const active = o.value === value;
            return (
               <Pressable
                  key={o.value}
                  onPress={() => onChange(o.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={{ minHeight: 44 }}
                  className={cn('flex-1 items-center justify-center rounded-md px-2', active ? 'bg-primary' : '')}>
                  <ThemedText variant="body-small" weight="semibold" color={active ? 'inverse' : 'default'}>
                     {o.label}
                  </ThemedText>
               </Pressable>
            );
         })}
      </ThemedView>
   );
}
