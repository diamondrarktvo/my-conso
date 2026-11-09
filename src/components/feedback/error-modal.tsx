import React, { useState } from 'react';
import { Modal, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '../ui/themed-view';
import { ThemedText } from '../ui/themed-text';
import { ThemedButton } from '../ui/themed-button';
import { ThemedIcon } from '../ui/themed-icon';
import { cn } from '@/src/utils/tailwind';
import { ClassifiedError } from '@/src/lib/error-handler';
import { ENV } from '@/src/lib/env';

interface ErrorModalProps {
   visible: boolean;
   error: ClassifiedError | null;
   onRetry?: () => void;
   onDismiss: () => void;
}

// ---------------------------------------------------------------------------
// Dev panel — only rendered in development
// ---------------------------------------------------------------------------

const DevPanel: React.FC<{ error: ClassifiedError }> = ({ error }) => {
   const [expanded, setExpanded] = useState(false);
   const { t } = useTranslation('errors');
   const { devInfo } = error;

   return (
      <ThemedView className="mt-4 rounded-xl overflow-hidden border border-danger">
         {/* Header */}
         <TouchableOpacity
            onPress={() => setExpanded(v => !v)}
            activeOpacity={0.8}>
            <ThemedView className="flex-row items-center justify-between px-3 py-2 bg-danger">
               <ThemedView className="flex-row items-center gap-2 bg-transparent">
                  <ThemedIcon name="bug" size="sm" customColor="#fff" />
                  <ThemedText variant="label" weight="bold" color="inverse">
                     {t('modal.dev_panel_title')}
                  </ThemedText>
               </ThemedView>
               <ThemedIcon
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size="sm"
                  customColor="#fff"
               />
            </ThemedView>
         </TouchableOpacity>

         {expanded && (
            <ThemedView className="bg-background-secondary px-3 py-3 gap-2">
               {/* Error class + status */}
               <ThemedView className="flex-row flex-wrap gap-2 bg-transparent">
                  <ThemedView className="bg-danger px-2 py-0.5 rounded-md bg-opacity-15">
                     <ThemedText variant="caption" color="danger" tracking="wide">
                        {devInfo.errorClass}
                     </ThemedText>
                  </ThemedView>
               </ThemedView>

               {/* Original message */}
               <ThemedView className="bg-transparent">
                  <ThemedText variant="caption" color="muted" className="mb-0.5">
                     {t('modal.message_label')}
                  </ThemedText>
                  <ThemedText variant="caption" color="default" className="font-mono">
                     {devInfo.originalMessage}
                  </ThemedText>
               </ThemedView>

               {/* Location */}
               {devInfo.location && (
                  <ThemedView className="bg-transparent">
                     <ThemedText variant="caption" color="muted" className="mb-0.5">
                        {t('modal.origin')}
                     </ThemedText>
                     <ThemedText variant="caption" color="default" className="font-mono">
                        {devInfo.location.file}:{devInfo.location.line} · {devInfo.location.method}()
                     </ThemedText>
                  </ThemedView>
               )}

               {/* Stack trace */}
               {devInfo.stack && (
                  <ThemedView className="bg-transparent">
                     <ThemedText variant="caption" color="muted" className="mb-0.5">
                        {t('modal.stack_trace')}
                     </ThemedText>
                     <ScrollView
                        style={{ maxHeight: 120 }}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator>
                        <ThemedText variant="caption" color="secondary" className="font-mono leading-relaxed">
                           {devInfo.stack}
                        </ThemedText>
                     </ScrollView>
                  </ThemedView>
               )}
            </ThemedView>
         )}
      </ThemedView>
   );
};

// ---------------------------------------------------------------------------
// Severity → icon + color class
// ---------------------------------------------------------------------------

const SEVERITY_CONFIG = {
   fatal: { icon: 'server-crash' as const, colorClass: 'bg-danger', textColor: 'danger' as const },
   error: { icon: 'alert-circle' as const, colorClass: 'bg-warning', textColor: 'warning' as const },
   warning: { icon: 'alert-triangle' as const, colorClass: 'bg-warning', textColor: 'warning' as const },
};

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

export const ErrorModal: React.FC<ErrorModalProps> = ({
   visible,
   error,
   onRetry,
   onDismiss,
}) => {
   const insets = useSafeAreaInsets();
   const { t } = useTranslation('errors');
   if (!error) return null;

   const config = SEVERITY_CONFIG[error.severity];

   return (
      <Modal
         visible={visible}
         transparent
         animationType="fade"
         statusBarTranslucent
         onRequestClose={onDismiss}>
         {/* Backdrop */}
         <TouchableOpacity
            className="flex-1 bg-black/60 items-center justify-center px-6"
            activeOpacity={1}
            onPress={onDismiss}>
            {/* Card — stops tap propagation */}
            <TouchableOpacity activeOpacity={1} className="w-full">
               <ThemedView
                  className="w-full rounded-2xl overflow-hidden bg-card"
                  style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 8 }}>

                  {/* DEV badge strip */}
                  {ENV.IS_DEV && (
                     <ThemedView className="bg-danger px-4 py-1">
                        <ThemedText
                           variant="caption"
                           color="inverse"
                           weight="bold"
                           align="center"
                           transform="uppercase"
                           tracking="wider">
                           {t('modal.dev_badge')}
                        </ThemedText>
                     </ThemedView>
                  )}

                  <ThemedView className="px-6 pt-6 pb-4 bg-card">
                     {/* Icon */}
                     <ThemedView className="items-center mb-4 bg-transparent">
                        <ThemedView
                           className={cn(
                              'w-16 h-16 rounded-full items-center justify-center',
                              config.colorClass,
                              'opacity-90'
                           )}>
                           <ThemedIcon
                              name={config.icon}
                              customSize={32}
                              customColor="#fff"
                              strokeWidth={1.5}
                           />
                        </ThemedView>
                     </ThemedView>

                     {/* Title */}
                     <ThemedText variant="h3" weight="bold" align="center" className="mb-2">
                        {error.title}
                     </ThemedText>

                     {/* Message */}
                     {ENV.APP_ENV === "production" && (
                        <ThemedText
                           variant="body"
                           color="secondary"
                           align="center"
                           leading="relaxed">
                           {error.devInfo?.originalMessage ?? error.message}
                        </ThemedText>
                     )}

                     {/* Dev panel */}
                     {ENV.IS_DEV && <DevPanel error={error} />}

                     {/* Actions */}
                     <ThemedView className="mt-6 gap-3 bg-transparent">
                        {error.canRetry && onRetry && (
                           <ThemedButton
                              title={t('actions.retry')}
                              variant="primary"
                              size="lg"
                              fullWidth
                              leftIcon={<ThemedIcon name="refresh-cw" size="md" color="inverse" />}
                              onPress={() => {
                                 onDismiss();
                                 onRetry();
                              }}
                           />
                        )}
                        <ThemedButton
                           title={t('actions.close')}
                           variant={error.canRetry && onRetry ? 'outline' : 'primary'}
                           size="lg"
                           fullWidth
                           onPress={onDismiss}
                        />
                     </ThemedView>
                  </ThemedView>
               </ThemedView>
            </TouchableOpacity>
         </TouchableOpacity>
      </Modal>
   );
};
