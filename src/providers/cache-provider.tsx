import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { createMMKV } from 'react-native-mmkv';

// Initialize separate MMKV instance for cache
export const cacheStorage = createMMKV({
   id: 'my-conso-cache-storage',
});

interface CacheItem<T> {
   value: T;
   timestamp: number;
   expiresAt?: number;
}

interface CacheOptions {
   /** Time to live in milliseconds */
   ttl?: number;
   /** Whether to encrypt the value */
   encrypt?: boolean;
}

interface CacheContextType {
   /** Set a value in cache */
   set: <T>(key: string, value: T, options?: CacheOptions) => void;

   /** Get a value from cache */
   get: <T>(key: string) => T | null;

   /** Get a value with default fallback */
   getOrDefault: <T>(key: string, defaultValue: T) => T;

   /** Check if key exists and is not expired */
   has: (key: string) => boolean;

   /** Remove a specific key */
   remove: (key: string) => void;

   /** Clear all cache */
   clear: () => void;

   /** Get multiple values at once */
   getMany: <T>(keys: string[]) => (T | null)[];

   /** Set multiple values at once */
   setMany: <T>(entries: [string, T][], options?: CacheOptions) => void;

   /** Get cache stats */
   getStats: () => {
      totalKeys: number;
      totalSize: number;
      expiredKeys: number;
   };

   /** Clear expired items */
   prune: () => void;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

// Cache key prefixes for organization
export const CACHE_KEYS = {
   // App settings
   THEME: 'app_theme',
   LANGUAGE: 'app_language',

   // App state
   ONBOARDING_COMPLETED: 'app_onboarding',
   LAST_VERSION: 'app_last_version',
   FEATURE_FLAGS: 'app_feature_flags',
} as const;

export const CacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   // Check if an item is expired
   const isExpired = (item: CacheItem<any>): boolean => {
      if (!item.expiresAt) return false;
      return Date.now() > item.expiresAt;
   };

   // Set a value in cache
   const set = <T,>(key: string, value: T, options: CacheOptions = {}): void => {
      try {
         const cacheItem: CacheItem<T> = {
            value,
            timestamp: Date.now(),
            expiresAt: options.ttl ? Date.now() + options.ttl : undefined,
         };

         const serialized = JSON.stringify(cacheItem);

         if (options.encrypt) {
            // You could add encryption here if needed
            // For now, we'll just store as is
         }

         cacheStorage.set(key, serialized);
      } catch (error) {
         console.error(`Failed to cache key ${key}:`, error);
      }
   };

   // Get a value from cache
   const get = <T,>(key: string): T | null => {
      try {
         const serialized = cacheStorage.getString(key);
         if (!serialized) return null;

         const cacheItem = JSON.parse(serialized) as CacheItem<T>;

         // Check if expired
         if (isExpired(cacheItem)) {
            cacheStorage.remove(key);
            return null;
         }

         return cacheItem.value;
      } catch (error) {
         console.error(`Failed to get cache key ${key}:`, error);
         return null;
      }
   };

   // Get value with default fallback
   const getOrDefault = <T,>(key: string, defaultValue: T): T => {
      const value = get<T>(key);
      return value !== null ? value : defaultValue;
   };

   // Check if key exists and is not expired
   const has = (key: string): boolean => {
      return get(key) !== null;
   };

   // Remove a specific key
   const remove = (key: string): void => {
      cacheStorage.remove(key);
   };

   // Clear all cache
   const clear = (): void => {
      cacheStorage.clearAll();
   };

   // Get multiple values at once
   const getMany = <T,>(keys: string[]): (T | null)[] => {
      return keys.map(key => get<T>(key));
   };

   // Set multiple values at once
   const setMany = <T,>(entries: [string, T][], options: CacheOptions = {}): void => {
      entries.forEach(([key, value]) => {
         set(key, value, options);
      });
   };

   // Get cache statistics
   const getStats = useCallback(() => {
      const keys = cacheStorage.getAllKeys();
      let totalSize = 0;
      let expiredKeys = 0;

      keys.forEach(key => {
         const value = cacheStorage.getString(key);
         if (value) {
            totalSize += value.length;

            try {
               const item = JSON.parse(value);
               if (isExpired(item)) {
                  expiredKeys++;
               }
            } catch {
               // Ignore parsing errors
            }
         }
      });

      return {
         totalKeys: keys.length,
         totalSize,
         expiredKeys,
      };
   }, []);

   // Clear expired items
   const prune = useCallback((): void => {
      const keys = cacheStorage.getAllKeys();

      keys.forEach(key => {
         try {
            const serialized = cacheStorage.getString(key);
            if (!serialized) return;

            const cacheItem = JSON.parse(serialized);
            if (isExpired(cacheItem)) {
               cacheStorage.remove(key);
            }
         } catch {
            // If we can't parse it, maybe it's corrupted - remove it
            cacheStorage.remove(key);
         }
      });
   }, []);

   // Initialize cache and prune expired items on mount
   useEffect(() => {
      prune();

      // Optional: Set up periodic cleanup
      const interval = setInterval(prune, 1000 * 60 * 60); // Every hour
      return () => clearInterval(interval);
   }, [prune]);

   return (
      <CacheContext.Provider
         value={{
            set,
            get,
            getOrDefault,
            has,
            remove,
            clear,
            getMany,
            setMany,
            getStats,
            prune,
         }}>
         {children}
      </CacheContext.Provider>
   );
};

// Custom hook for using cache
export const useCache = () => {
   const context = useContext(CacheContext);
   if (!context) {
      throw new Error('useCache must be used within CacheProvider');
   }
   return context;
};

// App settings cache
export const useAppSettings = () => {
   const cache = useCache();

   const getLanguage = (): string => {
      return cache.get<string>(CACHE_KEYS.LANGUAGE) ?? 'fr';
   };

   const setLanguage = (language: string) => {
      cache.set(CACHE_KEYS.LANGUAGE, language);
   };

   return {
      getLanguage,
      setLanguage,
   };
};
