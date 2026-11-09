import React from 'react';
import {
   BottomSheetManagerProvider,
   BottomSheetHost,
   BottomSheetScaleView,
} from 'react-native-bottom-sheet-stack';

export const BOTTOM_SHEET_STACK_ID = 'main-bottom-sheet-stack';

interface BottomSheetProviderProps {
   children: React.ReactNode;
}

export function BottomSheetProvider({ children }: BottomSheetProviderProps) {
   return (
      <BottomSheetManagerProvider id={BOTTOM_SHEET_STACK_ID}>
         <BottomSheetHost />
         <BottomSheetScaleView>{children}</BottomSheetScaleView>
      </BottomSheetManagerProvider>
   );
}
