import React, { useState } from 'react';
import { Alert, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Car, Check, Database, Palette, Pencil, Plus, SlidersHorizontal, TriangleAlert, type LucideIcon } from 'lucide-react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { ThemedView } from '@/src/components/ui/themed-view';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedInput } from '@/src/components/ui/themed-input';
import { ThemedButton } from '@/src/components/ui/themed-button';
import { TabScreen } from '@/src/features/fuel/components/tab-screen';
import { VehicleAvatar } from '@/src/features/fuel/components/vehicle-avatar';
import { SegmentedControl } from '@/src/features/fuel/components/segmented-control';
import { useFuelStore } from '@/src/features/fuel/store';
import { useTheme, type ThemeMode } from '@/src/theme/ThemeProvider';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { showToast } from '@/src/providers/toast-provider';
import { showError } from '@/src/providers/error-provider';
import { parseDecimal, formatNumber } from '@/src/lib/format';
import { parseBackupJson, toBackupJson, toCsv } from '@/src/lib/data-io';
import { DEFAULT_SETTINGS } from '@/src/features/fuel/types';
import type { RootStackParamList } from '@/src/navigation/types';
import { cn } from '@/src/utils/tailwind';

function Section({
   icon: Icon,
   title,
   description,
   tone = 'default',
   children,
}: {
   icon: LucideIcon;
   title: string;
   description?: string;
   tone?: 'default' | 'danger';
   children: React.ReactNode;
}) {
   const primary = useThemeColor('--color-primary', 'primary');
   const danger = useThemeColor('--color-danger', 'danger');
   return (
      <ThemedView variant="card" padding="md" rounded="xl" border="subtle" gap="md">
         <ThemedView flex="row" items="center" gap="sm" className="bg-transparent">
            <Icon size={22} color={tone === 'danger' ? danger : primary} />
            <ThemedView className="flex-1 bg-transparent" gap="xs">
               <ThemedText variant="body-large" weight="bold" color={tone === 'danger' ? 'danger' : 'default'}>
                  {title}
               </ThemedText>
               {description ? (
                  <ThemedText variant="caption" color="secondary">
                     {description}
                  </ThemedText>
               ) : null}
            </ThemedView>
         </ThemedView>
         {children}
      </ThemedView>
   );
}

export function SettingsScreen() {
   const { t } = useTranslation('fuel');
   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
   const { theme, setTheme } = useTheme();
   const primary = useThemeColor('--color-primary', 'primary');
   const inverse = useThemeColor('--color-foreground-inverse', 'foregroundInverse');
   const muted = useThemeColor('--color-foreground-secondary', 'foregroundSecondary');

   const settings = useFuelStore(s => s.settings);
   const entries = useFuelStore(s => s.entries);
   const vehicles = useFuelStore(s => s.vehicles);
   const activeVehicleId = useFuelStore(s => s.activeVehicleId);
   const currentVehicles = vehicles;
   const setActiveVehicle = useFuelStore(s => s.setActiveVehicle);
   const updateSettings = useFuelStore(s => s.updateSettings);
   const replaceAll = useFuelStore(s => s.replaceAll);
   const clearAll = useFuelStore(s => s.clearAll);

   const [currency, setCurrency] = useState(settings.currency);
   const [threshold, setThreshold] = useState(String(settings.alertThresholdPercent));

   const commitCurrency = () => {
      const next = currency.trim() || DEFAULT_SETTINGS.currency;
      setCurrency(next);
      updateSettings({ currency: next });
   };
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
   const exportJson = () =>
      share(`my-conso-${stamp}.json`, toBackupJson({ entries, vehicles, activeVehicleId, settings }), 'application/json');
   const exportCsv = () => share(`my-conso-${stamp}.csv`, toCsv(entries, vehicles), 'text/csv');

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
                  // Photos aren't in the backup: keep the ones already on this device for the same vehicle ids
                  const keepPhoto = (id: string) => currentVehicles.find(v => v.id === id)?.photoUri;
                  replaceAll({
                     entries: parsed.entries,
                     vehicles: parsed.vehicles.map(v => ({ ...v, photoUri: keepPhoto(v.id) })),
                     activeVehicleId: parsed.activeVehicleId,
                     settings: parsed.settings,
                  });
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

            <Section icon={Car} title={t('settings.vehicles')} description={t('settings.vehicles_help')}>
               <ThemedView gap="sm" className="bg-transparent">
                  {vehicles.length === 0 ? (
                     <ThemedText color="secondary">{t('settings.vehicles_empty')}</ThemedText>
                  ) : null}
                  {vehicles.map(v => {
                     const active = v.id === activeVehicleId;
                     const count = entries.filter(e => e.vehicleId === v.id).length;
                     return (
                        <ThemedView
                           key={v.id}
                           flex="row"
                           items="center"
                           className={cn('rounded-lg border', active ? 'bg-primary-soft border-primary' : 'bg-background-secondary border-border-subtle')}>
                           <Pressable
                              onPress={() => setActiveVehicle(v.id)}
                              accessibilityRole="radio"
                              accessibilityState={{ selected: active }}
                              style={{ minHeight: 64 }}
                              className="flex-1 flex-row items-center gap-3 px-3">
                              <ThemedView
                                 className={cn('h-6 w-6 items-center justify-center rounded-full border-2', active ? 'bg-primary border-primary' : 'border-border bg-transparent')}>
                                 {active ? <Check size={14} color={inverse} strokeWidth={3} /> : null}
                              </ThemedView>
                              <VehicleAvatar vehicle={v} size={44} />
                              <ThemedView className="flex-1 bg-transparent">
                                 <ThemedText weight="semibold" numberOfLines={1}>
                                    {v.name}
                                 </ThemedText>
                                 <ThemedText variant="caption" color="secondary" numberOfLines={1}>
                                    {v.tankCapacityLiters != null
                                       ? t('settings.vehicle_tank_value', { liters: formatNumber(v.tankCapacityLiters, 1).replace(/,0$/, '') })
                                       : t('settings.vehicle_tank_unknown')}
                                    {' · '}
                                    {t('settings.vehicle_entries', { count })}
                                 </ThemedText>
                              </ThemedView>
                           </Pressable>
                           <Pressable
                              onPress={() => navigation.navigate('VehicleForm', { vehicleId: v.id })}
                              accessibilityRole="button"
                              accessibilityLabel={t('settings.vehicle_edit', { name: v.name })}
                              style={{ minWidth: 48, minHeight: 64 }}
                              className="items-center justify-center">
                              <Pencil size={20} color={muted} />
                           </Pressable>
                        </ThemedView>
                     );
                  })}
               </ThemedView>
               <ThemedButton
                  title={t('settings.vehicle_add')}
                  variant="outline"
                  size="lg"
                  fullWidth
                  leftIcon={<Plus size={20} color={primary} />}
                  onPress={() => navigation.navigate('VehicleForm')}
               />
            </Section>

            <Section icon={SlidersHorizontal} title={t('settings.preferences')} description={t('settings.preferences_help')}>
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

            <Section icon={Palette} title={t('settings.appearance')} description={t('settings.appearance_help')}>
               <SegmentedControl options={themeOptions} value={theme} onChange={setTheme} />
            </Section>

            <Section icon={Database} title={t('settings.data')} description={t('settings.data_help')}>
               <ThemedView flex="row" gap="sm" className="bg-transparent">
                  <ThemedButton title="JSON" variant="secondary" size="lg" className="flex-1" accessibilityLabel={t('settings.export_json')} onPress={exportJson} />
                  <ThemedButton title="CSV" variant="secondary" size="lg" className="flex-1" accessibilityLabel={t('settings.export_csv')} onPress={exportCsv} />
               </ThemedView>
               <ThemedButton title={t('settings.import')} variant="outline" size="lg" fullWidth onPress={importBackup} />
            </Section>

            <Section icon={TriangleAlert} title={t('settings.danger_zone')} tone="danger">
               <ThemedButton title={t('settings.clear')} variant="danger" size="lg" fullWidth onPress={clearData} />
            </Section>
         </ScrollView>
      </TabScreen>
   );
}
