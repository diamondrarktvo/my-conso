import React, { useEffect } from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import Animated, {
   useSharedValue,
   useAnimatedStyle,
   withRepeat,
   withSequence,
   withTiming,
   withDelay,
   Easing,
   cancelAnimation,
} from 'react-native-reanimated';
import { Row, ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { cn } from '@/src/utils/tailwind';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useCSSVariable } from 'uniwind';
import { COLORS } from '@/src/constants/color';

export type ButtonVariant =
   | 'primary'
   | 'secondary'
   | 'outline'
   | 'ghost'
   | 'danger'
   | 'success'
   | 'warning';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ThemedButtonProps extends TouchableOpacityProps {
   /** Button content */
   title?: string;
   children?: React.ReactNode;

   /** Visual variants */
   variant?: ButtonVariant;
   size?: ButtonSize;

   /** States */
   loading?: boolean;
   disabled?: boolean;
   loadingText?: string;

   /** Icons */
   leftIcon?: React.ReactNode;
   rightIcon?: React.ReactNode;

   /** Full width button (default: false) */
   fullWidth?: boolean;

   /** Custom styles */
   className?: string;
   textClassName?: string;

   /** Accessibility */
   accessibilityLabel?: string;

   /** Press handlers */
   onPress?: () => void;
   onLongPress?: () => void;

   /** Test ID */
   testID?: string;
}

const variantStyles = {
   primary: {
      container: 'bg-primary',
      text: 'text-foreground-inverse',
   },
   secondary: {
      container: 'bg-background-secondary',
      text: 'text-foreground',
   },
   outline: {
      container: 'bg-transparent border-2 border-primary',
      text: 'text-primary',
   },
   ghost: {
      container: 'bg-transparent',
      text: 'text-foreground',
   },
   danger: {
      container: 'bg-danger',
      text: 'text-foreground-inverse',
   },
   success: {
      container: 'bg-success',
      text: 'text-foreground-inverse',
   },
   warning: {
      container: 'bg-warning',
      text: 'text-foreground-inverse',
   },
};

const sizeStyles = {
   xs: {
      container: 'px-3 py-2 rounded-lg',
      text: 'xs',
      iconSize: 14,
      gap: 'gap-1.5',
      dotSize: 4,
   },
   sm: {
      container: 'px-4 py-2.5 rounded-lg',
      text: 'sm',
      iconSize: 16,
      gap: 'gap-2',
      dotSize: 5,
   },
   md: {
      container: 'px-5 py-3 rounded-lg',
      text: 'base',
      iconSize: 18,
      gap: 'gap-2.5',
      dotSize: 6,
   },
   lg: {
      container: 'px-6 py-3.5 rounded-xl',
      text: 'lg',
      iconSize: 20,
      gap: 'gap-3',
      dotSize: 7,
   },
   xl: {
      container: 'px-8 py-4 rounded-xl',
      text: 'xl',
      iconSize: 22,
      gap: 'gap-3.5',
      dotSize: 8,
   },
};

const stateStyles = {
   disabled: 'opacity-50',
};

// Loading Dots Component
const LoadingDots: React.FC<{ color: string; size: number }> = ({ color, size }) => {
   const dot1Scale = useSharedValue(1);
   const dot2Scale = useSharedValue(1);
   const dot3Scale = useSharedValue(1);

   useEffect(() => {
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
               withTiming(1.5, { duration: 500, easing: Easing.elastic(1) }),
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

      return () => {
         cancelAnimation(dot1Scale);
         cancelAnimation(dot2Scale);
         cancelAnimation(dot3Scale);
      };
   }, [dot1Scale, dot2Scale, dot3Scale]);

   const dot1Style = useAnimatedStyle(() => ({
      transform: [{ scale: dot1Scale.value }],
   }));

   const dot2Style = useAnimatedStyle(() => ({
      transform: [{ scale: dot2Scale.value }],
   }));

   const dot3Style = useAnimatedStyle(() => ({
      transform: [{ scale: dot3Scale.value }],
   }));

   return (
      <Row bg="transparent" className="items-center gap-1">
         <Animated.View
            style={[
               {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: color,
               },
               dot1Style,
            ]}
         />
         <Animated.View
            style={[
               {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: color,
               },
               dot2Style,
            ]}
         />
         <Animated.View
            style={[
               {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: color,
               },
               dot3Style,
            ]}
         />
      </Row>
   );
};

export const ThemedButton: React.FC<ThemedButtonProps> = ({
   // Content
   title,
   children,

   // Variants
   variant = 'primary',
   size = 'md',

   // States
   loading = false,
   disabled = false,
   loadingText,

   // Icons
   leftIcon,
   rightIcon,

   // Layout
   fullWidth = false,

   // Custom styles
   className = '',
   textClassName = '',

   // Accessibility
   accessibilityLabel,

   // Events
   onPress,
   onLongPress,

   // Test ID
   testID,

   // Other TouchableOpacity props
   ...props
}) => {
   const { effectiveTheme } = useTheme();
   const isDisabled = disabled || loading;

   // Get all CSS variables at the top level
   const primaryColor = useCSSVariable('--color-primary') || COLORS[effectiveTheme].primary;
   const foregroundColor =
      useCSSVariable('--color-foreground') || COLORS[effectiveTheme].foreground;
   // Text/icon colour on filled surfaces: white in light mode, navy in dark mode (bright fills)
   const onFilledColor = COLORS[effectiveTheme].foregroundInverse;

   // Determine icon color based on variant
   const getIconColor = () => {
      if (variant === 'outline') return primaryColor;
      if (
         variant === 'primary' ||
         variant === 'danger' ||
         variant === 'success' ||
         variant === 'warning'
      ) {
         return onFilledColor;
      }
      return foregroundColor;
   };

   // Determine loading indicator color
   const getLoadingColor = () => {
      if (variant === 'outline') return primaryColor;
      if (
         variant === 'primary' ||
         variant === 'danger' ||
         variant === 'success' ||
         variant === 'warning'
      ) {
         return onFilledColor;
      }
      return foregroundColor;
   };

   const iconColor = getIconColor();
   const loadingColor = String(getLoadingColor());

   // Clone icon with proper color and size
   const renderIcon = (icon: React.ReactNode) => {
      if (!icon) return null;

      if (React.isValidElement(icon)) {
         return React.cloneElement(icon, {
            size: sizeStyles[size].iconSize,
            color: iconColor,
            ...(icon.props as object),
         } as any);
      }
      return icon;
   };

   // Determine container styles - remove default fullWidth
   const containerClasses = cn(
      'flex-row items-center justify-center',
      variantStyles[variant].container,
      sizeStyles[size].container,
      isDisabled && stateStyles.disabled,
      fullWidth ? 'w-full' : 'self-start', // Only take full width if explicitly requested
      className
   );

   // Render content based on loading state
   const renderContent = () => {
      const textColor =
         variantStyles[variant].text === 'text-foreground-inverse'
            ? 'inverse'
            : variant === 'outline'
              ? 'primary'
              : 'default';

      const staticContent = children ? (
         <Row bg="transparent" className={cn('items-center', sizeStyles[size].gap)}>
            {leftIcon && (
               <ThemedView bg="transparent" className="items-center justify-center">
                  {renderIcon(leftIcon)}
               </ThemedView>
            )}
            <ThemedView bg="transparent" className="items-center justify-center">
               {children}
            </ThemedView>
            {rightIcon && (
               <ThemedView bg="transparent" className="items-center justify-center">
                  {renderIcon(rightIcon)}
               </ThemedView>
            )}
         </Row>
      ) : (
         <Row bg="transparent" className={cn('items-center', sizeStyles[size].gap)}>
            {leftIcon && (
               <ThemedView bg="transparent" className="items-center justify-center">
                  {renderIcon(leftIcon)}
               </ThemedView>
            )}
            <ThemedText
               variant={sizeStyles[size].text as any}
               weight="semibold"
               color={textColor}
               className={textClassName}>
               {loading && loadingText ? loadingText : title}
            </ThemedText>
            {rightIcon && (
               <ThemedView bg="transparent" className="items-center justify-center">
                  {renderIcon(rightIcon)}
               </ThemedView>
            )}
         </Row>
      );

      if (loading) {
         return (
            <ThemedView bg="transparent" className="items-center justify-center">
               {/* Invisible original content keeps the button height stable */}
               <ThemedView bg="transparent" style={{ opacity: 0 }}>
                  {staticContent}
               </ThemedView>
               {/* Loading dots overlaid in place */}
               <ThemedView
                  bg="transparent"
                  className="absolute items-center justify-center">
                  <LoadingDots color={loadingColor} size={sizeStyles[size].dotSize} />
               </ThemedView>
            </ThemedView>
         );
      }

      return staticContent;
   };

   return (
      <TouchableOpacity
         className={containerClasses}
         onPress={onPress}
         onLongPress={onLongPress}
         disabled={isDisabled}
         activeOpacity={0.7}
         accessibilityLabel={accessibilityLabel || title}
         accessibilityRole="button"
         accessibilityState={{
            disabled: isDisabled,
            busy: loading,
         }}
         testID={testID}
         {...props}>
         {renderContent()}
      </TouchableOpacity>
   );
};
