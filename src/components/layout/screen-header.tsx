import React from 'react';
import { Row } from '../ui/themed-view';
import { ThemedText } from '../ui/themed-text';
import { ThemedIcon } from '../ui/themed-icon';
import { ThemedPressable } from '../ui/themed-pressable';

interface ScreenHeaderProps {
   title: string;
   onBack: () => void;
   backLabel: string;
   /** Optional content on the right (e.g. a vehicle badge) */
   right?: React.ReactNode;
}

/** Header of stacked/modal screens: back arrow + title (+ optional right content). */
export function ScreenHeader({ title, onBack, backLabel, right }: ScreenHeaderProps) {
   return (
      <Row items="center" gap="sm" bg="transparent" className="px-2 py-2">
         <ThemedPressable
            onPress={onBack}
            accessibilityLabel={backLabel}
            hitSlop={8}
            className="min-h-11 min-w-11 items-center justify-center">
            <ThemedIcon name="arrow-left" size="xl" />
         </ThemedPressable>
         <ThemedText variant="h3" weight="bold" numberOfLines={1} className="shrink">
            {title}
         </ThemedText>
         {right}
      </Row>
   );
}
