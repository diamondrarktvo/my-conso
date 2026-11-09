import { useCSSVariable } from 'uniwind';
import { COLORS } from '@/src/constants/color';
import { useTheme } from '@/src/theme/ThemeProvider';

type ColorKey = keyof (typeof COLORS)['light'];

// Reanimated and SVG props only understand hex / rgb(a) / hsl(a) strings.
// useCSSVariable can return "unset" or an unresolved oklch() value, which crashes Reanimated.
const NATIVE_COLOR = /^(#[0-9a-f]{3,8}|rgba?\(|hsla?\()/i;

/** Resolves a theme color for JS props, falling back to the COLORS constants when the CSS variable is unusable. */
export function useThemeColor(cssVariable: string, fallbackKey: ColorKey): string {
   const { effectiveTheme } = useTheme();
   const value = useCSSVariable(cssVariable);
   return typeof value === 'string' && NATIVE_COLOR.test(value.trim())
      ? value.trim()
      : COLORS[effectiveTheme][fallbackKey];
}
