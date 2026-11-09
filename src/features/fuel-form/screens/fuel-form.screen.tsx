import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react-native';
import { Screen } from '@/src/components/layout/screen';
import { ThemedView } from '@/src/components/ui/themed-view';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedInput } from '@/src/components/ui/themed-input';
import { ThemedButton } from '@/src/components/ui/themed-button';
import { DateTimeField } from '@/src/features/fuel/components/date-time-field';
import { SegmentedControl } from '@/src/features/fuel/components/segmented-control';
import { SwitchRow } from '@/src/features/fuel/components/switch-row';
import { useFuelStore } from '@/src/features/fuel/store';
import { previewEntry, sortEntries } from '@/src/lib/consumption';
import { formatKm, formatKmPerL, formatL100, formatMoney, formatNumber, parseDecimal } from '@/src/lib/format';
import { round2, validateDraft, type FormDraft } from '@/src/lib/validation';
import { showToast } from '@/src/providers/toast-provider';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import type { RootStackParamList } from '@/src/navigation/types';

type PriceMode = 'per_liter' | 'total';

/** Empty string → null, unparsable → 0 (so validation flags it), otherwise the number. */
function numOrNull(text: string): number | null {
   if (text.trim() === '') return null;
   return parseDecimal(text) ?? 0;
}

const plain = (n: number, d: number) => formatNumber(n, d).replace(/ /g, '');

export function FuelFormScreen() {
   const { t } = useTranslation('fuel');
   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
   const route = useRoute<RouteProp<RootStackParamList, 'FuelForm'>>();
   const entryId = route.params?.entryId;

   const entries = useFuelStore(s => s.entries);
   const settings = useFuelStore(s => s.settings);
   const addEntry = useFuelStore(s => s.addEntry);
   const updateEntry = useFuelStore(s => s.updateEntry);
   const deleteEntry = useFuelStore(s => s.deleteEntry);
   const closeColor = useThemeColor('--color-foreground', 'foreground');

   const existing = useMemo(() => entries.find(e => e.id === entryId), [entries, entryId]);
   const isEdit = !!existing;

   const [date, setDate] = useState(() => (existing ? new Date(existing.date) : new Date()));
   const [odometer, setOdometer] = useState(existing ? plain(existing.odometerKm, 0) : '');
   const [liters, setLiters] = useState(existing ? plain(existing.liters, 2).replace(/,00$/, '') : '');
   // An imported entry may only have a total: open it in "total" mode so nothing is lost on save
   const [priceMode, setPriceMode] = useState<PriceMode>(existing && !existing.pricePerLiter && existing.totalCost ? 'total' : 'per_liter');
   const [priceText, setPriceText] = useState(
      existing?.pricePerLiter
         ? plain(existing.pricePerLiter, 2).replace(/,00$/, '')
         : existing?.totalCost
           ? plain(existing.totalCost, 0)
           : '',
   );
   const [isFullTank, setIsFullTank] = useState(existing?.isFullTank ?? true);
   const [missedPrevious, setMissedPrevious] = useState(existing?.missedPrevious ?? false);
   const [station, setStation] = useState(existing?.station ?? '');
   const [note, setNote] = useState(existing?.note ?? '');
   const [submitted, setSubmitted] = useState(false);

   const lastKnownKm = useMemo(() => {
      const others = sortEntries(entries.filter(e => e.id !== entryId));
      return others.length ? others[others.length - 1].odometerKm : null;
   }, [entries, entryId]);

   // Resolve the two price values from whichever one the user typed
   const litersNum = numOrNull(liters);
   const priceNum = numOrNull(priceText);
   const resolved = useMemo(() => {
      if (priceNum == null) return { pricePerLiter: null, totalCost: null };
      if (priceMode === 'per_liter') {
         return { pricePerLiter: priceNum, totalCost: litersNum && litersNum > 0 && priceNum > 0 ? priceNum * litersNum : null };
      }
      return { pricePerLiter: litersNum && litersNum > 0 && priceNum > 0 ? priceNum / litersNum : null, totalCost: priceNum };
   }, [priceNum, priceMode, litersNum]);

   const draft: FormDraft = {
      date: date.toISOString(),
      odometerKm: numOrNull(odometer),
      liters: litersNum,
      // keep the raw invalid value (0) so validation can flag it
      pricePerLiter: priceMode === 'per_liter' ? priceNum : resolved.pricePerLiter,
      totalCost: priceMode === 'total' ? priceNum : resolved.totalCost,
      isFullTank,
      missedPrevious,
   };

   const validation = useMemo(
      () => validateDraft(draft, entries, settings, entryId),
      // eslint-disable-next-line react-hooks/exhaustive-deps -- draft is rebuilt each render from the state below
      [date, odometer, liters, priceText, priceMode, isFullTank, missedPrevious, entries, settings, entryId],
   );

   const preview = useMemo(() => {
      if (draft.odometerKm == null || draft.liters == null || !(draft.odometerKm > 0) || !(draft.liters > 0)) return null;
      return previewEntry(
         entries,
         {
            id: '__draft__',
            date: draft.date,
            odometerKm: draft.odometerKm,
            liters: draft.liters,
            isFullTank,
            missedPrevious,
            pricePerLiter: draft.pricePerLiter ?? undefined,
            totalCost: draft.totalCost ?? undefined,
         },
         entryId,
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
   }, [date, odometer, liters, priceText, priceMode, isFullTank, missedPrevious, entries, entryId]);

   const err = (e?: { code: string; params?: Record<string, string | number> }) =>
      submitted && e
         ? t(`form.errors.${e.code}` as 'form.errors.odometer_required', {
              ...(e.params?.km != null ? { km: formatKm(Number(e.params.km)) } : {}),
           })
         : undefined;

   const warningText = (w: { code: string; params?: Record<string, number> }) =>
      t(`form.warnings.${w.code}` as 'form.warnings.liters_over_tank', {
         tank: w.params?.tank != null ? formatNumber(w.params.tank, 1) : '',
         km: w.params?.km != null ? formatKm(w.params.km) : '',
         l100: w.params?.l100 != null ? formatL100(w.params.l100) : '',
      });

   const persist = () => {
      const pricePerLiter = resolved.pricePerLiter ?? undefined;
      const totalCost = resolved.totalCost ?? undefined;
      const input = {
         date: date.toISOString(),
         odometerKm: draft.odometerKm as number,
         liters: round2(draft.liters as number),
         pricePerLiter,
         totalCost,
         isFullTank,
         missedPrevious,
         station: station.trim() || undefined,
         note: note.trim() || undefined,
      };
      if (isEdit && entryId) updateEntry(entryId, input);
      else addEntry(input);
      showToast('success', t('form.saved'));
      navigation.goBack();
   };

   const onSave = () => {
      setSubmitted(true);
      if (validation.hasErrors) return;
      if (validation.warnings.length > 0) {
         Alert.alert(t('form.warning_title'), validation.warnings.map(warningText).join('\n\n'), [
            { text: t('form.warning_back'), style: 'cancel' },
            { text: t('form.warning_confirm'), onPress: persist },
         ]);
         return;
      }
      persist();
   };

   const onDelete = () =>
      Alert.alert(t('form.delete_title'), t('form.delete_text'), [
         { text: t('form.cancel'), style: 'cancel' },
         {
            text: t('form.delete'),
            style: 'destructive',
            onPress: () => {
               if (entryId) deleteEntry(entryId);
               showToast('success', t('form.deleted'));
               navigation.goBack();
            },
         },
      ]);

   const previewText = (() => {
      if (!preview) return t('form.preview_none');
      const lines: string[] = [];
      if (preview.distanceFromLastFullKm != null && preview.distanceFromLastFullKm > 0) {
         lines.push(t('form.preview_distance', { km: formatKm(preview.distanceFromLastFullKm) }));
      }
      const { role, segment } = preview.info;
      if (role === 'segment' && segment) {
         lines.push(t('form.preview_consumption', { l100: formatL100(segment.l100), kml: formatKmPerL(segment.kmPerL) }));
      } else if (role === 'reference') lines.push(t('form.preview_reference'));
      else if (role === 'pending' || role === 'partial') lines.push(t('form.preview_pending'));
      else if (role === 'broken') lines.push(t('form.preview_broken'));
      else if (role === 'invalid') lines.push(t('form.preview_invalid'));
      return lines.join('\n');
   })();

   const computed =
      priceMode === 'per_liter'
         ? resolved.totalCost != null && resolved.totalCost > 0
            ? formatMoney(resolved.totalCost, settings.currency)
            : null
         : resolved.pricePerLiter != null && resolved.pricePerLiter > 0
           ? `${formatNumber(resolved.pricePerLiter, 0)} ${settings.currency}/L`
           : null;

   return (
      <Screen withKeyboardAvoiding withSmallPadding={false}>
         <ThemedView flex="row" items="center" justify="between" className="bg-transparent px-4 py-2">
            <ThemedText variant="h3" weight="bold">
               {isEdit ? t('form.title_edit') : t('form.title_new')}
            </ThemedText>
            <Pressable
               onPress={() => navigation.goBack()}
               accessibilityRole="button"
               accessibilityLabel={t('form.cancel')}
               style={{ minWidth: 44, minHeight: 44 }}
               className="items-center justify-center">
               <X size={26} color={closeColor} />
            </Pressable>
         </ThemedView>

         <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }} keyboardShouldPersistTaps="handled">
            <DateTimeField label={t('form.date')} value={date} onChange={setDate} />

            <ThemedInput
               label={t('form.odometer')}
               value={odometer}
               onChangeText={setOdometer}
               keyboardType="number-pad"
               size="lg"
               error={err(validation.errors.odometerKm)}
               helperText={lastKnownKm != null ? t('form.odometer_hint', { km: formatKm(lastKnownKm) }) : undefined}
            />

            <ThemedInput
               label={t('form.liters')}
               value={liters}
               onChangeText={setLiters}
               keyboardType="decimal-pad"
               size="lg"
               error={err(validation.errors.liters)}
            />

            <ThemedView gap="sm" className="bg-transparent">
               <SegmentedControl
                  options={[
                     { value: 'per_liter' as PriceMode, label: t('form.price_mode_per_liter') },
                     { value: 'total' as PriceMode, label: t('form.price_mode_total') },
                  ]}
                  value={priceMode}
                  onChange={m => {
                     setPriceMode(m);
                     setPriceText('');
                  }}
               />
               <ThemedInput
                  label={priceMode === 'per_liter' ? t('form.price_per_liter', { currency: settings.currency }) : t('form.total_cost', { currency: settings.currency })}
                  value={priceText}
                  onChangeText={setPriceText}
                  keyboardType="decimal-pad"
                  size="lg"
                  error={err(validation.errors.price)}
                  helperText={computed ? t('form.price_computed', { value: computed }) : undefined}
               />
            </ThemedView>

            <SwitchRow label={t('form.full_tank')} help={t('form.full_tank_help')} value={isFullTank} onValueChange={setIsFullTank} />
            <SwitchRow label={t('form.missed_previous')} value={missedPrevious} onValueChange={setMissedPrevious} />

            <ThemedInput label={t('form.station')} value={station} onChangeText={setStation} size="lg" />
            <ThemedInput
               label={t('form.note')}
               placeholder={t('form.note_placeholder')}
               value={note}
               onChangeText={setNote}
               size="lg"
            />

            <ThemedView variant="card" padding="md" rounded="xl" border="subtle" gap="xs" className="bg-primary-soft">
               <ThemedText weight="bold">{t('form.preview_title')}</ThemedText>
               <ThemedText color="secondary">{previewText}</ThemedText>
            </ThemedView>

            <ThemedView gap="sm" className="bg-transparent">
               <ThemedButton title={t('form.save')} size="lg" fullWidth onPress={onSave} />
               <ThemedButton title={t('form.cancel')} variant="secondary" size="lg" fullWidth onPress={() => navigation.goBack()} />
               {isEdit ? <ThemedButton title={t('form.delete')} variant="danger" size="lg" fullWidth onPress={onDelete} /> : null}
            </ThemedView>
         </ScrollView>
      </Screen>
   );
}
