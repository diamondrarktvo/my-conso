import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/src/components/ui/themed-view';

/** Screen shell for tab pages: top safe area only (the tab bar handles the bottom). */
export function TabScreen({ children }: { children: React.ReactNode }) {
   const insets = useSafeAreaInsets();
   return (
      <ThemedView className="bg-background flex-1" style={{ paddingTop: insets.top }}>
         {children}
      </ThemedView>
   );
}
