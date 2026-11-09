import React, { useState } from 'react';
import { View, ViewStyle, Dimensions } from 'react-native';
import { Image, ImageProps, ImageContentFit, ImageErrorEventData } from 'expo-image';
import { cn } from '@/src/utils/tailwind';
import { ThemedText } from './themed-text';

export type ImageVariant =
   | 'card'
   | 'avatar'
   | 'thumbnail'
   | 'cover'
   | 'profile'
   | 'banner'
   | 'hero';

export type SkeletonVariant = 'pulse' | 'shimmer' | 'none';

export interface ThemedImageProps extends Omit<ImageProps, 'source' | 'style' | 'onError'> {
   /** Image source (required) */
   source: string | { uri: string } | number;

   /** Image variant for predefined sizing */
   variant?: ImageVariant;

   /** Custom width (overrides variant) */
   width?: number;

   /** Custom height (overrides variant) */
   height?: number;

   /** Border radius */
   rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

   /** Minimum loading time to prevent flicker (ms) */
   minLoadingTime?: number;

   /** Placeholder image when source fails */
   fallbackSource?: string | { uri: string } | number;

   /** Aspect ratio (width/height) */
   aspectRatio?: number;

   /** Content fit mode */
   contentFit?: ImageContentFit;

   /** Transition duration for image load (ms) */
   transition?: number;

   /** Additional className for container */
   containerClassName?: string;

   /** Additional className for image */
   className?: string;

   /** On load success */
   onLoad?: () => void;

   /** On load error */
   onError?: (error: ImageErrorEventData) => void;

   /** Test ID */
   testID?: string;
}

// Variant size presets
const variantSizes: Record<ImageVariant, { width: number; height: number }> = {
   card: { width: Dimensions.get('window').width - 32, height: 200 },
   avatar: { width: 48, height: 48 },
   thumbnail: { width: 80, height: 80 },
   cover: { width: Dimensions.get('window').width, height: 250 },
   profile: { width: 120, height: 120 },
   banner: { width: Dimensions.get('window').width - 32, height: 150 },
   hero: { width: Dimensions.get('window').width, height: 300 },
};

// Border radius mapping to your CSS variables
const roundedStyles = {
   none: 'rounded-none',
   sm: 'rounded-sm', // --radius-sm: 0.5rem
   md: 'rounded-md', // --radius-md: 0.75rem
   lg: 'rounded-lg', // --radius-lg: 1rem
   xl: 'rounded-xl', // --radius-xl: 1.5rem
   '2xl': 'rounded-2xl', // --radius-2xl: 2rem
   full: 'rounded-full', // --radius-full: 9999px
};

/**
 * ThemedImage component - A reusable image component that respects the app's theme.
 *
 * @param {ThemedImageProps} props - Props for the ThemedImage component
 * @param {string | { uri: string }} source - Image source (required)
 * @param {ImageVariant} [variant='card'] - Image variant for predefined sizing
 * @param {number} [width] - Custom width (overrides variant)
 * @param {number} [height] - Custom height (overrides variant)
 * @param {'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'} [rounded='xl'] - Border radius
 * @param {number} [minLoadingTime=300] - Minimum loading time to prevent flicker (ms)
 * @param {string | { uri: string }} [fallbackSource] - Placeholder image when source fails
 * @param {number} [aspectRatio] - Aspect ratio (width/height)
 * @param {ImageContentFit} [contentFit='cover'] - Content fit mode
 * @param {number} [transition=300] - Transition duration for image load (ms)
 * @param {string} [containerClassName] - Additional className for container
 * @param {string} [className] - Additional className for image
 * @param {() => void} [onLoad] - On load success
 * @param {(event: ImageErrorEventData) => void} [onError] - On load error
 * @param {string} [testID] - Test ID
 */
export const ThemedImage: React.FC<ThemedImageProps> = ({
   source,
   variant = 'card',
   width,
   height,
   rounded = 'xl',
   minLoadingTime = 300,
   fallbackSource,
   aspectRatio,
   contentFit = 'cover',
   transition = 300,
   containerClassName = '',
   className = '',
   onLoad,
   onError,
   testID,
   ...props
}) => {
   const [hasError, setHasError] = useState(false);

   // Get dimensions from variant or custom values
   const imageWidth = width ?? variantSizes[variant].width;
   const imageHeight = height ?? variantSizes[variant].height;

   // Container style
   const containerStyle: ViewStyle = {
      width: imageWidth,
      height: aspectRatio ? undefined : imageHeight,
      aspectRatio: aspectRatio,
   };

   // Handle load start
   const handleLoadStart = () => {
      setHasError(false);
   };

   // Handle load success
   const handleLoad = () => {
      onLoad?.();
   };

   // Handle error
   const handleError = (event: ImageErrorEventData) => {
      setHasError(true);
      onError?.(event);
   };

   // Determine source (use fallback if error)
   const imageSource = hasError && fallbackSource ? fallbackSource : source;

   return (
      <View
         className={cn(
            'relative overflow-hidden bg-background-secondary',
            roundedStyles[rounded],
            containerClassName
         )}
         style={containerStyle}
         testID={testID}>
         {/* Image with expo-image */}
         <Image
            source={imageSource}
            className={cn('w-full h-full', className)}
            style={{
               width: '100%',
               height: '100%',
            }}
            contentFit={contentFit}
            transition={transition}
            onLoadStart={handleLoadStart}
            onLoad={handleLoad}
            onError={handleError}
            cachePolicy={'memory-disk'}
            {...props}
         />

         {/* Error placeholder */}
         {hasError && !fallbackSource && (
            <View className="absolute inset-0 items-center justify-center bg-background-secondary">
               <ThemedText variant="body" color="muted">
                  Failed to load
               </ThemedText>
            </View>
         )}
      </View>
   );
};

export const AvatarImage: React.FC<Omit<ThemedImageProps, 'variant'>> = props => (
   <ThemedImage variant="avatar" rounded="full" {...props} />
);

export const ThumbnailImage: React.FC<Omit<ThemedImageProps, 'variant'>> = props => (
   <ThemedImage variant="thumbnail" rounded="lg" {...props} />
);

export const CoverImage: React.FC<Omit<ThemedImageProps, 'variant'>> = props => (
   <ThemedImage variant="cover" rounded="none" {...props} />
);

export const ProfileImage: React.FC<Omit<ThemedImageProps, 'variant'>> = props => (
   <ThemedImage variant="profile" rounded="full" {...props} />
);
