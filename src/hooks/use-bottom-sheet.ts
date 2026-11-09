// hooks/use-bottom-sheet.ts
import { useBottomSheetControl, useBottomSheetStatus } from 'react-native-bottom-sheet-stack';
import { useState } from 'react';

interface OpenSheetOptions {
   scaleBackground?: boolean;
   params?: Record<string, any>;
}

export function useBottomSheet<T extends Record<string, any> = Record<string, any>>(
   sheetId: string
) {
   const control = useBottomSheetControl(sheetId);
   const status = useBottomSheetStatus(sheetId);

   // Store params locally
   const [params, setParams] = useState<T | null>(null);

   const open = (options?: OpenSheetOptions) => {
      if (options?.params) {
         setParams(options.params as T);
      }
      control.open({
         scaleBackground: options?.scaleBackground ?? false,
         params: options?.params,
      });
   };

   const close = () => {
      control.close();
      // Optionally clear params on close
      // setParams(null);
   };

   const updateParams = (newParams: Partial<T>) => {
      setParams(prev => ({ ...prev, ...newParams }) as T);

      if ('updateParams' in control && typeof control.updateParams === 'function') {
         (control as any).updateParams(newParams);
      } else {
         console.warn('updateParams not available, closing and reopening');
         control.close();
         setTimeout(() => {
            control.open({
               scaleBackground: true,
               params: { ...params, ...newParams },
            });
         }, 300);
      }
   };

   const resetParams = () => {
      setParams(null);
      if ('resetParams' in control && typeof control.resetParams === 'function') {
         (control as any).resetParams();
      } else {
         control.close();
      }
   };

   return {
      open,
      close,
      updateParams,
      resetParams,
      isOpen: status.isOpen,
      params, // Use local state instead of context
   };
}
