import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { ThemedView } from '@/src/components/ui/themed-view';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedInput } from '@/src/components/ui/themed-input';
import { ThemedButton } from '@/src/components/ui/themed-button';
import { TabScreen } from '@/src/features/fuel/components/tab-screen';
import { SegmentedControl } from '@/src/features/fuel/components/segmented-control';
import { useFuelStore } from '@/src/features/fuel/store';
import { useTheme, type ThemeMode } from '@/src/theme/ThemeProvider';
import { showToast } from '@/src/providers/toast-provider';
import { showError } from '@/src/providers/error-provider';
import { parseDecimal, formatNumber } from '@/src/lib/format';
import { parseBackupJson, toBackupJson, toCsv } from '@/src/lib/data-io';
import { DEFAULT_SETTINGS } from '@/src/features/fuel/types';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
   return (
      <ThemedView variant="card" padding="md" rounded="xl" border="subtle" gap="md">
         <ThemedText variant="body-large" weight="bold">
            {title}
         </ThemedText>
         {children}
      </ThemedView>
   );
}

export function SettingsScreen() {
   const { t } = useTranslation('fuel');
   const { theme, setTheme } = useTheme();
   const settings = useFuelStore(s => s.settings);
   const entries = useFuelStore(s => s.entries);
   const updateSettings = useFuelStore(s => s.updateSettings);
   const replaceAll = useFuelStore(s => s.replaceAll);
   const clearAll = useFuelStore(s => s.clearAll);

   const [name, setName] = useState(settings.vehicleName);
   const [tank, setTank] = useState(settings.tankCapacityLiters != null ? formatNumber(settings.tankCapacityLiters, 1).replace(/,0$/, '') : '');
   const [currency, setCurrency] = useState(settings.currency);
   const [threshold, setThreshold] = useState(String(settings.alertThresholdPercent));

   const commitName = () => updateSettings({ vehicleName: name.trim() || DEFAULT_SETTINGS.vehicleName });
   const commitTank = () => {
      const v = parseDecimal(tank);
      updateSettings({ tankCapacityLiters: v != null && v > 0 ? v : undefined });
   };
   const commitCurrency = () => updateSettings({ currency: currency.trim() || DEFAULT_SETTINGS.currency });
   const commitThreshold = () => {
      const v = parseDecimal(threshold);
      const next = v != null && v > 0 ? v : DEFAULT_SETTINGS.alertThresholdPercent;
      setThreshold(String(next));
      updateSettings({ alertThresholdPercent: next });
   };

   const share = async (filename: string, content: string, mimeType: string) => {
      try {
         if (!(await Sharing.isAvailableAsync())) {
            showToast('error', t('settings.export_error'));
            return;
         }
         const file = new File(Paths.cache, filename);
         if (file.exists) file.delete();
         file.create();
         file.write(content);
         await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: filename });
      } catch (e) {
         showError(e);
      }
   };

   const stamp = new Date().toISOString().slice(0, 10);
   const exportJson = () => share(`my-conso-${stamp}.json`, toBackupJson(entries, settings), 'application/json');
   const exportCsv = () => share(`my-conso-${stamp}.csv`, toCsv(entries), 'text/csv');

   const importBackup = async () => {
      try {
         const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'], copyToCacheDirectory: true });
         if (res.canceled || !res.assets?.[0]) return;
         const text = await new File(res.assets[0].uri).text();
         const parsed = parseBackupJson(text);
         if (!parsed.ok) {
            showToast('error', t('settings.import_error'));
            return;
         }
         Alert.alert(t('settings.import_confirm_title'), t('settings.import_confirm_text', { count: parsed.entries.length }), [
            { text: t('common.cancel'), style: 'cancel' },
            {
               text: t('common.confirm'),
               style: 'destructive',
               onPress: () => {
                  replaceAll({ entries: parsed.entries, settings: parsed.settings });
                  setName(parsed.settings.vehicleName);
                  setTank(parsed.settings.tankCapacityLiters != null ? String(parsed.settings.tankCapacityLiters).replace('.', ',') : '');
                  setCurrency(parsed.settings.currency);
                  setThreshold(String(parsed.settings.alertThresholdPercent));
                  showToast('success', t('settings.import_done'));
               },
            },
         ]);
      } catch (e) {
         showError(e);
      }
   };

   const clearData = () =>
      Alert.alert(t('settings.clear_confirm_title'), t('settings.clear_confirm_text'), [
         { text: t('common.cancel'), style: 'cancel' },
         {
            text: t('common.continue'),
            style: 'destructive',
            onPress: () =>
               Alert.alert(t('settings.clear_confirm_2_title'), t('settings.clear_confirm_2_text'), [
                  { text: t('common.cancel'), style: 'cancel' },
                  {
                     text: t('settings.clear'),
                     style: 'destructive',
                     onPress: () => {
                        clearAll();
                        setName(DEFAULT_SETTINGS.vehicleName);
                        setTank('');
                        setCurrency(DEFAULT_SETTINGS.currency);
                        setThreshold(String(DEFAULT_SETTINGS.alertThresholdPercent));
                        showToast('success', t('settings.clear_done'));
                     },
                  },
               ]),
         },
      ]);

   const themeOptions: { value: ThemeMode; label: string }[] = [
      { value: 'system', label: t('settings.theme_system') },
      { value: 'light', label: t('settings.theme_light') },
      { value: 'dark', label: t('settings.theme_dark') },
   ];

   return (
      <TabScreen>
         <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }} keyboardShouldPersistTaps="handled">
            <ThemedText variant="h2" weight="bold">
               {t('settings.title')}
            </ThemedText>

            <Section title={t('settings.vehicle')}>
               <ThemedInput label={t('settings.vehicle_name')} value={name} onChangeText={setName} onBlur={commitName} size="lg" />
               <ThemedInput
                  label={t('settings.tank')}
                  helperText={t('settings.tank_help')}
                  value={tank}
                  onChangeText={setTank}
                  onBlur={commitTank}
                  keyboardType="decimal-pad"
                  size="lg"
               />
               <ThemedInput label={t('settings.currency')} value={currency} onChangeText={setCurrency} onBlur={commitCurrency} maxLength={6} size="lg" />
               <ThemedInput
                  label={t('settings.alert_threshold')}
                  helperText={t('settings.alert_threshold_help')}
                  value={threshold}
                  onChangeText={setThreshold}
                  onBlur={commitThreshold}
                  keyboardType="decimal-pad"
                  size="lg"
               />
            </Section>

            <Section title={t('settings.appearance')}>
               <SegmentedControl options={themeOptions} value={theme} onChange={setTheme} />
            </Section>

            <Section title={t('settings.data')}>
               <ThemedButton title={t('settings.export_json')} variant="secondary" size="lg" fullWidth onPress={exportJson} />
               <ThemedButton title={t('settings.export_csv')} variant="secondary" size="lg" fullWidth onPress={exportCsv} />
               <ThemedButton title={t('settings.import')} variant="outline" size="lg" fullWidth onPress={importBackup} />
               <ThemedButton title={t('settings.clear')} variant="danger" size="lg" fullWidth onPress={clearData} />
            </Section>
         </ScrollView>
      </TabScreen>
   );
}
