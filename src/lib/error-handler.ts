/**
 * Error classification and stack trace parsing.
 *
 * Pure functions — no React. Safe to import anywhere.
 *
 * Usage:
 *   import { classifyError } from '@/src/lib/error-handler';
 *   const info = classifyError(error);
 *   showError(error);           // preferred — goes through error-provider
 */

import i18next from 'i18next';
import { ENV } from './env';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ErrorSeverity = 'fatal' | 'error' | 'warning';

export interface ErrorLocation {
   file: string;
   method: string;
   line: number;
   column: number;
}

export interface DevErrorInfo {
   errorClass: string;
   originalMessage: string;
   location?: ErrorLocation;
   /** Full raw stack string */
   stack?: string;
}

export interface ClassifiedError {
   title: string;
   message: string;
   severity: ErrorSeverity;
   canRetry: boolean;
   devInfo: DevErrorInfo;
}

// ---------------------------------------------------------------------------
// i18n helpers — resolved at call time so language switches take effect
// ---------------------------------------------------------------------------

function t(key: string): string {
   return i18next.t(key as any);
}

// ---------------------------------------------------------------------------
// Stack trace parser
// Handles both Hermes (`at fn (file:line:col)`) and JSC (`fn@file:line:col`)
// ---------------------------------------------------------------------------

// Frames to skip — internal plumbing, not useful for debugging
const SKIP_PATTERNS = [
   'error-handler',
   'error-provider',
   'node_modules',
   'react-native/Libraries',
   'native code',
   '<anonymous>',
];

export function parseStackTrace(stack?: string): ErrorLocation | undefined {
   if (!stack || !ENV.IS_DEV) return undefined;

   const lines = stack.split('\n');

   for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || SKIP_PATTERNS.some(p => trimmed.includes(p))) continue;

      // Hermes format: at methodName (path/to/file.tsx:42:10)
      const hermesMatch = trimmed.match(/^at\s+([\w$.]+)?\s*\((.+):(\d+):(\d+)\)$/);
      if (hermesMatch) {
         return {
            method: hermesMatch[1] ?? '(anonymous)',
            file: hermesMatch[2].split('/').pop() ?? hermesMatch[2],
            line: parseInt(hermesMatch[3], 10),
            column: parseInt(hermesMatch[4], 10),
         };
      }

      // JSC format: methodName@path/to/file.tsx:42:10
      const jscMatch = trimmed.match(/^([\w$.]+)?@(.+):(\d+):(\d+)$/);
      if (jscMatch) {
         return {
            method: jscMatch[1] ?? '(anonymous)',
            file: jscMatch[2].split('/').pop() ?? jscMatch[2],
            line: parseInt(jscMatch[3], 10),
            column: parseInt(jscMatch[4], 10),
         };
      }
   }

   return undefined;
}

// ---------------------------------------------------------------------------
// Main classifier
// ---------------------------------------------------------------------------

export function classifyError(error: unknown): ClassifiedError {
   // --- Standard JS Error ---
   if (error instanceof Error) {
      return {
         title: t('errors:unknown.title'),
         message: t('errors:unknown.message'),
         severity: 'error',
         canRetry: false,
         devInfo: {
            errorClass: error.name ?? 'Error',
            originalMessage: error.message,
            location: parseStackTrace(error.stack),
            stack: error.stack,
         },
      };
   }

   // --- Unknown thrown value (string, object, etc.) ---
   return {
      title: t('errors:unknown.title'),
      message: t('errors:unknown.message'),
      severity: 'error',
      canRetry: false,
      devInfo: {
         errorClass: 'UnknownError',
         originalMessage: String(error),
      },
   };
}
