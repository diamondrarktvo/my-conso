import React, { useEffect } from 'react';
import { useCSSVariable } from 'uniwind';
import { cn } from '../../utils/tailwind';
import Animated, {
   useSharedValue,
   useAnimatedStyle,
   withRepeat,
   withTiming,
   withSequence,
   withDelay,
   Easing,
   cancelAnimation,
   interpolate,
} from 'react-native-reanimated';
import { ThemedView } from '../ui/themed-view';
import { ThemedText } from '../ui/themed-text';
import { ThemedIcon } from '../ui/themed-icon';
import { useTheme } from '../../theme/ThemeProvider';
import { COLORS } from '@/src/constants/color';

interface LoadingScreenProps {
   message?: string;
   fullScreen?: boolean;
   transparent?: boolean;
}

// Icon names array for carousel
const ICON_NAMES = ['clock', 'search', 'star', 'heart'] as const;

const FloatingParticle: React.FC<{ index: number; color: string }> = ({ index, color }) => {
   const opacity = useSharedValue(0.3);

   useEffect(() => {
      opacity.value = withRepeat(
         withSequence(
            withTiming(0.8, { duration: 1000 + index * 200 }),
            withTiming(0.2, { duration: 1000 + index * 200 })
         ),
         -1,
         true
      );
   }, [index, opacity]);

   const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

   return (
      <Animated.View
         style={[
            {
               position: 'absolute',
               width: 4,
               height: 4,
               borderRadius: 2,
               backgroundColor: color,
               transform: [{ rotate: `${index * 60}deg` }, { translateY: -40 }],
            },
            style,
         ]}
      />
   );
};

/**
 * LoadingScreen is a component that displays a loading animation with a message, optional full screen and transparent background.
 *
 * @param {string} [message='Chargement...'] - The message to display next to the loading animation.
 * @param {boolean} [fullScreen=true] - Whether the loading screen should be full screen or not.
 * @param {boolean} [transparent=false] - Whether the loading screen should have a transparent background or not.
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
   message = 'Chargement...',
   fullScreen = true,
   transparent = false,
}) => {
   const { effectiveTheme } = useTheme();

   // Get colors from CSS variables with fallbacks
   const primaryColor = (useCSSVariable('--color-primary') ||
      COLORS[effectiveTheme].primary) as string;
   const primarySoftColor = (useCSSVariable('--color-primary-soft') ||
      COLORS[effectiveTheme].primarySoft) as string;

   // Animation values
   const rotation = useSharedValue(0);
   const scale = useSharedValue(1);
   const opacity = useSharedValue(0.5);
   const iconIndex = useSharedValue(0);
   const dot1Scale = useSharedValue(1);
   const dot2Scale = useSharedValue(1);
   const dot3Scale = useSharedValue(1);
   const ring1Opacity = useSharedValue(0.3);
   const ring2Opacity = useSharedValue(0.5);

   useEffect(() => {
      // Continuous rotation animation
      rotation.value = withRepeat(
         withTiming(360, {
            duration: 2000,
            easing: Easing.linear,
         }),
         -1,
         false
      );

      // Pulse animation for icon
      scale.value = withRepeat(
         withSequence(
            withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
         ),
         -1,
         true
      );

      // Pulsing opacity for text
      opacity.value = withRepeat(
         withSequence(withTiming(1, { duration: 1000 }), withTiming(0.5, { duration: 1000 })),
         -1,
         true
      );

      // Icon carousel
      iconIndex.value = withRepeat(
         withSequence(
            withTiming(1, { duration: 1000 }),
            withTiming(2, { duration: 1000 }),
            withTiming(3, { duration: 1000 }),
            withTiming(0, { duration: 1000 })
         ),
         -1,
         false
      );

      // Staggered dot animations
      dot1Scale.value = withRepeat(
         withSequence(
            withTiming(1.5, { duration: 500, easing: Easing.elastic(1) }),
            withTiming(1, { duration: 500, easing: Easing.elastic(1) })
         ),
         -1,
         true
      );

      dot2Scale.value = withRepeat(
         withDelay(
            250,
            withSequence(
               withTiming(1.8, { duration: 500, easing: Easing.elastic(1) }),
               withTiming(1, { duration: 500, easing: Easing.elastic(1) })
            )
         ),
         -1,
         true
      );

      dot3Scale.value = withRepeat(
         withDelay(
            500,
            withSequence(
               withTiming(1.5, { duration: 500, easing: Easing.elastic(1) }),
               withTiming(1, { duration: 500, easing: Easing.elastic(1) })
            )
         ),
         -1,
         true
      );

      // Ring opacity animations
      ring1Opacity.value = withRepeat(
         withSequence(withTiming(0.8, { duration: 1500 }), withTiming(0.2, { duration: 1500 })),
         -1,
         true
      );

      ring2Opacity.value = withRepeat(
         withSequence(
            withDelay(750, withTiming(0.8, { duration: 1500 })),
            withDelay(750, withTiming(0.2, { duration: 1500 }))
         ),
         -1,
         true
      );

      // Cleanup animations on unmount
      return () => {
         cancelAnimation(rotation);
         cancelAnimation(scale);
         cancelAnimation(opacity);
         cancelAnimation(iconIndex);
         cancelAnimation(dot1Scale);
         cancelAnimation(dot2Scale);
         cancelAnimation(dot3Scale);
         cancelAnimation(ring1Opacity);
         cancelAnimation(ring2Opacity);
      };
   }, [dot1Scale, dot2Scale, dot3Scale, iconIndex, opacity, ring1Opacity, ring2Opacity, rotation, scale]);

   // Animated styles
   const outerRingStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
      opacity: ring1Opacity.value,
   }));

   const innerRingStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${-rotation.value}deg` }],
      opacity: ring2Opacity.value,
   }));

   const iconStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
   }));

   const iconRotationStyle = useAnimatedStyle(() => ({
      transform: [
         {
            rotate: `${interpolate(iconIndex.value, [0, 1, 2, 3], [0, 90, 180, 270])}deg`,
         },
      ],
   }));

   const textStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
   }));

   const dot1Style = useAnimatedStyle(() => ({
      transform: [{ scale: dot1Scale.value }],
   }));

   const dot2Style = useAnimatedStyle(() => ({
      transform: [{ scale: dot2Scale.value }],
   }));

   const dot3Style = useAnimatedStyle(() => ({
      transform: [{ scale: dot3Scale.value }],
   }));

   // Get current icon name based on index
   const getCurrentIconName = () => {
      const index = Math.floor(iconIndex.value);
      return ICON_NAMES[index] || ICON_NAMES[0];
   };

   const containerClasses = cn(
      fullScreen ? 'flex-1' : 'py-12',
      transparent ? 'bg-transparent' : 'bg-background',
      'items-center justify-center'
   );

   return (
      <ThemedView className={containerClasses}>
         <ThemedView className="items-center px-6">
            {/* Animated Icon Container */}
            <ThemedView className="relative w-32 h-32 mb-6">
               {/* Outer rotating ring */}
               <Animated.View
                  style={[
                     {
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        borderRadius: 64,
                        borderWidth: 3,
                        borderColor: primaryColor,
                        borderTopColor: 'transparent',
                     },
                     outerRingStyle,
                  ]}
               />

               {/* Inner counter-rotating ring */}
               <Animated.View
                  style={[
                     {
                        position: 'absolute',
                        width: '80%',
                        height: '80%',
                        top: '10%',
                        left: '10%',
                        borderRadius: 40,
                        borderWidth: 2,
                        borderColor: primarySoftColor,
                        borderBottomColor: 'transparent',
                     },
                     innerRingStyle,
                  ]}
               />

               {/* Icon with pulse and rotation using ThemedIcon */}
               <Animated.View
                  style={[
                     {
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                     },
                     iconStyle,
                     iconRotationStyle,
                  ]}>
                  <ThemedIcon
                     name={getCurrentIconName()}
                     customSize={48}
                     customColor={primaryColor}
                     strokeWidth={1.5}
                  />
               </Animated.View>

               {/* Floating particles (for extra flair) */}
               {[...Array(6)].map((_, i) => (
                  <FloatingParticle key={i} index={i} color={primaryColor} />
               ))}
            </ThemedView>

            {/* Message with fade animation */}
            <Animated.View style={textStyle}>
               <ThemedText
                  variant="body-large"
                  weight="medium"
                  color="default"
                  className="text-center mb-2">
                  {message}
               </ThemedText>
            </Animated.View>

            {/* Animated Dots */}
            <ThemedView className="flex-row items-center justify-center h-8">
               <Animated.View
                  style={[
                     {
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: primaryColor,
                        marginHorizontal: 4,
                     },
                     dot1Style,
                  ]}
               />
               <Animated.View
                  style={[
                     {
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: primaryColor,
                        marginHorizontal: 4,
                     },
                     dot2Style,
                  ]}
               />
               <Animated.View
                  style={[
                     {
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: primaryColor,
                        marginHorizontal: 4,
                     },
                     dot3Style,
                  ]}
               />
            </ThemedView>
         </ThemedView>
      </ThemedView>
   );
};

// Alternative minimalist version
export const MinimalLoadingScreen: React.FC<LoadingScreenProps> = ({
   message = 'Chargement...',
   transparent = false,
}) => {
   const { effectiveTheme } = useTheme();
   const primaryColor = (useCSSVariable('--color-primary') ||
      COLORS[effectiveTheme].primary) as string;

   const rotation = useSharedValue(0);

   useEffect(() => {
      rotation.value = withRepeat(
         withTiming(360, {
            duration: 1000,
            easing: Easing.linear,
         }),
         -1,
         false
      );

      return () => {
         cancelAnimation(rotation);
      };
   }, [rotation]);

   const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
   }));

   const containerClasses = cn(
      "absolute top-0 left-0 right-0 bottom-0 flex-1",
      transparent ? '' : 'bg-background',
      'items-center justify-center'
   );

   return (
      <ThemedView
         className={containerClasses}
         style={transparent ? { backgroundColor: 'rgba(0,0,0,0.45)' } : undefined}>
         <ThemedView className="items-center bg-transparent">
            <Animated.View style={animatedStyle}>
               <ThemedView
                  className="w-12 h-12 rounded-full border-4 bg-transparent"
                  style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
               />
            </Animated.View>
            <ThemedText variant="body" color="default" className="mt-4">
               {message}
            </ThemedText>
         </ThemedView>
      </ThemedView>
   );
};
