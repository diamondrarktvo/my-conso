// src/components/layout/screen.tsx
import React from 'react';
import { StatusBar, StatusBarStyle, TouchableWithoutFeedback } from 'react-native';
import { KeyboardAvoidingView, KeyboardController } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from 'boneyard-js/native';
import { ThemedView } from '../ui/themed-view';
import { cn } from '@/src/utils/tailwind';

export type SafeAreaEdge = 'top' | 'bottom' | 'left' | 'right';

interface ScreenProps {
   children: React.ReactNode;
   withSafeArea?: boolean;
   /** Which safe-area insets to apply when `withSafeArea` is on (default: all). Tab screens use ['top'] since the tab bar handles the bottom. */
   safeAreaEdges?: SafeAreaEdge[];
   withKeyboardAvoiding?: boolean;
   withSmallPadding?: boolean;
   withDismissKeyboardOnOutside?: boolean;
   backgroundColor?: string;
   statusBarStyle?: StatusBarStyle;
   statusBarColor?: string;
   className?: string;
   /** Boneyard skeleton name — when provided, enables the skeleton for this screen */
   skeletonName?: string;
   /** Boneyard skeleton loading state — controls whether the skeleton is shown */
   skeletonLoading?: boolean;
}

/**
 * A Screen component that wraps the app's content in a themed view.
 * It provides options to use safe area insets and keyboard avoiding view.
 *
 * @param {React.ReactNode} children - The content to be rendered inside the screen.
 * @param {boolean} withSafeArea - Whether to use safe area insets. Defaults to true.
 * @param {boolean} withKeyboardAvoiding - Whether to use keyboard avoiding view. Defaults to false.
 * @param {boolean} withSmallPadding - Whether to apply small padding. Defaults to true.
 * @param {boolean} withDismissKeyboardOnOutside - Whether to dismiss keyboard when tapping outside. Defaults to true.
 * @param {string} backgroundColor - The background color of the screen. Defaults to 'bg-background'.
 * @param {StatusBarStyle} statusBarStyle - The status bar style. Defaults to 'light-content'.
 * @param {string} statusBarColor - The background color of the status bar. Defaults to 'transparent'.
 * @param {string} className - Additional CSS classes to apply to the screen. Defaults to an empty string.
 */
export const Screen: React.FC<ScreenProps> = ({
   children,
   withSafeArea = true,
   safeAreaEdges = ['top', 'bottom', 'left', 'right'],
   withSmallPadding = true,
   withKeyboardAvoiding = false,
   withDismissKeyboardOnOutside = true,
   backgroundColor = 'bg-background',
   statusBarStyle = 'default',
   statusBarColor = 'transparent',
   className = '',
   skeletonName,
   skeletonLoading = false,
}) => {
   const insets = useSafeAreaInsets();

   const hideKeyboard = () => {
      if (withDismissKeyboardOnOutside) {
         KeyboardController.dismiss();
      }
   };

   const resolvedChildren = skeletonName ? (
      <Skeleton name={skeletonName} loading={skeletonLoading}>
         {children}
      </Skeleton>
   ) : children;

   const content = (
      <ThemedView
         className={cn('flex-1', withSmallPadding ? 'px-4' : '', backgroundColor, className)}>
         <StatusBar barStyle={statusBarStyle} backgroundColor={statusBarColor} translucent />
         {resolvedChildren}
      </ThemedView>
   );

   // Handle safe area padding
   const safeAreaStyle = withSafeArea
      ? {
           paddingTop: safeAreaEdges.includes('top') ? insets.top : 0,
           paddingBottom: safeAreaEdges.includes('bottom') ? insets.bottom : 0,
           paddingLeft: safeAreaEdges.includes('left') ? insets.left : 0,
           paddingRight: safeAreaEdges.includes('right') ? insets.right : 0,
        }
      : {};

   if (withKeyboardAvoiding) {
      return (
         <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <ThemedView className="flex-1" style={safeAreaStyle}>
               {content}
            </ThemedView>
         </KeyboardAvoidingView>
      );
   }

   if (withDismissKeyboardOnOutside) {
      return (
         <TouchableWithoutFeedback onPress={hideKeyboard}>
            <ThemedView className="flex-1" style={safeAreaStyle}>
               {content}
            </ThemedView>
         </TouchableWithoutFeedback>
      );
   }

   if (withSafeArea) {
      return (
         <ThemedView className="flex-1" style={safeAreaStyle}>
            {content}
         </ThemedView>
      );
   }

   return content;
};
