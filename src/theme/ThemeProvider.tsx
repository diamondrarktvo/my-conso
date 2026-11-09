// src/theme/ThemeProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Uniwind } from 'uniwind';
import { cacheStorage, CACHE_KEYS } from '@/src/providers/cache-provider';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
   theme: ThemeMode;
   setTheme: (theme: ThemeMode) => void;
   isDark: boolean;
   effectiveTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider is a context provider that manages the theme state of the app.
 * It loads the saved theme preference on mount and provides a way to update the theme preference.
 * It also provides the effective theme, which is either the system theme or the user-set theme.
 * The effective theme is used to update the CSS variables via @variant dark.
 * @example
 * <ThemeProvider>
 *    <App />
 * </ThemeProvider>
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   const systemColorScheme = useColorScheme();
   const [theme, setThemeState] = useState<ThemeMode>('system');
   const [isLoaded, setIsLoaded] = useState(false);

   // Load saved theme preference
   useEffect(() => {
      loadTheme();
   }, []);

   const loadTheme = async () => {
      try {
         const serialized = cacheStorage.getString(CACHE_KEYS.THEME);
         if (serialized) {
            const { value } = JSON.parse(serialized);
            if (['light', 'dark', 'system'].includes(value)) {
               setThemeState(value as ThemeMode);
            }
         }
      } catch (error) {
         console.error('Failed to load theme:', error);
      } finally {
         setIsLoaded(true);
      }
   };

   const setTheme = async (newTheme: ThemeMode) => {
      setThemeState(newTheme);
      cacheStorage.set(CACHE_KEYS.THEME, JSON.stringify({ value: newTheme, timestamp: Date.now() }));
      Uniwind.setTheme(newTheme);
   };

   // Determine effective theme
   const effectiveTheme: 'light' | 'dark' = theme === 'system' ? (systemColorScheme === 'dark' ? 'dark' : 'light') : theme;

   const isDark = effectiveTheme === 'dark';

   // Sync Uniwind on mount so dark/light CSS variables apply correctly from the start
   useEffect(() => {
      if (!isLoaded) return;
      Uniwind.setTheme(theme);
   // eslint-disable-next-line react-hooks/exhaustive-deps -- sync Uniwind once the stored theme is loaded; later changes go through setTheme
   }, [isLoaded]);


   if (!isLoaded) {
      return null;
   }

   return (
      <ThemeContext.Provider
         value={{
            theme,
            setTheme,
            isDark,
            effectiveTheme,
         }}>
         {children}
      </ThemeContext.Provider>
   );
};

export const useTheme = () => {
   const context = useContext(ThemeContext);
   if (!context) {
      throw new Error('useTheme must be used within a ThemeProvider');
   }
   return context;
};
