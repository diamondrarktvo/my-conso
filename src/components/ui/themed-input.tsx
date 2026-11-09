import React, { useState, forwardRef, useRef } from 'react';
import { TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { KeyboardController, useKeyboardHandler } from 'react-native-keyboard-controller';
import { useSharedValue } from 'react-native-reanimated';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { ThemedIcon } from './themed-icon'; // Import ThemedIcon
import { cn } from '@/src/utils/tailwind';
import { useThemeColor } from '@/src/hooks/use-theme-color';

export type InputVariant = 'default' | 'filled' | 'outlined' | 'underlined' | 'search';
export type InputSize = 'sm' | 'md' | 'lg';
export type InputState = 'default' | 'error' | 'success' | 'warning';

/**
 * Themed input component with enhanced design, variants, and features.
 */
export interface ThemedInputProps extends Omit<TextInputProps, 'placeholder'> {
   /** Input label */
   label?: string;
   /** Placeholder text */
   placeholder?: string;
   /** Helper text (appears below input) */
   helperText?: string;
   /** Error message (overrides helperText) */
   error?: string;
   /** Success message */
   success?: string;
   /** Warning message */
   warning?: string;
   /** Input variant */
   variant?: InputVariant;
   /** Input size */
   size?: InputSize;
   /** Input state */
   state?: InputState;
   /** Left icon */
   leftIcon?: React.ReactNode;
   /** Right icon */
   rightIcon?: React.ReactNode;
   /** Show clear button when text is present */
   clearable?: boolean;
   /** Toggle password visibility (for password fields) */
   secureTextEntry?: boolean;
   /** Show character count */
   showCount?: boolean;
   /** Max length (for character count) */
   maxLength?: number;
   /** Disabled state */
   disabled?: boolean;
   /** Required field */
   required?: boolean;
   /** Custom styles */
   containerClassName?: string;
   inputClassName?: string;
   labelClassName?: string;
   helperClassName?: string;
   /** Callbacks */
   onClear?: () => void;
   /** Test ID */
   testID?: string;
}

const variantStyles = {
   default: {
      container: 'bg-card border rounded-xl',
      defaultBorder: 'border-border-subtle',
      focused: 'border-primary shadow-sm',
      error: 'border-danger',
      success: 'border-success',
      warning: 'border-warning',
      disabled: 'bg-background-secondary border-border-subtle',
   },
   filled: {
      container: 'bg-background-secondary rounded-xl',
      defaultBorder: 'border-0',
      focused: 'ring-2 ring-primary/20',
      error: 'ring-2 ring-danger/20',
      success: 'ring-2 ring-success/20',
      warning: 'ring-2 ring-warning/20',
      disabled: 'bg-background-secondary opacity-60',
   },
   outlined: {
      container: 'bg-transparent border-2 rounded-xl',
      defaultBorder: 'border-border',
      focused: 'border-primary',
      error: 'border-danger',
      success: 'border-success',
      warning: 'border-warning',
      disabled: 'border-border-subtle opacity-60',
   },
   underlined: {
      container: 'bg-transparent border-b-2 rounded-none px-0',
      defaultBorder: 'border-border',
      focused: 'border-primary',
      error: 'border-danger',
      success: 'border-success',
      warning: 'border-warning',
      disabled: 'border-border-subtle opacity-60',
   },
   search: {
      container: 'bg-card border rounded-full',
      defaultBorder: 'border-border-subtle',
      focused: 'border-primary shadow-md',
      error: 'border-danger',
      success: 'border-success',
      warning: 'border-warning',
      disabled: 'bg-background-secondary border-border-subtle',
   },
};

const sizeStyles = {
   sm: {
      container: 'py-2.5 px-3',
      text: 'text-sm',
      label: 'text-xs',
      iconSize: 16,
      gap: 'gap-1.5',
      helperSize: 'xs',
      rounded: 'rounded-lg',
   },
   md: {
      container: 'py-3.5 px-4',
      text: 'text-base',
      label: 'text-sm',
      iconSize: 18,
      gap: 'gap-2',
      helperSize: 'sm',
      rounded: 'rounded-xl',
   },
   lg: {
      container: 'py-4 px-5',
      text: 'text-lg',
      label: 'text-base',
      iconSize: 20,
      gap: 'gap-2.5',
      helperSize: 'base',
      rounded: 'rounded-xl',
   },
};

// Helper function to render icons using ThemedIcon
const renderIcon = (icon: React.ReactNode, size: number, color: string) => {
   if (!icon) return null;

   // If it's already a ThemedIcon or a custom element, return as is
   if (React.isValidElement(icon)) {
      // Check if it's a string (icon name) or a component
      if (typeof icon.type === 'string') {
         return icon;
      }
      // Clone and add size/color props if needed
      return React.cloneElement(icon, {
         size,
         color,
         ...(icon.props as object),
      } as any);
   }

   // If it's a string (icon name), render ThemedIcon
   if (typeof icon === 'string') {
      return <ThemedIcon name={icon as any} customSize={size} customColor={color} />;
   }

   return icon;
};

export const ThemedInput = forwardRef<TextInput, ThemedInputProps>(
   (
      {
         // Basic props
         label,
         placeholder,
         helperText,
         error,
         success,
         warning,

         // Variants
         variant = 'default',
         size = 'md',
         state = 'default',

         // Icons
         leftIcon,
         rightIcon,

         // Features
         clearable = false,
         secureTextEntry = false,
         showCount = false,
         maxLength,
         disabled = false,
         required = false,

         // Styles
         containerClassName = '',
         inputClassName = '',
         labelClassName = '',
         helperClassName = '',

         // Callbacks
         onClear,
         onFocus,
         onBlur,
         onChangeText,
         testID,

         // Other TextInput props
         ...props
      },
      ref
   ) => {
      const [isFocused, setIsFocused] = useState(false);
      const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
      const [text, setText] = useState(props.value || props.defaultValue || '');
      const inputRef = useRef<TextInput>(null);
      const keyboardHeight = useSharedValue(0);

      // Track keyboard height (optional, can be used for animations)
      useKeyboardHandler({
         onMove: e => {
            'worklet';
            keyboardHeight.value = e.height;
         },
      });

      // Get colors from theme (with fallbacks)
      const primaryColor = useThemeColor('--color-primary', 'primary');
      const dangerColor = useThemeColor('--color-danger', 'danger');
      const successColor = useThemeColor('--color-success', 'success');
      const warningColor = useThemeColor('--color-warning', 'warning');
      const foregroundSecondary =
         useThemeColor('--color-foreground-secondary', 'foregroundSecondary');
      const foregroundMuted =
         useThemeColor('--color-foreground-muted', 'foregroundMuted');

      // Determine current state
      const currentState = error ? 'error' : success ? 'success' : warning ? 'warning' : state;

      // Get border color based on state and focus
      const getBorderColor = () => {
         if (disabled) return variantStyles[variant].disabled;
         if (currentState === 'error') return variantStyles[variant].error;
         if (currentState === 'success') return variantStyles[variant].success;
         if (currentState === 'warning') return variantStyles[variant].warning;
         if (isFocused) return variantStyles[variant].focused;
         return variantStyles[variant].defaultBorder;
      };

      // Handle focus
      const handleFocus = (e: any) => {
         setIsFocused(true);
         onFocus?.(e);
      };

      // Handle blur
      const handleBlur = (e: any) => {
         setIsFocused(false);
         onBlur?.(e);
      };

      // Handle text change
      const handleChangeText = (newText: string) => {
         setText(newText);
         onChangeText?.(newText);
      };

      // Handle clear
      const handleClear = () => {
         setText('');
         onChangeText?.('');
         onClear?.();
      };

      // Toggle password visibility
      const togglePasswordVisibility = () => {
         setIsPasswordVisible(!isPasswordVisible);
      };

      // Get variant styles
      const variantStyle = variantStyles[variant];
      const sizeStyle = sizeStyles[size];

      // Get icon color for state
      const getStateIconColor = () => {
         if (currentState === 'error') return dangerColor;
         if (currentState === 'success') return successColor;
         if (currentState === 'warning') return warningColor;
         return foregroundSecondary;
      };

      // Determine helper text
      const helperMessage = error || success || warning || helperText;
      const helperColor = error
         ? 'danger'
         : success
           ? 'success'
           : warning
             ? 'warning'
             : 'secondary';

      // For search variant, add some specific styling
      const isSearch = variant === 'search';

      return (
         <ThemedView className={cn('w-full', containerClassName)}>
            {/* Label with better styling */}
            {label && (
               <ThemedView className="flex-row items-center justify-between mb-2">
                  <ThemedText
                     variant={sizeStyle.label as any}
                     weight="medium"
                     color="secondary"
                     className={cn('tracking-wide', labelClassName)}>
                     {label}
                     {required && <ThemedText color="danger"> *</ThemedText>}
                  </ThemedText>

                  {/* Optional character count indicator */}
                  {showCount && maxLength && !isFocused && (
                     <ThemedText variant="overline" color="muted">
                        {text.length}/{maxLength}
                     </ThemedText>
                  )}
               </ThemedView>
            )}

            {/* Input container with enhanced design */}
            <ThemedView
               className={cn(
                  'flex-row items-center',
                  variantStyle.container,
                  sizeStyle.container,
                  sizeStyle.gap,
                  getBorderColor(),
                  disabled && 'opacity-50',
                  isSearch && isFocused && 'shadow-md',
                  isSearch && 'pr-2'
               )}>
               {/* Left icon with better styling */}
               {leftIcon && (
                  <ThemedView bg="transparent" className="items-center justify-center">
                     {renderIcon(
                        leftIcon,
                        sizeStyle.iconSize,
                        String(isFocused ? primaryColor : foregroundSecondary)
                     )}
                  </ThemedView>
               )}

               {/* Text input */}
               <TextInput
                  ref={node => {
                     if (typeof ref === 'function') {
                        ref(node);
                     } else if (ref) {
                        ref.current = node;
                     }
                     inputRef.current = node;
                  }}
                  className={cn(
                     'flex-1 bg-transparent p-0 text-foreground',
                     sizeStyle.text,
                     disabled && 'opacity-50',
                     inputClassName
                  )}
                  placeholder={placeholder}
                  placeholderTextColor={String(foregroundMuted)}
                  secureTextEntry={secureTextEntry && !isPasswordVisible}
                  editable={!disabled}
                  selectTextOnFocus={!disabled}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onChangeText={handleChangeText}
                  maxLength={maxLength}
                  testID={testID}
                  {...props}
               />

               {/* Right icons with better organization */}
               <ThemedView bg="transparent" className="flex-row items-center gap-1">
                  {/* Clear button with better visibility */}
                  {clearable && text.length > 0 && !disabled && (
                     <TouchableOpacity
                        onPress={handleClear}
                        className="p-1.5 rounded-full bg-background-secondary active:bg-background"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <ThemedIcon
                           name="x"
                           customSize={sizeStyle.iconSize - 2}
                           customColor={String(foregroundSecondary)}
                        />
                     </TouchableOpacity>
                  )}

                  {/* Password visibility toggle */}
                  {secureTextEntry && (
                     <TouchableOpacity
                        onPress={togglePasswordVisibility}
                        className="p-1 rounded-full bg-background-secondary active:bg-background"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        {isPasswordVisible ? (
                           <ThemedIcon
                              name="eye-off"
                              customSize={sizeStyle.iconSize - 2}
                              customColor={String(foregroundSecondary)}
                           />
                        ) : (
                           <ThemedIcon
                              name="eye"
                              customSize={sizeStyle.iconSize - 2}
                              customColor={String(foregroundSecondary)}
                           />
                        )}
                     </TouchableOpacity>
                  )}

                  {/* State icon with background */}
                  {currentState !== 'default' && (
                     <ThemedView bg="transparent" className="items-center justify-center p-1">
                        <ThemedIcon
                           name={
                              currentState === 'error'
                                 ? 'alert-circle'
                                 : currentState === 'success'
                                   ? 'check'
                                   : 'alert-circle'
                           }
                           customSize={sizeStyle.iconSize}
                           customColor={String(getStateIconColor())}
                        />
                     </ThemedView>
                  )}

                  {/* Custom right icon */}
                  {rightIcon && !clearable && !secureTextEntry && currentState === 'default' && (
                     <ThemedView bg="transparent" className="items-center justify-center p-1">
                        {renderIcon(
                           rightIcon,
                           sizeStyle.iconSize,
                           String(isFocused ? primaryColor : foregroundSecondary)
                        )}
                     </ThemedView>
                  )}

                  {/* Search button for search variant */}
                  {isSearch && (
                     <TouchableOpacity
                        className="p-2 bg-primary rounded-full ml-1"
                        onPress={() => {
                           KeyboardController.dismiss();
                        }}>
                        <ThemedIcon
                           name="search"
                           customSize={sizeStyle.iconSize - 2}
                           customColor="#FFFFFF"
                        />
                     </TouchableOpacity>
                  )}
               </ThemedView>
            </ThemedView>

            {/* Helper text row with improved layout */}
            {(helperMessage || (showCount && maxLength && isFocused)) && (
               <ThemedView className="flex-row items-center justify-between mt-2 px-1">
                  {/* Helper text with icon indicator */}
                  {helperMessage && (
                     <ThemedView className="flex-row items-center flex-1 gap-1.5">
                        {currentState !== 'default' && (
                           <ThemedView
                              style={{
                                 width: 4,
                                 height: 4,
                                 borderRadius: 2,
                                 backgroundColor: String(
                                    currentState === 'error'
                                       ? dangerColor
                                       : currentState === 'success'
                                         ? successColor
                                         : currentState === 'warning'
                                           ? warningColor
                                           : 'transparent'
                                 ),
                              }}
                           />
                        )}
                        <ThemedText
                           variant={sizeStyle.helperSize as any}
                           color={helperColor}
                           className={cn('flex-1', helperClassName)}>
                           {helperMessage}
                        </ThemedText>
                     </ThemedView>
                  )}

                  {/* Character count (shown when focused or if no helper text) */}
                  {showCount && maxLength && (isFocused || !helperMessage) && (
                     <ThemedText
                        variant="overline"
                        color={text.length === maxLength ? 'warning' : 'muted'}
                        weight={text.length === maxLength ? 'medium' : 'normal'}>
                        {text.length}/{maxLength}
                     </ThemedText>
                  )}
               </ThemedView>
            )}
         </ThemedView>
      );
   }
);

ThemedInput.displayName = 'ThemedInput';

export const SearchInput = forwardRef<TextInput, Omit<ThemedInputProps, 'variant' | 'leftIcon'>>(
   (props, ref) => (
      <ThemedInput
         ref={ref}
         variant="search"
         leftIcon="search"
         clearable
         returnKeyType="search"
         {...props}
      />
   )
);

SearchInput.displayName = 'SearchInput';
