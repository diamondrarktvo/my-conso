import React from 'react';
import { Platform } from 'react-native';
import Toast, { SuccessToast, ErrorToast, InfoToast, ToastProps } from 'react-native-toast-message';
import { useTheme } from '../theme/ThemeProvider';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { COLORS } from '../constants/color';

interface ToastProviderProps {
   children: React.ReactNode;
}

/**
 * ToastProvider is a context provider that manages the toast state of the app.
 * It wraps the `react-native-toast-message` library and provides a way to customize the toast styles.
 * It loads the saved theme preference and provides the effective theme, which is either the system theme or the user-set theme.
 * The effective theme is used to update the CSS variables via `@variant dark`.
 * @example
 * <ThemeProvider>
 *    <ToastProvider>
 *       <App />
 *    </ToastProvider>
 * </ThemeProvider>
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
   const { effectiveTheme } = useTheme();

   // Get theme colors with fallbacks
   const successColor = useThemeColor('--color-success', 'success');
   const dangerColor = useThemeColor('--color-danger', 'danger');
   const secondaryColor = useThemeColor('--color-foreground-secondary', 'foregroundSecondary');

   const toastConfig = {
      success: (props: ToastProps) => (
         <SuccessToast
            {...props}
            style={{
               borderLeftColor: successColor,
               marginTop: Platform.OS === 'ios' ? 50 : 30,
               backgroundColor: COLORS[effectiveTheme].card,
               borderRadius: 12,
               shadowColor: '#000',
               shadowOffset: { width: 0, height: 2 },
               shadowOpacity: 0.1,
               shadowRadius: 8,
               elevation: 5,
            }}
            text1Style={{
               fontSize: 16,
               fontWeight: '600',
               color: COLORS[effectiveTheme].foreground,
            }}
            text2Style={{
               fontSize: 14,
               color: COLORS[effectiveTheme].foregroundSecondary,
            }}
         />
      ),
      error: (props: ToastProps) => (
         <ErrorToast
            {...props}
            text2NumberOfLines={3}
            style={{
               borderLeftColor: dangerColor,
               marginTop: Platform.OS === 'ios' ? 50 : 30,
               backgroundColor: COLORS[effectiveTheme].card,
               borderRadius: 12,
               shadowColor: '#000',
               shadowOffset: { width: 0, height: 2 },
               shadowOpacity: 0.1,
               shadowRadius: 8,
               elevation: 5,
            }}
            text1Style={{
               fontSize: 16,
               fontWeight: '600',
               color: COLORS[effectiveTheme].foreground,
            }}
            text2Style={{
               fontSize: 14,
               color: COLORS[effectiveTheme].foregroundSecondary,
            }}
         />
      ),
      info: (props: ToastProps) => (
         <InfoToast
            {...props}
            text2NumberOfLines={3}
            style={{
               borderLeftColor: secondaryColor,
               marginTop: Platform.OS === 'ios' ? 50 : 30,
               backgroundColor: COLORS[effectiveTheme].card,
               borderRadius: 12,
               shadowColor: '#000',
               shadowOffset: { width: 0, height: 2 },
               shadowOpacity: 0.1,
               shadowRadius: 8,
               elevation: 5,
            }}
            text1Style={{
               fontSize: 16,
               fontWeight: '600',
               color: COLORS[effectiveTheme].foreground,
            }}
            text2Style={{
               fontSize: 14,
               color: COLORS[effectiveTheme].foregroundSecondary,
            }}
         />
      ),
   };

   return (
      <>
         {children}
         <Toast config={toastConfig} />
      </>
   );
};

export const showToast = (
   type: 'success' | 'error' | 'info',
   text1: string,
   text2?: string,
   options?: {
      position?: 'top' | 'bottom';
      visibilityTime?: number;
      autoHide?: boolean;
      onPress?: () => void;
   }
) => {
   Toast.show({
      type,
      text1,
      text2,
      position: options?.position || 'top',
      visibilityTime: options?.visibilityTime || 4000,
      autoHide: options?.autoHide !== false,
      onPress: options?.onPress,
   });
};

export const hideToast = () => {
   Toast.hide();
};
