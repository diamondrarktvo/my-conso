import React from 'react';
import { Row, ThemedView } from './themed-view';
import { ThemedText } from './themed-text';

interface StatCardProps {
   label: string;
   value: string;
   unit?: string;
   sub?: string;
   /** Small trend indicator shown next to the value */
   trend?: { direction: 'up' | 'down'; tone: 'good' | 'bad' };
   className?: string;
}

export function StatCard({ label, value, unit, sub, trend, className }: StatCardProps) {
   return (
      <ThemedView variant="card" padding="md" rounded="xl" border="subtle" gap="xs" className={className}>
         <ThemedText variant="caption" color="secondary" numberOfLines={2}>
            {label}
         </ThemedText>
         <Row items="baseline" gap="xs" wrap="wrap" bg="transparent">
            <ThemedText variant="h2" weight="bold" numberOfLines={1} adjustsFontSizeToFit>
               {value}
            </ThemedText>
            {trend ? (
               <ThemedText variant="body" weight="bold" color={trend.tone === 'good' ? 'success' : 'danger'}>
                  {trend.direction === 'up' ? '↑' : '↓'}
               </ThemedText>
            ) : null}
            {unit ? (
               <ThemedText variant="caption" color="secondary">
                  {unit}
               </ThemedText>
            ) : null}
         </Row>
         {sub ? (
            <ThemedText variant="caption" color="secondary">
               {sub}
            </ThemedText>
         ) : null}
      </ThemedView>
   );
}
