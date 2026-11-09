import React from 'react';
import { Pressable } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/src/components/ui/themed-text';
import { useThemeColor } from '@/src/hooks/use-theme-color';

/** Floating "+ Ajouter un plein" button. Parent must be a relatively positioned full-screen view. */
export function AddFab({ onPress }: { onPress: () => void }) {
   const { t } = useTranslation('fuel');
   const iconColor = useThemeColor('--color-foreground-inverse', 'foregroundInverse');
   return (
      <Pressable
         onPress={onPress}
         accessibilityRole="button"
         accessibilityLabel={t('add_entry')}
         style={{ position: 'absolute', right: 16, bottom: 16, minHeight: 52 }}
         className="bg-primary flex-row items-center gap-2 rounded-full px-5 py-3 shadow-lg active:opacity-80">
         <Plus size={22} color={iconColor} strokeWidth={3} />
         <ThemedText weight="bold" color="inverse">
            {t('add_entry')}
         </ThemedText>
      </Pressable>
   );
}
