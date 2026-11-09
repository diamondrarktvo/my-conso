import React from 'react';
import { FlashList, type FlashListProps } from '@shopify/flash-list';
import { withUniwind } from 'uniwind';

export type ThemedListProps<T> = FlashListProps<T> & {
   className?: string;
   /** Tailwind classes for the scroll content (padding, gap…) */
   contentContainerClassName?: string;
};

// Uniwind maps `className` -> style and `contentContainerClassName` -> contentContainerStyle.
const UniwindFlashList = withUniwind(FlashList) as unknown as <T>(props: ThemedListProps<T>) => React.ReactElement;

/**
 * Themed list built on FlashList v2 (virtualised, no size estimate needed).
 * For grouped data, flatten it into one array with typed items and set `getItemType`.
 */
export function ThemedList<T>({ showsVerticalScrollIndicator = false, ...props }: ThemedListProps<T>) {
   return <UniwindFlashList showsVerticalScrollIndicator={showsVerticalScrollIndicator} {...props} />;
}
