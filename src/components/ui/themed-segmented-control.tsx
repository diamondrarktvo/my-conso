import React from 'react';
import { Row } from './themed-view';
import { ThemedText } from './themed-text';
import { ThemedPressable } from './themed-pressable';
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
      <Row rounded="lg" padding="xs" gap="xs" className="bg-background-secondary">
         {options.map(o => {
            const active = o.value === value;
            return (
               <ThemedPressable
                  key={o.value}
                  onPress={() => onChange(o.value)}
                  accessibilityState={{ selected: active }}
                  className={cn('min-h-11 flex-1 items-center justify-center rounded-md px-1', active ? 'bg-primary' : '')}>
                  {/* One line only: shrink the text instead of wrapping on narrow screens */}
                  <ThemedText
                     variant="body-small"
                     weight="semibold"
                     color={active ? 'inverse' : 'default'}
                     numberOfLines={1}
                     adjustsFontSizeToFit
                     minimumFontScale={0.75}>
                     {o.label}
                  </ThemedText>
               </ThemedPressable>
            );
         })}
      </Row>
   );
}
