import React, { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedView } from '@/src/components/ui/themed-view';
import { ThemedText } from '@/src/components/ui/themed-text';
import { TabScreen } from '@/src/features/fuel/components/tab-screen';
import { VehicleSwitcher } from '@/src/features/fuel/components/vehicle-switcher';
import { SegmentedControl } from '@/src/features/fuel/components/segmented-control';
import { LineChart } from '@/src/features/fuel/components/line-chart';
import { BarChart } from '@/src/features/fuel/components/bar-chart';
import { useConsumption, useFuelStore, useVehicleEntries } from '@/src/features/fuel/store';
import { entryCost, filterSegmentsByPeriod, summarize, type Period, type Segment } from '@/src/lib/consumption';
import {
   formatDate,
   formatDayMonth,
   formatKm,
   formatKmPerL,
   formatL100,
   formatLiters,
   formatMonthShort,
   formatNumber,
   monthKey,
} from '@/src/lib/format';

function Row({ label, value }: { label: string; value: string }) {
   return (
      <ThemedView flex="row" justify="between" items="center" gap="md" className="bg-transparent border-border-subtle min-h-[44px] border-b">
         <ThemedText color="secondary" className="flex-1">
            {label}
         </ThemedText>
         <ThemedText weight="semibold" align="right" className="flex-1">
            {value}
         </ThemedText>
      </ThemedView>
   );
}

const compactMoney = (v: number) => (v >= 1000 ? `${formatNumber(v / 1000, v >= 10000 ? 0 : 1)}k` : formatNumber(v, 0));

export function StatsScreen() {
   const { t } = useTranslation('fuel');
   const [period, setPeriod] = useState<Period>('6m');
   const entries = useVehicleEntries();
   const currency = useFuelStore(s => s.settings.currency);
   const { segments } = useConsumption();

   const filtered = useMemo(() => filterSegmentsByPeriod(segments, period), [segments, period]);
   const summary = useMemo(() => summarize(filtered), [filtered]);
   const recent = useMemo(() => summarize(filtered.slice(-3)), [filtered]);

   const best = useMemo(() => filtered.reduce<Segment | null>((b, s) => (!b || s.l100 < b.l100 ? s : b), null), [filtered]);
   const worst = useMemo(() => filtered.reduce<Segment | null>((w, s) => (!w || s.l100 > w.l100 ? s : w), null), [filtered]);

   const spending = useMemo(() => {
      const limit = new Date();
      const months = period === '3m' ? 3 : period === '6m' ? 6 : period === '1y' ? 12 : null;
      if (months) limit.setMonth(limit.getMonth() - months);
      const map = new Map<string, { label: string; value: number }>();
      [...entries]
         .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
         .filter(e => months === null || Date.parse(e.date) >= limit.getTime())
         .forEach(e => {
            const key = monthKey(e.date);
            const cur = map.get(key) ?? { label: formatMonthShort(e.date), value: 0 };
            cur.value += entryCost(e) ?? 0;
            map.set(key, cur);
         });
      return [...map.values()];
   }, [entries, period]);

   const periods: { value: Period; label: string }[] = (['3m', '6m', '1y', 'all'] as Period[]).map(p => ({
      value: p,
      label: t(`stats.period.${p}`),
   }));

   const dash = '—';
   const segText = (s: Segment | null) => (s ? `${formatL100(s.l100)} ${t('unit.l100')} · ${formatDate(s.date)}` : dash);

   return (
      <TabScreen>
         <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}>
            <ThemedText variant="h2" weight="bold">
               {t('stats.title')}
            </ThemedText>
            <VehicleSwitcher />
            <SegmentedControl options={periods} value={period} onChange={setPeriod} />

            <ThemedView variant="card" padding="md" rounded="xl" border="subtle" gap="sm">
               <ThemedText weight="semibold">{t('stats.chart_l100')}</ThemedText>
               {filtered.length >= 1 ? (
                  <>
                     <LineChart
                        points={filtered.map(s => ({ label: formatDayMonth(s.date), value: s.l100 }))}
                        average={summary.l100}
                        format={formatL100}
                     />
                     <ThemedText variant="caption" color="secondary">
                        - - {t('stats.chart_average')} : {summary.l100 != null ? formatL100(summary.l100) : dash} {t('unit.l100')}
                     </ThemedText>
                  </>
               ) : (
                  <ThemedText color="secondary">{t('stats.chart_empty')}</ThemedText>
               )}
            </ThemedView>

            <ThemedView variant="card" padding="md" rounded="xl" border="subtle" gap="sm">
               <ThemedText weight="semibold">
                  {t('stats.chart_spending')} ({currency})
               </ThemedText>
               {spending.length >= 1 ? <BarChart items={spending} format={compactMoney} /> : <ThemedText color="secondary">{t('stats.chart_empty')}</ThemedText>}
            </ThemedView>

            <ThemedView variant="card" padding="md" rounded="xl" border="subtle">
               <Row label={t('stats.table_average')} value={summary.l100 != null ? `${formatL100(summary.l100)} ${t('unit.l100')} · ${formatKmPerL(summary.kmPerL ?? 0)} ${t('unit.kml')}` : dash} />
               <Row label={t('stats.table_trend')} value={recent.l100 != null ? `${formatL100(recent.l100)} ${t('unit.l100')}` : dash} />
               <Row label={t('stats.table_best')} value={segText(best)} />
               <Row label={t('stats.table_worst')} value={segText(worst)} />
               <Row label={t('stats.table_segments')} value={String(summary.segmentCount)} />
               <Row label={t('stats.table_km')} value={`${formatKm(summary.totalKm)} ${t('unit.km')}`} />
               <Row label={t('stats.table_liters')} value={`${formatLiters(summary.totalLiters)} ${t('unit.l')}`} />
            </ThemedView>
         </ScrollView>
      </TabScreen>
   );
}
