import React from 'react';
import { useTranslation } from 'react-i18next';
import { ThemedFab } from '@/src/components/ui/themed-fab';

/** "+ Ajouter un plein" floating button (Home and History). */
export function AddEntryFab({ onPress }: { onPress: () => void }) {
   const { t } = useTranslation('fuel');
   return <ThemedFab label={t('add_entry')} icon="plus" onPress={onPress} />;
}
