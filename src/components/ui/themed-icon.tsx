import React from 'react';
import { ViewProps } from 'react-native';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { ThemedView } from './themed-view';

// All icons commonly used
import {
   // Navigation & Actions
   Home as IconHome,
   Search,
   Bell,
   User,
   Settings,
   Menu,
   ArrowUp,
   ArrowDown,
   ArrowLeft,
   ArrowRight,
   ChevronDown,
   ChevronUp,
   ChevronRight,
   X,
   Plus,
   Minus,

   // Places & time
   MapPin,
   Clock,
   Star,
   Heart,
   Share2,
   Phone,
   Navigation,
   Bookmark,
   Users,

   // Auth & Forms
   Mail,
   Lock,
   Eye,
   EyeOff,
   Check,
   AlertCircle,
   Info,

   // Social
   ThumbsUp,
   MessageCircle,

   // Status
   Wifi,
   ServerCrash,
   RefreshCw,
   ExternalLink,
   Bug,
   AlertTriangle,
   Camera,
   Zap,
   ZapOff,
   Scan,

   // Profil
   Sun,
   Moon,
   Monitor,
   Globe,
   Headphones,
   CheckCircle,
   XCircle,
   CalendarX,
   Calendar,

   // Fuel app
   Pencil,
   Trash2,
   Image as ImageIcon,
   Car,
   Database,
   Palette,
   SlidersHorizontal,
   History,
   BarChart3,
} from 'lucide-react-native';
import { cn } from '@/src/utils/tailwind';

export type IconName =
   // Navigation & Actions
   | 'home'
   | 'search'
   | 'bell'
   | 'camera'
   | 'user'
   | 'settings'
   | 'menu'
   | 'arrow-left'
   | 'arrow-right'
   | 'chevron-down'
   | 'chevron-up'
   | 'chevron-right'
   | 'check-circle'
   | 'x-circle'
   | 'x'
   | 'plus'
   | 'minus'
   | 'arrow-up'
   | 'arrow-down'
   | 'external-link'

   // Places & time
   | 'map-pin'
   | 'clock'
   | 'star'
   | 'heart'
   | 'share'
   | 'phone'
   | 'navigation'
   | 'bookmark'
   | 'users'

   // Auth & Forms
   | 'mail'
   | 'lock'
   | 'eye'
   | 'eye-off'
   | 'check'
   | 'alert-circle'
   | 'info'

   // Social
   | 'thumbs-up'
   | 'message-circle'

   // Status
   | 'wifi'
   | 'server-crash'
   | 'refresh'
   | 'refresh-cw'
   | 'bug'
   | 'alert-triangle'
   | 'scan-qr'
   | 'zap'
   | 'zap-off'

   // Profil
   | 'sun'
   | 'moon'
   | 'monitor'
   | 'globe'
   | 'headphones'
   | 'calendar-x'
   | 'calendar'

   // Fuel app
   | 'pencil'
   | 'trash'
   | 'image'
   | 'car'
   | 'database'
   | 'palette'
   | 'sliders'
   | 'history'
   | 'bar-chart';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type IconColor =
   | 'default'
   | 'primary'
   | 'secondary'
   | 'muted'
   | 'success'
   | 'warning'
   | 'danger'
   | 'inverse'
   | 'current';

export interface ThemedIconProps extends Omit<ViewProps, 'children'> {
   /** Name of the icon to display */
   name: IconName;

   /** Size variant */
   size?: IconSize;

   /** Custom size in pixels (overrides size variant) */
   customSize?: number;

   /** Color variant */
   color?: IconColor;

   /** Custom color (overrides color variant) */
   customColor?: string;

   /** Stroke width (for outlined icons) */
   strokeWidth?: number;

   /** Whether to fill the icon (for icons that support fill) */
   filled?: boolean;

   /** Additional className for the container */
   className?: string;

   /** Test ID */
   testID?: string;
}

// Map icon names to their components
const iconMap: Record<IconName, React.ComponentType<any>> = {
   // Navigation & Actions
   home: IconHome,
   search: Search,
   bell: Bell,
   camera: Camera,
   user: User,
   settings: Settings,
   menu: Menu,
   'arrow-left': ArrowLeft,
   'arrow-right': ArrowRight,
   'chevron-down': ChevronDown,
   'chevron-up': ChevronUp,
   'chevron-right': ChevronRight,
   x: X,
   plus: Plus,
   minus: Minus,
   'arrow-up': ArrowUp,
   'arrow-down': ArrowDown,
   'external-link': ExternalLink,
   'check-circle': CheckCircle,
   'x-circle': XCircle,

   // Places & time
   'map-pin': MapPin,
   clock: Clock,
   star: Star,
   heart: Heart,
   share: Share2,
   phone: Phone,
   navigation: Navigation,
   bookmark: Bookmark,
   users: Users,

   // Auth & Forms
   mail: Mail,
   lock: Lock,
   eye: Eye,
   'eye-off': EyeOff,
   check: Check,
   'alert-circle': AlertCircle,
   info: Info,

   // Social
   'thumbs-up': ThumbsUp,
   'message-circle': MessageCircle,

   // Status
   "scan-qr": Scan,
   zap: Zap,
   'zap-off': ZapOff,
   wifi: Wifi,
   'server-crash': ServerCrash,
   refresh: RefreshCw,
   'refresh-cw': RefreshCw,
   bug: Bug,
   'alert-triangle': AlertTriangle,

   // Profil
   sun: Sun,
   moon: Moon,
   monitor: Monitor,
   globe: Globe,
   headphones: Headphones,
   'calendar-x': CalendarX,
   'calendar': Calendar,

   // Fuel app
   pencil: Pencil,
   trash: Trash2,
   image: ImageIcon,
   car: Car,
   database: Database,
   palette: Palette,
   sliders: SlidersHorizontal,
   history: History,
   'bar-chart': BarChart3,
};

// Size mappings (in pixels)
const sizeMap = {
   xs: 16,
   sm: 18,
   md: 20,
   lg: 22,
   xl: 24,
   xxl: 32,
};

// Container size classes for consistent hit areas
const containerSizeMap = {
   xs: 'w-5 h-5', // 20px container for 16px icon
   sm: 'w-6 h-6', // 24px container for 18px icon
   md: 'w-7 h-7', // 28px container for 20px icon
   lg: 'w-8 h-8', // 32px container for 22px icon
   xl: 'w-9 h-9', // 36px container for 24px icon
   xxl: 'w-12 h-12', // 48px container for 32px icon
};

/**
 * ThemedIcon component - A reusable icon component that respects the app's theme.
 *
 * @example
 * // Basic usage
 * <ThemedIcon name="star" size="md" color="primary" />
 *
 * @example
 * // With custom color and size
 * <ThemedIcon name="heart" customSize={24} customColor="#FF0000" filled />
 *
 * @example
 * // As a touchable element
 * <TouchableOpacity>
 *   <ThemedIcon name="settings" size="lg" color="secondary" />
 * </TouchableOpacity>
 *
 * @param {ThemedIconProps} props - Props for the ThemedIcon component
 * @param {IconName} props.name - The name of the icon to display
 * @param {IconSize} [props.size='md'] - The size variant of the icon
 * @param {number} [props.customSize] - Custom size in pixels (overrides size variant)
 * @param {IconColor} [props.color='default'] - The color variant of the icon
 * @param {string} [props.customColor] - Custom color (overrides color variant)
 * @param {number} [props.strokeWidth=1.5] - Stroke width for outlined icons
 * @param {boolean} [props.filled=false] - Whether to fill the icon (for icons that support fill)
 * @param {string} [props.className] - Additional className for the container
 * @param {string} [props.testID] - Test ID for testing purposes
 */

// ========================================================================
// HOW TO ADD A NEW ICON:
// ========================================================================
//
// 1. Import the icon from 'lucide-react-native' at the top of this file:
//    import { MyNewIcon } from 'lucide-react-native';
//
// 2. Add the icon name to the IconName type union below:
//    | 'my-new-icon'
//
// 3. Add the mapping in the iconMap object below:
//    'my-new-icon': MyNewIcon,
//
// 4. (Optional) Add a pre-configured component at the bottom of the file:
//    export const MyNewIconComponent: React.FC<Omit<ThemedIconProps, 'name'>> = (props) => (
//       <ThemedIcon name="my-new-icon" {...props} />
//    );
//
// ========================================================================
export const ThemedIcon: React.FC<ThemedIconProps> = ({
   name,
   size = 'md',
   customSize,
   color = 'default',
   customColor,
   strokeWidth = 1.5,
   filled = false,
   className = '',
   testID,
   ...props
}) => {
   // Hooks must run unconditionally: resolve every theme color first, then pick one.
   const primaryColor = useThemeColor('--color-primary', 'primary');
   const secondaryColor =
      useThemeColor('--color-foreground-secondary', 'foregroundSecondary');
   const mutedColor =
      useThemeColor('--color-foreground-muted', 'foregroundMuted');
   const successColor = useThemeColor('--color-success', 'success');
   const warningColor = useThemeColor('--color-warning', 'warning');
   const dangerColor = useThemeColor('--color-danger', 'danger');
   const inverseColor =
      useThemeColor('--color-foreground-inverse', 'foregroundInverse');
   const defaultColor = useThemeColor('--color-foreground', 'foreground');

   const getThemeColor = () => {
      if (customColor) return customColor;

      switch (color) {
         case 'primary':
            return primaryColor;
         case 'secondary':
            return secondaryColor;
         case 'muted':
            return mutedColor;
         case 'success':
            return successColor;
         case 'warning':
            return warningColor;
         case 'danger':
            return dangerColor;
         case 'inverse':
            return inverseColor;
         case 'current':
            return 'currentColor';
         case 'default':
         default:
            return defaultColor;
      }
   };

   const IconComponent = iconMap[name];

   if (!IconComponent) {
      console.warn(`Icon "${name}" not found in iconMap`);
      return null;
   }

   const iconSize = customSize || sizeMap[size];
   const iconColor = getThemeColor();

   // For filled icons, we need to pass the fill prop
   const iconProps: any = {
      size: iconSize,
      color: iconColor,
      strokeWidth,
   };

   if (filled) {
      iconProps.fill = iconColor;
   }

   return (
      <ThemedView
         bg="transparent"
         className={cn('items-center justify-center', containerSizeMap[size], className)}
         testID={testID}
         {...props}>
         <IconComponent {...iconProps} />
      </ThemedView>
   );
};
