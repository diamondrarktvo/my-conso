/**
 * Centralised access to environment variables.
 * Always import from here — never use process.env directly in feature code.
 */

export const ENV = {
   APP_ENV: (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') as 'development' | 'preview' | 'production',
   IS_DEV: (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') === 'development',
} as const;
