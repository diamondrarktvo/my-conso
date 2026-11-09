import React from 'react';
import { TouchableOpacity } from 'react-native';
import * as Linking from 'expo-linking';
import { useCSSVariable } from 'uniwind';
import Animated, {
   useSharedValue,
   useAnimatedStyle,
   withRepeat,
   withSequence,
   withTiming,
   Easing,
   cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ThemedView } from '../ui/themed-view';
import { ThemedText } from '../ui/themed-text';
import { ThemedButton } from '../ui/themed-button';
import { ThemedIcon } from '../ui/themed-icon';
import { cn } from '@/src/utils/tailwind';
import { useTheme } from '@/src/theme/ThemeProvider';
import { COLORS } from '@/src/constants/color';
import { SUPPORTS } from '@/src/constants/support';

export type ErrorType =
   | 'not-found'
   | 'location'
   | 'camera'
   | 'storage'
   | 'unknown';

export interface ErrorScreenProps {
   type?: ErrorType;
   error?: Error | null;
   title?: string;
   message?: string;
   details?: string;
   onRetry?: () => void;
   onGoBack?: () => void;
   onGoHome?: () => void;
   onContactSupport?: () => void;
   fullScreen?: boolean;
   className?: string;
}

// Configuration per error type — title/message are i18n keys resolved at render time
const errorConfig: Record<
   ErrorType,
   {
      icon: 'alert-circle';
      iconType: 'primary' | 'danger' | 'warning';
      title: string;
      message: string;
      primaryAction: 'retry' | 'go-back' | 'go-home' | 'contact';
      secondaryAction?: 'retry' | 'go-back' | 'go-home' | 'contact';
      showDetails?: boolean;
   }
> = {
   'not-found': {
      icon: 'alert-circle',
      iconType: 'warning',
      title: 'screen.not_found.title',
      message: 'screen.not_found.message',
      primaryAction: 'go-back',
      secondaryAction: 'go-home',
   },
   location: {
      icon: 'alert-circle',
      iconType: 'warning',
      title: 'screen.location.title',
      message: 'screen.location.message',
      primaryAction: 'retry',
      secondaryAction: 'go-back',
   },
   camera: {
      icon: 'alert-circle',
      iconType: 'warning',
      title: 'screen.camera.title',
      message: 'screen.camera.message',
      primaryAction: 'retry',
      secondaryAction: 'go-back',
   },
   storage: {
      icon: 'alert-circle',
      iconType: 'warning',
      title: 'screen.storage.title',
      message: 'screen.storage.message',
      primaryAction: 'go-back',
      secondaryAction: 'contact',
   },
   unknown: {
      icon: 'alert-circle',
      iconType: 'danger',
      title: 'screen.unknown.title',
      message: 'screen.unknown.message',
      primaryAction: 'retry',
      secondaryAction: 'contact',
      showDetails: true,
   },
};

// Icon component with animations using ThemedIcon
const AnimatedIcon: React.FC<{
   type: 'alert-circle';
   color: string;
}> = ({ type, color }) => {
   const pulse = useSharedValue(1);

   React.useEffect(() => {
      pulse.value = withRepeat(
         withSequence(
            withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
         ),
         -1,
         true
      );


      return () => {
         cancelAnimation(pulse);
      };
   }, [pulse]);

   const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulse.value }],
   }));

   return (
      <Animated.View style={animatedStyle}>
         <ThemedIcon name={type} customSize={64} customColor={color} strokeWidth={1.5} />
      </Animated.View>
   );
};

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
   type = 'unknown',
   error,
   title,
   message,
   details,
   onRetry,
   onGoBack,
   onGoHome,
   onContactSupport,
   fullScreen = true,
   className = '',
}) => {
   const { effectiveTheme } = useTheme();
   const config = errorConfig[type];

   // Get colors with fallbacks
   const primaryColor = useCSSVariable('--color-primary') || COLORS[effectiveTheme].primary;
   const dangerColor = useCSSVariable('--color-danger') || COLORS[effectiveTheme].danger;
   const warningColor = useCSSVariable('--color-warning') || COLORS[effectiveTheme].warning;

   const getColor = () => {
      switch (config.iconType) {
         case 'primary':
            return primaryColor;
         case 'danger':
            return dangerColor;
         case 'warning':
            return warningColor;
         default:
            return primaryColor;
      }
   };

   const iconColor = getColor() as string;

   const handlePrimaryAction = () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      switch (config.primaryAction) {
         case 'retry':
            onRetry?.();
            break;
         case 'go-back':
            onGoBack?.();
            break;
         case 'go-home':
            onGoHome?.();
            break;
         case 'contact':
            if (onContactSupport) {
               onContactSupport();
            } else {
               Linking.openURL(`mailto:${SUPPORTS.mail}`);
            }
            break;
      }
   };

   const handleSecondaryAction = () => {
      if (!config.secondaryAction) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      switch (config.secondaryAction) {
         case 'retry':
            onRetry?.();
            break;
         case 'go-back':
            onGoBack?.();
            break;
         case 'go-home':
            onGoHome?.();
            break;
         case 'contact':
            if (onContactSupport) {
               onContactSupport();
            } else {
               Linking.openURL(`mailto:${SUPPORTS.mail}`);
            }
            break;
      }
   };

   const getPrimaryButtonText = () => {
      switch (config.primaryAction) {
         case 'retry':
            return 'Réessayer';
         case 'go-back':
            return 'Retour';
         case 'go-home':
            return 'Accueil';
         case 'contact':
            return 'Contacter le support';
         default:
            return 'OK';
      }
   };

   const getPrimaryButtonIcon = () => {
      switch (config.primaryAction) {
         case 'retry':
            return <ThemedIcon name="refresh" size="md" color="inverse" />;
         case 'go-back':
            return <ThemedIcon name="arrow-left" size="md" color="inverse" />;
         case 'go-home':
            return <ThemedIcon name="home" size="md" color="inverse" />;
         default:
            return undefined;
      }
   };

   const getSecondaryButtonText = () => {
      if (!config.secondaryAction) return null;

      switch (config.secondaryAction) {
         case 'retry':
            return 'Réessayer';
         case 'go-back':
            return 'Retour';
         case 'go-home':
            return 'Accueil';
         case 'contact':
            return 'Contacter le support';
         default:
            return null;
      }
   };

   const containerClasses = cn(fullScreen ? 'flex-1' : 'py-12', 'bg-background', className);

   // Get soft background class
   const getSoftBgClass = () => {
      switch (config.iconType) {
         case 'primary':
            return 'bg-primary-soft';
         case 'danger':
            return 'bg-danger-soft';
         case 'warning':
            return 'bg-warning-soft';
         default:
            return 'bg-primary-soft';
      }
   };

   // Don't render secondary button if there's no text
   const secondaryButtonText = getSecondaryButtonText();

   return (
      <ThemedView className={containerClasses}>
         <ThemedView className="flex-1 items-center justify-center px-6">
            {/* Animated Icon with background */}
            <ThemedView className="relative mb-6">
               <ThemedView
                  className={cn(
                     'absolute inset-0 rounded-full opacity-20 scale-150',
                     getSoftBgClass()
                  )}
               />
               <ThemedView
                  className={cn(
                     'w-32 h-32 rounded-full items-center justify-center',
                     getSoftBgClass()
                  )}>
                  <AnimatedIcon type={config.icon} color={iconColor} />
               </ThemedView>
            </ThemedView>

            {/* Title */}
            <ThemedText variant="h2" weight="bold" className="text-center mb-2">
               {title || config.title}
            </ThemedText>

            {/* Message */}
            <ThemedText
               variant="body-large"
               color="secondary"
               className="text-center mb-6 leading-6 px-4">
               {message || config.message}
            </ThemedText>

            {/* Technical details */}
            {(config.showDetails || details) && (
               <ThemedView className="w-full mb-6 p-3 bg-background-secondary rounded-xl">
                  <ThemedText variant="caption" color="muted" className="font-mono">
                     {details || error?.message || 'Aucun détail technique disponible'}
                  </ThemedText>
                  {error?.stack && (
                     <ThemedText
                        variant="caption"
                        color="muted"
                        className="font-mono mt-1"
                        numberOfLines={2}>
                        {error.stack.split('\n')[0]}
                     </ThemedText>
                  )}
               </ThemedView>
            )}

            {/* Action buttons - Only render if there's at least one action */}
            {(config.primaryAction || secondaryButtonText) && (
               <ThemedView className="w-full gap-3 px-4">
                  {/* Primary action */}
                  <ThemedButton
                     title={getPrimaryButtonText()}
                     onPress={handlePrimaryAction}
                     variant="primary"
                     size="lg"
                     fullWidth
                     leftIcon={getPrimaryButtonIcon()}
                  />

                  {/* Secondary action - Only render if there's text */}
                  {secondaryButtonText && (
                     <ThemedButton
                        title={secondaryButtonText}
                        onPress={handleSecondaryAction}
                        variant="outline"
                        size="lg"
                        fullWidth
                     />
                  )}
               </ThemedView>
            )}

            {/* Help links - using ThemedIcon */}
            <ThemedView className="flex-row items-center justify-center mt-8 gap-4">
               <TouchableOpacity onPress={() => Linking.openURL(SUPPORTS.website)}>
                  <ThemedView className="flex-row items-center">
                     <ThemedIcon name="external-link" size="sm" color="secondary" />
                     <ThemedText variant="body-small" color="secondary" className="ml-1">
                        Aide
                     </ThemedText>
                  </ThemedView>
               </TouchableOpacity>

               <ThemedView className="w-1 h-1 rounded-full bg-border" />

               <TouchableOpacity onPress={() => Linking.openURL(`mailto:${SUPPORTS.mail}`)}>
                  <ThemedView className="flex-row items-center">
                     <ThemedIcon name="mail" size="sm" color="secondary" />
                     <ThemedText variant="body-small" color="secondary" className="ml-1">
                        Support
                     </ThemedText>
                  </ThemedView>
               </TouchableOpacity>
            </ThemedView>
         </ThemedView>
      </ThemedView>
   );
};
