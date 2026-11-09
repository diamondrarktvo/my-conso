import { cn } from '@/src/utils/tailwind';
import React from 'react';
import { View, ViewProps } from 'react-native';
import { ThemedText } from './themed-text';

export type ViewVariant = 'default' | 'card' | 'elevated' | 'outlined' | 'subtle' | 'transparent';

export type ViewPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type ViewMargin = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type ViewRounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export type ViewBorder = 'none' | 'default' | 'subtle';

export type ViewShadow = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export type FlexDirection = 'row' | 'col' | 'row-reverse' | 'col-reverse';
export type FlexWrap = 'wrap' | 'nowrap' | 'wrap-reverse';
export type JustifyContent = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
export type AlignItems = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type AlignSelf = 'auto' | 'start' | 'center' | 'end' | 'stretch';

export interface ThemedViewProps extends ViewProps {
   /** Content */
   children?: React.ReactNode;

   /** Visual variant */
   variant?: ViewVariant;

   /** Background color (overrides variant) */
   bg?: 'background' | 'background-secondary' | 'card' | 'primary' | 'transparent';

   /** Padding on all sides */
   padding?: ViewPadding;

   /** Horizontal padding (left/right) */
   px?: ViewPadding;

   /** Vertical padding (top/bottom) */
   py?: ViewPadding;

   /** Padding left */
   pl?: ViewPadding;

   /** Padding right */
   pr?: ViewPadding;

   /** Padding top */
   pt?: ViewPadding;

   /** Padding bottom */
   pb?: ViewPadding;

   /** Margin on all sides */
   margin?: ViewMargin;

   /** Horizontal margin (left/right) */
   mx?: ViewMargin;

   /** Vertical margin (top/bottom) */
   my?: ViewMargin;

   /** Margin left */
   ml?: ViewMargin;

   /** Margin right */
   mr?: ViewMargin;

   /** Margin top */
   mt?: ViewMargin;

   /** Margin bottom */
   mb?: ViewMargin;

   /** Border radius */
   rounded?: ViewRounded;

   /** Individual corner rounding */
   roundedT?: ViewRounded;
   roundedB?: ViewRounded;
   roundedL?: ViewRounded;
   roundedR?: ViewRounded;
   roundedTL?: ViewRounded;
   roundedTR?: ViewRounded;
   roundedBL?: ViewRounded;
   roundedBR?: ViewRounded;

   /** Border style */
   border?: ViewBorder;

   /** Border width (in px) */
   borderWidth?: 0 | 1 | 2 | 4 | 8;

   /** Shadow intensity */
   shadow?: ViewShadow;

   /** Flex direction */
   flex?: FlexDirection;

   /** Flex wrap */
   wrap?: FlexWrap;

   /** Justify content */
   justify?: JustifyContent;

   /** Align items */
   items?: AlignItems;

   /** Align self */
   self?: AlignSelf;

   /** Flex grow */
   grow?: boolean | number;

   /** Flex shrink */
   shrink?: boolean | number;

   /** Gap between children */
   gap?: ViewPadding;

   /** Whether to take full width */
   fullWidth?: boolean;

   /** Whether to take full height */
   fullHeight?: boolean;

   /** Center children (justify + items) */
   center?: boolean;

   /** Custom className */
   className?: string;

   /** Test ID */
   testID?: string;
}

// Variant styles mapping to your CSS variables
const variantStyles: Record<ViewVariant, string> = {
   default: 'bg-background',
   card: 'bg-card border border-border-subtle',
   elevated: 'bg-card shadow-md',
   outlined: 'bg-transparent border border-border',
   subtle: 'bg-background-secondary',
   transparent: 'bg-transparent',
};

// Background colors
const bgStyles = {
   background: 'bg-background',
   'background-secondary': 'bg-background-secondary',
   card: 'bg-card',
   primary: 'bg-primary',
   transparent: 'bg-transparent',
};

// Padding mapping to your spacing variables
const paddingStyles: Record<ViewPadding, string> = {
   none: 'p-0',
   xs: 'p-1', // --spacing-1: 0.25rem
   sm: 'p-2', // --spacing-2: 0.5rem
   md: 'p-4', // --spacing-4: 1rem
   lg: 'p-6', // --spacing-6: 1.5rem
   xl: 'p-8', // --spacing-8: 2rem
   '2xl': 'p-12', // --spacing-12: 3rem
};

const paddingXStyles: Record<ViewPadding, string> = {
   none: 'px-0',
   xs: 'px-1',
   sm: 'px-2',
   md: 'px-4',
   lg: 'px-6',
   xl: 'px-8',
   '2xl': 'px-12',
};

const paddingYStyles: Record<ViewPadding, string> = {
   none: 'py-0',
   xs: 'py-1',
   sm: 'py-2',
   md: 'py-4',
   lg: 'py-6',
   xl: 'py-8',
   '2xl': 'py-12',
};

const paddingLeftStyles: Record<ViewPadding, string> = {
   none: 'pl-0',
   xs: 'pl-1',
   sm: 'pl-2',
   md: 'pl-4',
   lg: 'pl-6',
   xl: 'pl-8',
   '2xl': 'pl-12',
};

const paddingRightStyles: Record<ViewPadding, string> = {
   none: 'pr-0',
   xs: 'pr-1',
   sm: 'pr-2',
   md: 'pr-4',
   lg: 'pr-6',
   xl: 'pr-8',
   '2xl': 'pr-12',
};

const paddingTopStyles: Record<ViewPadding, string> = {
   none: 'pt-0',
   xs: 'pt-1',
   sm: 'pt-2',
   md: 'pt-4',
   lg: 'pt-6',
   xl: 'pt-8',
   '2xl': 'pt-12',
};

const paddingBottomStyles: Record<ViewPadding, string> = {
   none: 'pb-0',
   xs: 'pb-1',
   sm: 'pb-2',
   md: 'pb-4',
   lg: 'pb-6',
   xl: 'pb-8',
   '2xl': 'pb-12',
};

// Margin mapping to your spacing variables
const marginStyles: Record<ViewMargin, string> = {
   none: 'm-0',
   xs: 'm-1',
   sm: 'm-2',
   md: 'm-4',
   lg: 'm-6',
   xl: 'm-8',
   '2xl': 'm-12',
};

const marginXStyles: Record<ViewMargin, string> = {
   none: 'mx-0',
   xs: 'mx-1',
   sm: 'mx-2',
   md: 'mx-4',
   lg: 'mx-6',
   xl: 'mx-8',
   '2xl': 'mx-12',
};

const marginYStyles: Record<ViewMargin, string> = {
   none: 'my-0',
   xs: 'my-1',
   sm: 'my-2',
   md: 'my-4',
   lg: 'my-6',
   xl: 'my-8',
   '2xl': 'my-12',
};

const marginLeftStyles: Record<ViewMargin, string> = {
   none: 'ml-0',
   xs: 'ml-1',
   sm: 'ml-2',
   md: 'ml-4',
   lg: 'ml-6',
   xl: 'ml-8',
   '2xl': 'ml-12',
};

const marginRightStyles: Record<ViewMargin, string> = {
   none: 'mr-0',
   xs: 'mr-1',
   sm: 'mr-2',
   md: 'mr-4',
   lg: 'mr-6',
   xl: 'mr-8',
   '2xl': 'mr-12',
};

const marginTopStyles: Record<ViewMargin, string> = {
   none: 'mt-0',
   xs: 'mt-1',
   sm: 'mt-2',
   md: 'mt-4',
   lg: 'mt-6',
   xl: 'mt-8',
   '2xl': 'mt-12',
};

const marginBottomStyles: Record<ViewMargin, string> = {
   none: 'mb-0',
   xs: 'mb-1',
   sm: 'mb-2',
   md: 'mb-4',
   lg: 'mb-6',
   xl: 'mb-8',
   '2xl': 'mb-12',
};

// Border radius mapping to your radius variables
const roundedStyles: Record<ViewRounded, string> = {
   none: 'rounded-none',
   sm: 'rounded-sm', // --radius-sm: 0.5rem
   md: 'rounded-md', // --radius-md: 0.75rem
   lg: 'rounded-lg', // --radius-lg: 1rem
   xl: 'rounded-xl', // --radius-xl: 1.5rem
   '2xl': 'rounded-2xl', // --radius-2xl: 2rem
   full: 'rounded-full', // --radius-full: 9999px
};

// Individual corner rounding
const roundedTopStyles: Record<ViewRounded, string> = {
   none: 'rounded-t-none',
   sm: 'rounded-t-sm',
   md: 'rounded-t-md',
   lg: 'rounded-t-lg',
   xl: 'rounded-t-xl',
   '2xl': 'rounded-t-2xl',
   full: 'rounded-t-full',
};

const roundedBottomStyles: Record<ViewRounded, string> = {
   none: 'rounded-b-none',
   sm: 'rounded-b-sm',
   md: 'rounded-b-md',
   lg: 'rounded-b-lg',
   xl: 'rounded-b-xl',
   '2xl': 'rounded-b-2xl',
   full: 'rounded-b-full',
};

const roundedLeftStyles: Record<ViewRounded, string> = {
   none: 'rounded-l-none',
   sm: 'rounded-l-sm',
   md: 'rounded-l-md',
   lg: 'rounded-l-lg',
   xl: 'rounded-l-xl',
   '2xl': 'rounded-l-2xl',
   full: 'rounded-l-full',
};

const roundedRightStyles: Record<ViewRounded, string> = {
   none: 'rounded-r-none',
   sm: 'rounded-r-sm',
   md: 'rounded-r-md',
   lg: 'rounded-r-lg',
   xl: 'rounded-r-xl',
   '2xl': 'rounded-r-2xl',
   full: 'rounded-r-full',
};

// Border styles
const borderStyles: Record<ViewBorder, string> = {
   none: 'border-0',
   default: 'border border-border',
   subtle: 'border border-border-subtle',
};

// Border width
const borderWidthStyles = {
   0: 'border-0',
   1: 'border',
   2: 'border-2',
   4: 'border-4',
   8: 'border-8',
};

// Shadow styles using your elevation variables
const shadowStyles: Record<ViewShadow, string> = {
   none: '',
   sm: 'shadow-sm',
   md: 'shadow-md',
   lg: 'shadow-lg',
   xl: 'shadow-xl',
};

// Flex direction
const flexStyles: Record<FlexDirection, string> = {
   row: 'flex-row',
   col: 'flex-col',
   'row-reverse': 'flex-row-reverse',
   'col-reverse': 'flex-col-reverse',
};

// Flex wrap
const wrapStyles: Record<FlexWrap, string> = {
   wrap: 'flex-wrap',
   nowrap: 'flex-nowrap',
   'wrap-reverse': 'flex-wrap-reverse',
};

// Justify content
const justifyStyles: Record<JustifyContent, string> = {
   start: 'justify-start',
   center: 'justify-center',
   end: 'justify-end',
   between: 'justify-between',
   around: 'justify-around',
   evenly: 'justify-evenly',
};

// Align items
const itemsStyles: Record<AlignItems, string> = {
   start: 'items-start',
   center: 'items-center',
   end: 'items-end',
   stretch: 'items-stretch',
   baseline: 'items-baseline',
};

// Align self
const selfStyles: Record<AlignSelf, string> = {
   auto: 'self-auto',
   start: 'self-start',
   center: 'self-center',
   end: 'self-end',
   stretch: 'self-stretch',
};

// Gap mapping to spacing variables
const gapStyles: Record<ViewPadding, string> = {
   none: 'gap-0',
   xs: 'gap-1',
   sm: 'gap-2',
   md: 'gap-4',
   lg: 'gap-6',
   xl: 'gap-8',
   '2xl': 'gap-12',
};

// Flex grow
const growStyles = (grow: boolean | number) => {
   if (grow === true) return 'flex-grow';
   if (grow === false) return 'flex-grow-0';
   return `flex-${grow}`;
};

// Flex shrink
const shrinkStyles = (shrink: boolean | number) => {
   if (shrink === true) return 'flex-shrink';
   if (shrink === false) return 'flex-shrink-0';
   return `flex-${shrink}`;
};

/**
 * A themed view component with various styles and states.
 *
 * @param {React.ReactNode} children - Content of the view
 * @param {string} variant - Variant of the view (default: 'default')
 * @param {string} bg - Background color of the view (overrides variant)
 * @param {ViewPadding} padding - Padding of the view (overrides variant)
 * @param {ViewPadding} px - Padding of the view on the x-axis
 * @param {ViewPadding} py - Padding of the view on the y-axis
 * @param {ViewPadding} pl - Padding of the view on the left side
 * @param {ViewPadding} pr - Padding of the view on the right side
 * @param {ViewPadding} pt - Padding of the view on the top side
 * @param {ViewPadding} pb - Padding of the view on the bottom side
 * @param {ViewMargin} margin - Margin of the view (overrides variant)
 * @param {ViewMargin} mx - Margin of the view on the x-axis
 * @param {ViewMargin} my - Margin of the view on the y-axis
 * @param {ViewMargin} ml - Margin of the view on the left side
 * @param {ViewMargin} mr - Margin of the view on the right side
 * @param {ViewMargin} mt - Margin of the view on the top side
 * @param {ViewMargin} mb - Margin of the view on the bottom side
 * @param {ViewRounded} rounded - Border radius of the view (overrides variant)
 * @param {ViewRounded} roundedT - Border radius of the view on the top side
 * @param {ViewRounded} roundedB - Border radius of the view on the bottom side
 * @param {ViewRounded} roundedL - Border radius of the view on the left side
 * @param {ViewRounded} roundedR - Border radius of the view on the right side
 * @param {ViewRounded} roundedTL - Border radius of the view on the top left side
 * @param {ViewRounded} roundedTR - Border radius of the view on the top right side
 * @param {ViewRounded} roundedBL - Border radius of the view on the bottom left side
 * @param {ViewRounded} roundedBR - Border radius of the view on the bottom right side
 * @param {string} border - Border style of the view (overrides variant)
 * @param {number} borderWidth - Border width of the view
 * @param {string} shadow - Shadow style of the view
 * @param {boolean | number} flex - Flexbox layout of the view
 * @param {boolean | number} wrap - Flexbox wrap of the view
 * @param {JustifyContent} justify - Justify content of the view
 * @param {AlignItems} items - Align items of the view
 * @param {AlignSelf} self - Align self of the view
 * @param {boolean | number} grow - Flexbox grow of the view
 * @param {boolean | number} shrink - Flexbox shrink of the view
 * @param {ViewPadding} gap - Gap between the view and its parent
 * @param {boolean} fullWidth - Whether to make the view full width (default: false)
 * @param {boolean} fullHeight - Whether to make the view full height (default: false)
 * @param {boolean} center - Whether to center the view (default: false)
 * @param {string} className - Custom class names for the view
 * @param {string} testID - Test ID for the view
 */
export const ThemedView: React.FC<ThemedViewProps> = ({
   // Content
   children,

   // Variant
   variant = 'default',

   // Background (overrides variant)
   bg,

   // Padding
   padding,
   px,
   py,
   pl,
   pr,
   pt,
   pb,

   // Margin
   margin,
   mx,
   my,
   ml,
   mr,
   mt,
   mb,

   // Border radius
   rounded,
   roundedT,
   roundedB,
   roundedL,
   roundedR,
   roundedTL,
   roundedTR,
   roundedBL,
   roundedBR,

   // Border
   border = 'none',
   borderWidth,

   // Shadow
   shadow = 'none',

   // Flex
   flex,
   wrap,
   justify,
   items,
   self,
   grow,
   shrink,
   gap,

   // Layout
   fullWidth = false,
   fullHeight = false,
   center = false,

   // Custom className
   className = '',

   // Test ID
   testID,

   // Other View props
   ...props
}) => {
   // Build className
   const viewClasses = cn(
      // Variant or custom background
      bg ? bgStyles[bg] : variantStyles[variant],

      // Padding (individual props take precedence over padding)
      padding && paddingStyles[padding],
      px && paddingXStyles[px],
      py && paddingYStyles[py],
      pl && paddingLeftStyles[pl],
      pr && paddingRightStyles[pr],
      pt && paddingTopStyles[pt],
      pb && paddingBottomStyles[pb],

      // Margin (individual props take precedence over margin)
      margin && marginStyles[margin],
      mx && marginXStyles[mx],
      my && marginYStyles[my],
      ml && marginLeftStyles[ml],
      mr && marginRightStyles[mr],
      mt && marginTopStyles[mt],
      mb && marginBottomStyles[mb],

      // Border radius (individual corners take precedence)
      rounded && roundedStyles[rounded],
      roundedT && roundedTopStyles[roundedT],
      roundedB && roundedBottomStyles[roundedB],
      roundedL && roundedLeftStyles[roundedL],
      roundedR && roundedRightStyles[roundedR],
      roundedTL && `rounded-tl-${roundedTL}`,
      roundedTR && `rounded-tr-${roundedTR}`,
      roundedBL && `rounded-bl-${roundedBL}`,
      roundedBR && `rounded-br-${roundedBR}`,

      // Border
      borderStyles[border],
      borderWidth !== undefined && borderWidthStyles[borderWidth],

      // Shadow
      shadowStyles[shadow],

      // Flex
      flex && flexStyles[flex],
      wrap && wrapStyles[wrap],
      justify && justifyStyles[justify],
      items && itemsStyles[items],
      self && selfStyles[self],
      grow !== undefined && growStyles(grow),
      shrink !== undefined && shrinkStyles(shrink),
      gap && gapStyles[gap],

      // Layout
      fullWidth && 'w-full',
      fullHeight && 'h-full',
      center && 'items-center justify-center',

      // Custom
      className
   );

   return (
      <View className={viewClasses} testID={testID} {...props}>
         {children}
      </View>
   );
};

export const Row: React.FC<ThemedViewProps> = props => <ThemedView flex="row" {...props} />;

export const Column: React.FC<ThemedViewProps> = props => <ThemedView flex="col" {...props} />;

export const Card: React.FC<ThemedViewProps> = props => (
   <ThemedView variant="elevated" rounded="xl" padding="md" shadow="md" {...props} />
);

export const Container: React.FC<ThemedViewProps> = props => (
   <ThemedView className="container" {...props} />
);

export const Divider: React.FC<{ className?: string }> = ({ className }) => (
   <ThemedView className={cn('h-px bg-border', className)} />
);

export const Spacer: React.FC<{ size?: ViewPadding }> = ({ size = 'md' }) => (
   <ThemedView
      className={
         size === 'none'
            ? ''
            : `h-${size === 'xs' ? 1 : size === 'sm' ? 2 : size === 'md' ? 4 : size === 'lg' ? 6 : size === 'xl' ? 8 : 12}`
      }
   />
);

export const Section: React.FC<{
   title: string;
   className?: string;
   children?: React.ReactNode;
}> = ({ title, className, children }) => (
   <ThemedView className={cn('mb-6', className)}>
      <ThemedView className="mb-2">
         <ThemedText className="text-lg font-semibold">{title}</ThemedText>
      </ThemedView>
      {children}
   </ThemedView>
);
