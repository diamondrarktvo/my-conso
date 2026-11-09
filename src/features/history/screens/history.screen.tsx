import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/src/components/layout/screen';
import { Row, ThemedView } from '@/src/components/ui/themed-view';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedList } from '@/src/components/ui/themed-list';
import { ThemedPressable } from '@/src/components/ui/themed-pressable';
import { AddEntryFab } from '@/src/features/fuel/components/add-entry-fab';
import { VehicleSwitcher } from '@/src/features/fuel/components/vehicle-switcher';
import { useOpenFuelForm } from '@/src/features/fuel/hooks';
import { useConsumption, useFuelStore, useVehicleEntries } from '@/src/features/fuel/store';
import { entryCost, type EntryRole } from '@/src/lib/consumption';
import { formatDate, formatKm, formatL100, formatLiters, formatMoney, formatMonthYear, monthKey } from '@/src/lib/format';
import type { FuelEntry } from '@/src/features/fuel/types';
import { cn } from '@/src/utils/tailwind';

const BADGE_KEY: Partial<Record<EntryRole, string>> = {
   pending: 'history.badge_pending',
   partial: 'history.badge_partial',
   reference: 'history.badge_reference',
   broken: 'history.badge_broken',
   invalid: 'history.badge_invalid',
   ignored: 'history.badge_ignored',
};

const BADGE_TONE: Partial<Record<EntryRole, string>> = {
   pending: 'bg-warning-soft',
   partial: 'bg-background-secondary',
   reference: 'bg-info-soft',
   broken: 'bg-danger-soft',
   invalid: 'bg-danger-soft',
   ignored: 'bg-background-secondary',
};

/** The list is flat (FlashList has no sections): month headers and fill-ups are typed rows. */
type HistoryRow =
   | { type: 'header'; key: string; title: string; liters: number; cost: number }
   | { type: 'entry'; key: string; entry: FuelEntry };

export function HistoryScreen() {
   const { t } = useTranslation('fuel');
   const openFuelForm = useOpenFuelForm();
   const entries = useVehicleEntries();
   const currency = useFuelStore(s => s.settings.currency);
   const { info } = useConsumption();

   const rows = useMemo<HistoryRow[]>(() => {
      const sorted = [...entries].sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || b.odometerKm - a.odometerKm);
      const out: HistoryRow[] = [];
      let header: Extract<HistoryRow, { type: 'header' }> | null = null;
      for (const e of sorted) {
         const key = monthKey(e.date);
         if (!header || header.key !== `h-${key}`) {
            header = { type: 'header', key: `h-${key}`, title: formatMonthYear(e.date), liters: 0, cost: 0 };
            out.push(header);
         }
         header.liters += e.liters;
         header.cost += entryCost(e) ?? 0;
         out.push({ type: 'entry', key: e.id, entry: e });
      }
      return out;
   }, [entries]);

   const renderRow = ({ item }: { item: HistoryRow }) => {
      if (item.type === 'header') {
         return (
            <Row justify="between" items="baseline" bg="transparent" className="pt-4 pb-2">
               <ThemedText weight="bold" transform="capitalize">
                  {item.title}
               </ThemedText>
               <ThemedText variant="body-small" color="secondary">
                  {t('history.month_total', { liters: formatLiters(item.liters), cost: formatMoney(item.cost, currency) })}
               </ThemedText>
            </Row>
         );
      }

      const { entry } = item;
      const i = info[entry.id];
      const role = i?.role;
      const cost = entryCost(entry);
      const badgeKey = role ? BADGE_KEY[role] : undefined;
      return (
         <ThemedPressable
            onPress={() => openFuelForm(entry.id)}
            className="bg-card border-border-subtle mb-2 min-h-16 flex-row items-center justify-between gap-3 rounded-xl border p-3">
            <ThemedView bg="transparent" gap="xs" className="flex-1">
               <ThemedText weight="semibold">{formatDate(entry.date)}</ThemedText>
               <ThemedText variant="body-small" color="secondary">
                  {formatKm(entry.odometerKm)} km · {t('history.liters_value', { liters: formatLiters(entry.liters) })}
                  {cost != null ? ` · ${formatMoney(cost, currency)}` : ''}
               </ThemedText>
            </ThemedView>
            {role === 'segment' && i.segment ? (
               <ThemedView bg="transparent" className="items-end">
                  <ThemedText variant="h3" weight="bold">
                     {formatL100(i.segment.l100)}
                  </ThemedText>
                  <ThemedText variant="caption" color="secondary">
                     {t('unit.l100')}
                  </ThemedText>
               </ThemedView>
            ) : badgeKey ? (
               <ThemedView className={cn('rounded-full px-3 py-1', role ? BADGE_TONE[role] : '')}>
                  <ThemedText variant="caption" weight="semibold">
                     {t(badgeKey as 'history.badge_pending')}
                  </ThemedText>
               </ThemedView>
            ) : null}
         </ThemedPressable>
      );
   };

   return (
      <Screen safeAreaEdges={['top']} withSmallPadding={false} withDismissKeyboardOnOutside={false}>
         <ThemedView bg="transparent" gap="sm" className="px-4 pt-4 pb-2">
            <ThemedText variant="h2" weight="bold">
               {t('history.title')}
            </ThemedText>
            <VehicleSwitcher />
         </ThemedView>
         <ThemedList
            data={rows}
            renderItem={renderRow}
            keyExtractor={row => row.key}
            getItemType={row => row.type}
            contentContainerClassName="px-4 pb-28"
            ListEmptyComponent={
               <ThemedText color="secondary" className="pt-8 text-center">
                  {t('history.empty')}
               </ThemedText>
            }
         />
         <AddEntryFab onPress={() => openFuelForm()} />
      </Screen>
   );
}
