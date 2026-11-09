import React, { useRef, useState } from 'react';
import {
   ScrollView,
   ScrollViewProps,
   RefreshControl,
   Animated,
   TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedView } from '../ui/themed-view';
import { cn } from '@/src/utils/tailwind';
import { ThemedIcon } from '../ui/themed-icon';

interface ScrollContainerProps extends ScrollViewProps {
   children: React.ReactNode;
   refreshable?: boolean;
   onRefresh?: () => Promise<void>;
   showScrollToTop?: boolean;
   onScrollThreshold?: number;
   showsVerticalScrollIndicator?: boolean;
   showsHorizontalScrollIndicator?: boolean;
   className?: string;
   contentContainerClassName?: string;
}

/**
 * A themed scroll container component with optional refresh control and scroll-to-top button.
 *
 * @param {React.ReactNode} children - Scroll container content
 * @param {boolean} refreshable - Show refresh control (default: false)
 * @param {() => Promise<void>} onRefresh - Refresh handler (optional)
 * @param {boolean} showScrollToTop - Show scroll-to-top button (default: false)
 * @param {number} onScrollThreshold - Scroll threshold to show scroll-to-top button (default: 300)
 * @param {boolean} showsVerticalScrollIndicator - Show vertical scroll indicator (default: false)
 * @param {boolean} showsHorizontalScrollIndicator - Show horizontal scroll indicator (default: false)
 * @param {string} className - Additional class names for the scroll container (optional)
 * @param {string} contentContainerClassName - Additional class names for the content container (optional)
 * @param {(event: any) => void} onScroll - Scroll handler (optional)
 */
export const ScrollContainer: React.FC<ScrollContainerProps> = ({
   children,
   refreshable = false,
   onRefresh,
   showScrollToTop = false,
   onScrollThreshold = 300,
   showsVerticalScrollIndicator = false,
   showsHorizontalScrollIndicator = false,
   className = '',
   contentContainerClassName = '',
   onScroll,
   ...props
}) => {
   const [refreshing, setRefreshing] = useState(false);
   const [, setShowTopButton] = useState(false);
   const scrollViewRef = useRef<ScrollView>(null);
   const scrollY = useRef(new Animated.Value(0)).current;

   const handleRefresh = async () => {
      if (!onRefresh) return;

      setRefreshing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      try {
         await onRefresh();
      } finally {
         setRefreshing(false);
      }
   };

   const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
      useNativeDriver: false,
      listener: (event: any) => {
         const offsetY = event.nativeEvent.contentOffset.y;
         setShowTopButton(offsetY > onScrollThreshold);
         onScroll?.(event);
      },
   });

   const scrollToTop = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
   };

   // Fade animation for scroll-to-top button
   const fadeAnim = scrollY.interpolate({
      inputRange: [0, onScrollThreshold],
      outputRange: [0, 1],
      extrapolate: 'clamp',
   });

   return (
      <ThemedView className="flex-1">
         <ScrollView
            ref={scrollViewRef}
            className={cn('flex-1', className)}
            contentContainerClassName={cn('grow', contentContainerClassName)}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
            refreshControl={
               refreshable ? (
                  <RefreshControl
                     refreshing={refreshing}
                     onRefresh={handleRefresh}
                     tintColor="var(--color-primary)"
                     colors={['var(--color-primary)']}
                     progressBackgroundColor="var(--color-card)"
                  />
               ) : undefined
            }
            onScroll={handleScroll}
            scrollEventThrottle={16}
            {...props}>
            {children}
         </ScrollView>

         {/* Scroll to top button */}
         {showScrollToTop && (
            <Animated.View
               style={{
                  position: 'absolute',
                  bottom: 20,
                  right: 20,
                  opacity: fadeAnim,
                  transform: [
                     {
                        scale: fadeAnim.interpolate({
                           inputRange: [0, 1],
                           outputRange: [0.8, 1],
                        }),
                     },
                  ],
               }}>
               <TouchableOpacity
                  onPress={scrollToTop}
                  className="w-12 h-12 rounded-full bg-primary items-center justify-center shadow-lg"
                  activeOpacity={0.7}>
                  <ThemedIcon name="arrow-up" color="inverse" />
               </TouchableOpacity>
            </Animated.View>
         )}
      </ThemedView>
   );
};
