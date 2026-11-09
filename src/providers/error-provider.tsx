/**
 * Global error handling provider.
 *
 * Exposes a module-level `showError()` callable from anywhere in the app
 * (providers, hooks, query callbacks, etc.) — no React context needed at
 * the call site.
 *
 * Usage:
 *   import { showError } from '@/src/providers/error-provider';
 *
 *   // Simple — auto-classifies any thrown value
 *   showError(error);
 *
 *   // With a retry callback
 *   showError(error, { onRetry: () => refetch() });
 */

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { ErrorModal } from '@/src/components/feedback/error-modal';
import { classifyError, ClassifiedError } from '@/src/lib/error-handler';

// ---------------------------------------------------------------------------
// Module-level ref — lets showError() work outside React tree
// ---------------------------------------------------------------------------

type ShowErrorFn = (error: unknown, options?: ErrorOptions) => void;

let _showError: ShowErrorFn | null = null;

export interface ErrorOptions {
   /** Called when user taps "Réessayer" — only shown if provided */
   onRetry?: () => void;
}

/**
 * Call this anywhere in the app to surface an error modal.
 *
 * @example
 *   try { ... } catch (e) { showError(e); }
 *   mutation({ onError: (e) => showError(e, { onRetry: () => mutation() }) })
 */
export const showError: ShowErrorFn = (error, options) => {
   if (_showError) {
      _showError(error, options);
   } else if (__DEV__) {
      // Provider not yet mounted — log to console as fallback
      console.error('[ErrorProvider] not mounted yet. Error:', error);
   }
};

// ---------------------------------------------------------------------------
// Context (optional — only needed if components want to call showError
// via hook rather than the module-level import)
// ---------------------------------------------------------------------------

interface ErrorContextType {
   showError: ShowErrorFn;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useErrorHandler = (): ShowErrorFn => {
   const ctx = useContext(ErrorContext);
   if (!ctx) throw new Error('useErrorHandler must be used within ErrorProvider');
   return ctx.showError;
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface ErrorState {
   classified: ClassifiedError;
   onRetry?: () => void;
}

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   const [visible, setVisible] = useState(false);
   const [errorState, setErrorState] = useState<ErrorState | null>(null);

   // Keep a ref to the latest show fn to avoid stale closures in module ref
   const showErrorFn = useCallback<ShowErrorFn>((error, options) => {
      const classified = classifyError(error);

      if (__DEV__) {
         console.group(`[Error] ${classified.devInfo.errorClass}`);
         console.error('Classified:', classified);
         if (classified.devInfo.stack) console.log(classified.devInfo.stack);
         console.groupEnd();
      }

      setErrorState({ classified, onRetry: options?.onRetry });
      setVisible(true);
   }, []);

   // Register the module-level fn when the provider mounts
   const registered = useRef(false);
   if (!registered.current) {
      _showError = showErrorFn;
      registered.current = true;
   }

   const handleDismiss = useCallback(() => {
      setVisible(false);
   }, []);

   return (
      <ErrorContext.Provider value={{ showError: showErrorFn }}>
         {children}
         <ErrorModal
            visible={visible}
            error={errorState?.classified ?? null}
            onRetry={errorState?.onRetry}
            onDismiss={handleDismiss}
         />
      </ErrorContext.Provider>
   );
};
