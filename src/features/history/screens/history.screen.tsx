import React, { useMemo } from 'react';
import { Pressable, SectionList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedView } from '@/src/components/ui/themed-view';
import { ThemedText } from '@/src/components/ui/themed-text';
import { TabScreen } from '@/src/features/fuel/components/tab-screen';
import { VehicleSwitcher } from '@/src/features/fuel/components/vehicle-switcher';
import { AddFab } from '@/src/features/fuel/components/add-fab';
import { useConsumption, useFuelStore, useVehicleEntries } from '@/src/features/fuel/store';
import { entryCost, type EntryRole } from '@/src/lib/consumption';
import { formatDate, formatKm, formatL100, formatLiters, formatMoney, formatMonthYear, monthKey } from '@/src/lib/format';
import type { FuelEntry } from '@/src/features/fuel/types';
import { useOpenFuelForm } from '@/src/features/fuel/hooks';
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

interface Section {
   key: string;
   title: string;
   liters: number;
   cost: number;
   data: FuelEntry[];
}

export function HistoryScreen() {
   const { t } = useTranslation('fuel');
   const openFuelForm = useOpenFuelForm();
   const entries = useVehicleEntries();
   const currency = useFuelStore(s => s.settings.currency);
   const { info } = useConsumption();

   const sections = useMemo<Section[]>(() => {
      const sorted = [...entries].sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || b.odometerKm - a.odometerKm);
      const map = new Map<string, Section>();
      for (const e of sorted) {
         const key = monthKey(e.date);
         let s = map.get(key);
         if (!s) {
            s = { key, title: formatMonthYear(e.date), liters: 0, cost: 0, data: [] };
            map.set(key, s);
         }
         s.liters += e.liters;
         s.cost += entryCost(e) ?? 0;
         s.data.push(e);
      }
      return [...map.values()];
   }, [entries]);

   const openForm = (entryId?: string) => openFuelForm(entryId);

   return (
      <TabScreen>
         <ThemedText variant="h2" weight="bold" className="px-4 pt-4 pb-2">
            {t('history.title')}
         </ThemedText>
         <ThemedView className="bg-transparent px-4 pb-2">
            <VehicleSwitcher />
         </ThemedView>
         <SectionList
            sections={sections}
            keyExtractor={e => e.id}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 112 }}
            ListEmptyComponent={
               <ThemedText color="secondary" className="pt-8 text-center">
                  {t('history.empty')}
               </ThemedText>
            }
            renderSectionHeader={({ section }) => (
               <ThemedView flex="row" justify="between" items="baseline" className="bg-transparent pt-4 pb-2">
                  <ThemedText weight="bold" transform="capitalize">
                     {section.title}
                  </ThemedText>
                  <ThemedText variant="body-small" color="secondary">
                     {t('history.month_total', { liters: formatLiters(section.liters), cost: formatMoney(section.cost, currency) })}
                  </ThemedText>
               </ThemedView>
            )}
            renderItem={({ item }) => {
               const i = info[item.id];
               const role = i?.role;
               const cost = entryCost(item);
               const badgeKey = role ? BADGE_KEY[role] : undefined;
               return (
                  <Pressable
                     onPress={() => openForm(item.id)}
                     accessibilityRole="button"
                     style={{ minHeight: 64 }}
                     className="bg-card border-border-subtle mb-2 flex-row items-center justify-between gap-3 rounded-xl border p-3 active:opacity-70">
                     <ThemedView className="flex-1 bg-transparent" gap="xs">
                        <ThemedText weight="semibold">{formatDate(item.date)}</ThemedText>
                        <ThemedText variant="body-small" color="secondary">
                           {formatKm(item.odometerKm)} km · {t('history.liters_value', { liters: formatLiters(item.liters) })}
                           {cost != null ? ` · ${formatMoney(cost, currency)}` : ''}
                        </ThemedText>
                     </ThemedView>
                     {role === 'segment' && i.segment ? (
                        <ThemedView className="items-end bg-transparent">
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
                  </Pressable>
               );
            }}
         />
         <AddFab onPress={() => openForm()} />
      </TabScreen>
   );
}
