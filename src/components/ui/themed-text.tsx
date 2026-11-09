import { cn } from '@/src/utils/tailwind';
import React from 'react';
import { Text, TextProps } from 'react-native';

export type TextVariant =
   | 'h1'
   | 'h2'
   | 'h3'
   | 'body-large'
   | 'body'
   | 'body-small'
   | 'caption'
   | 'overline'
   | 'button'
   | 'label';

export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextColor =
   | 'default'
   | 'secondary'
   | 'muted'
   | 'inverse'
   | 'primary'
   | 'accent'
   | 'danger'
   | 'success'
   | 'warning'
   | 'info';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';

export interface ThemedTextProps extends TextProps {
   /** Text content */
   children: React.ReactNode;

   /** Typography variant */
   variant?: TextVariant;

   /** Font weight */
   weight?: TextWeight;

   /** Text color */
   color?: TextColor;

   /** Text alignment */
   align?: TextAlign;

   /** Text transform */
   transform?: TextTransform;

   /** Number of lines before truncating */
   numberOfLines?: number;

   /** Whether text should be underlined */
   underline?: boolean;

   /** Whether text should be italic */
   italic?: boolean;

   /** Letter spacing */
   tracking?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider';

   /** Line height */
   leading?: 'none' | 'tight' | 'normal' | 'relaxed' | 'loose';

   /** Custom className */
   className?: string;

   /** Test ID */
   testID?: string;
}

// Variant styles mapping to your CSS variables
const variantStyles = {
   h1: 'text-3xl font-bold',
   h2: 'text-2xl font-semibold',
   h3: 'text-xl font-semibold',
   'body-large': 'text-lg',
   body: 'text-base',
   'body-small': 'text-sm leading-relaxed',
   caption: 'caption',
   overline: 'text-xs uppercase tracking-wider',
   button: 'text-base font-semibold',
   label: 'text-sm font-medium',
};

// Font weights
const weightStyles = {
   normal: 'font-normal',
   medium: 'font-medium',
   semibold: 'font-semibold',
   bold: 'font-bold',
};

// Text colors using your CSS variables
const colorStyles = {
   default: 'text-foreground',
   secondary: 'text-foreground-secondary',
   muted: 'text-foreground-muted',
   inverse: 'text-foreground-inverse',
   primary: 'text-primary',
   accent: 'text-accent',
   danger: 'text-danger',
   success: 'text-success',
   warning: 'text-warning',
   info: 'text-info',
};

// Text alignment
const alignStyles = {
   left: 'text-left',
   center: 'text-center',
   right: 'text-right',
   justify: 'text-justify',
};

// Text transform
const transformStyles = {
   none: '',
   uppercase: 'uppercase',
   lowercase: 'lowercase',
   capitalize: 'capitalize',
};

// Letter spacing
const trackingStyles = {
   tighter: 'tracking-tighter',
   tight: 'tracking-tight',
   normal: 'tracking-normal',
   wide: 'tracking-wide',
   wider: 'tracking-wider',
};

// Line height
const leadingStyles = {
   none: 'leading-none',
   tight: 'leading-tight',
   normal: 'leading-normal',
   relaxed: 'leading-relaxed',
   loose: 'leading-loose',
};

/**
 * A themed text component with various styles and states.
 *
 * @param {string} children - Text content
 * @param {TextVariant} variant - Text variant (default: 'body')
 * @param {TextWeight} weight - Text weight (optional)
 * @param {TextColor} color - Text color (default: 'default')
 * @param {TextAlign} align - Text alignment (default: 'left')
 * @param {TextTransform} transform - Text transform (default: 'none')
 * @param {number} numberOfLines - Maximum number of lines to show (optional)
 * @param {boolean} underline - Show underline (default: false)
 * @param {boolean} italic - Make text italic (default: false)
 * @param {string} tracking - Text tracking (default: 'normal')
 * @param {string} leading - Text leading (default: undefined)
 * @param {string} className - Additional class names for the container (optional)
 * @param {string} testID - Test ID for the component (optional)
 */
export const ThemedText: React.FC<ThemedTextProps> = ({
   children,
   variant = 'body',
   weight,
   color = 'default',
   align = 'left',
   transform = 'none',
   numberOfLines,
   underline = false,
   italic = false,
   tracking = 'normal',
   leading,
   className = '',
   testID,
   ...props
}) => {
   // Combine all classes
   const textClasses = cn(
      // Base variant
      variantStyles[variant],

      // Weight (if provided, overrides variant weight)
      weight && weightStyles[weight],

      // Color
      colorStyles[color],

      // Alignment
      alignStyles[align],

      // Transform
      transformStyles[transform],

      // Tracking
      trackingStyles[tracking],

      // Leading (if provided, overrides variant leading)
      leading && leadingStyles[leading],

      // Decoration
      underline && 'underline',
      italic && 'italic',

      // Custom classes
      className
   );

   return (
      <Text className={textClasses} numberOfLines={numberOfLines} testID={testID} {...props}>
         {children}
      </Text>
   );
};
