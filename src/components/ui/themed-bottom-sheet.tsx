import React from 'react';
import { BottomSheetPortal } from 'react-native-bottom-sheet-stack';
import { GorhomSheetAdapter } from 'react-native-bottom-sheet-stack/gorhom';
import { BottomSheetView, TouchableOpacity } from '@gorhom/bottom-sheet';
import { Row, ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { ThemedIcon } from './themed-icon';

export interface BottomSheetProps {
   id: string;
   children: React.ReactNode;
   snapPoints?: (string | number)[];
   enableDynamicSizing?: boolean;
   index?: number;
   enablePanDownToClose?: boolean;
   backgroundStyle?: any;
   handleIndicatorStyle?: any;
   onClose?: () => void;
}

/**
 * To use it
 * use useBottomSheet() from hooks global
 * 
 */

/**
 * A React component for displaying a bottom sheet.
 *
 * @param {string} id - The ID of the bottom sheet.
 * @param {React.ReactNode} children - The content of the bottom sheet.
 * @param {(string | number)[]} snapPoints - The snap points of the bottom sheet.
 * @param {number} index - The index of the currently active snap point.
 * @param {boolean} enablePanDownToClose - Whether the bottom sheet can be closed by panning down.
 * @param {any} backgroundStyle - The style of the bottom sheet's background.
 * @param {any} handleIndicatorStyle - The style of the bottom sheet's handle indicator.
 * @param {() => void} onClose - A callback function to be called when the bottom sheet is closed.
 */
export function BottomSheet({
   id,
   children,
   snapPoints = ['50%'],
   enableDynamicSizing = false,
   index = 0,
   enablePanDownToClose = true,
   backgroundStyle,
   handleIndicatorStyle,
   onClose,
}: BottomSheetProps) {
   return (
      <BottomSheetPortal id={id}>
         <GorhomSheetAdapter
            {...(!enableDynamicSizing && { snapPoints })}
            enableDynamicSizing={enableDynamicSizing}
            index={index}
            enablePanDownToClose={enablePanDownToClose}
            backgroundStyle={backgroundStyle}
            handleIndicatorStyle={handleIndicatorStyle}
            onClose={() => onClose?.()}>
            <BottomSheetView>
               <ThemedView>{children}</ThemedView>
            </BottomSheetView>
         </GorhomSheetAdapter>
      </BottomSheetPortal>
   );
}

// Helper component for sheet header
interface BottomSheetHeaderProps {
   title: string | React.ReactNode;
   showCloseButton?: boolean;
   onClose?: () => void;
}

export function BottomSheetHeader({
   title,
   showCloseButton = false,
   onClose,
}: BottomSheetHeaderProps) {
   return (
      <Row padding='md' justify='between' items='center' className="border-b border-gray-200 dark:border-gray-700">
         {typeof title === 'string'
            ? <ThemedText className="text-lg font-semibold">{title}</ThemedText>
            : title
         }
         {showCloseButton && onClose && (
            <TouchableOpacity onPress={onClose} className="absolute right-4">
               <ThemedIcon name="x" size="lg" />
            </TouchableOpacity>
         )}
      </Row>
   );
}
