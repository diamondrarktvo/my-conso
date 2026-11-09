import React from 'react';
import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Card, ThemedView } from '@/src/components/ui/themed-view';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedButton } from '@/src/components/ui/themed-button';
import { TabScreen } from '@/src/features/fuel/components/tab-screen';
import { VehicleSwitcher } from '@/src/features/fuel/components/vehicle-switcher';
import { StatCard } from '@/src/features/fuel/components/stat-card';
import { AddFab } from '@/src/features/fuel/components/add-fab';
import { useActiveVehicle, useConsumption, useFuelStore } from '@/src/features/fuel/store';
import { computeAlert, estimatedRangeKm } from '@/src/lib/consumption';
import { daysSince, formatDateLong, formatKm, formatKmPerL, formatL100, formatMoney, formatNumber } from '@/src/lib/format';
import type { RootStackParamList } from '@/src/navigation/types';

export function HomeScreen() {
   const { t } = useTranslation('fuel');
   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
   const settings = useFuelStore(s => s.settings);
   const vehicle = useActiveVehicle();
   const result = useConsumption();
   const openForm = () => navigation.navigate('FuelForm');

   const { summary, lastSegment, sorted } = result;
   const lastEntry = sorted.length ? sorted[sorted.length - 1] : null;
   const alert = computeAlert(result, settings.alertThresholdPercent);
   const range = estimatedRangeKm(summary.l100, vehicle.tankCapacityLiters);
   const dash = t('home.no_data');

   // Is the last segment worse (higher) than the average?
   const lastVsAvg =
      lastSegment && summary.l100 && Math.abs(lastSegment.l100 - summary.l100) > 1e-9
         ? { direction: (lastSegment.l100 > summary.l100 ? 'up' : 'down') as 'up' | 'down', tone: (lastSegment.l100 > summary.l100 ? 'bad' : 'good') as 'good' | 'bad' }
         : undefined;

   const days = lastEntry ? daysSince(lastEntry.date) : 0;
   const daysLabel = days === 0 ? t('home.days_ago_0') : days === 1 ? t('home.days_ago_1') : t('home.days_ago_other', { count: days });

   return (
      <TabScreen>
         <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 112, gap: 12 }}>
            <ThemedText variant="h2" weight="bold">
               {vehicle.name}
            </ThemedText>
            <VehicleSwitcher />

            {sorted.length === 0 ? (
               <Card padding="lg" rounded="xl" gap="md">
                  <ThemedText variant="h3">{t('home.empty_title')}</ThemedText>
                  <ThemedText color="secondary">{t('home.empty_text')}</ThemedText>
                  <ThemedText color="secondary">{t('home.empty_steps')}</ThemedText>
                  <ThemedButton title={t('home.empty_cta')} size="lg" fullWidth onPress={openForm} />
               </Card>
            ) : (
               <>
                  <ThemedView variant="card" padding="lg" rounded="xl" border="subtle" gap="xs" className="bg-primary-soft">
                     <ThemedText variant="body-small" color="secondary" weight="medium">
                        {t('home.avg_title')}
                     </ThemedText>
                     {summary.l100 != null ? (
                        <>
                           <ThemedView flex="row" items="baseline" gap="sm" className="bg-transparent">
                              <ThemedText className="text-5xl font-bold">{formatL100(summary.l100)}</ThemedText>
                              <ThemedText variant="body-large" color="secondary">
                                 {t('unit.l100')}
                              </ThemedText>
                           </ThemedView>
                           <ThemedText variant="body-large" color="secondary">
                              {formatKmPerL(summary.kmPerL ?? 0)} {t('unit.kml')}
                           </ThemedText>
                        </>
                     ) : (
                        <ThemedText color="secondary">{t('home.need_two_fulls')}</ThemedText>
                     )}
                  </ThemedView>

                  {alert ? (
                     <ThemedView variant="card" padding="md" rounded="xl" className="bg-danger-soft border-danger border" accessibilityRole="alert">
                        <ThemedText weight="semibold">{t('home.alert', { percent: formatNumber(alert.percent, 0) })}</ThemedText>
                     </ThemedView>
                  ) : null}

                  <ThemedView flex="row" gap="sm" className="bg-transparent">
                     <StatCard
                        className="flex-1"
                        label={t('home.last_segment')}
                        value={lastSegment ? formatL100(lastSegment.l100) : dash}
                        unit={lastSegment ? t('unit.l100') : undefined}
                        trend={lastVsAvg}
                     />
                     <StatCard
                        className="flex-1"
                        label={t('home.cost_per_100')}
                        value={summary.costPer100Km != null ? formatNumber(summary.costPer100Km, 0) : dash}
                        unit={summary.costPer100Km != null ? settings.currency : undefined}
                     />
                  </ThemedView>
                  <ThemedView flex="row" gap="sm" className="bg-transparent">
                     <StatCard className="flex-1" label={t('home.total_km')} value={formatKm(summary.totalKm)} unit={t('unit.km')} />
                     <StatCard className="flex-1" label={t('home.total_spent')} value={formatMoney(result.totalSpent, settings.currency)} />
                  </ThemedView>
                  <StatCard
                     label={t('home.range')}
                     value={range != null ? formatKm(range) : dash}
                     unit={range != null ? t('unit.km') : undefined}
                     sub={range == null ? t('home.range_missing') : undefined}
                  />

                  {lastEntry ? (
                     <ThemedView variant="card" padding="md" rounded="xl" border="subtle" gap="xs">
                        <ThemedText variant="caption" color="secondary">
                           {t('home.last_entry')}
                        </ThemedText>
                        <ThemedText weight="semibold">{formatDateLong(lastEntry.date)}</ThemedText>
                        <ThemedText color="secondary">
                           {daysLabel} · {t('home.odometer', { km: formatKm(lastEntry.odometerKm) })}
                        </ThemedText>
                     </ThemedView>
                  ) : null}
               </>
            )}
         </ScrollView>
         {sorted.length > 0 ? <AddFab onPress={openForm} /> : null}
      </TabScreen>
   );
}
