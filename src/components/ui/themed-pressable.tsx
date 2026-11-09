import React from 'react';
import { Pressable, type PressableProps } from 'react-native';
import { cn } from '@/src/utils/tailwind';

export interface ThemedPressableProps extends PressableProps {
   className?: string;
}

/**
 * Themed Pressable: button role by default and a pressed-state opacity.
 * Use `min-h-11` / `min-w-11` (44 px) in `className` for small tap targets.
 */
export const ThemedPressable: React.FC<ThemedPressableProps> = ({
   className,
   accessibilityRole = 'button',
   ...props
}) => <Pressable accessibilityRole={accessibilityRole} className={cn('active:opacity-70', className)} {...props} />;
