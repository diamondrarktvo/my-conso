import React from 'react';
import { Row, ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { ThemedIcon, type IconName } from './themed-icon';

interface SectionCardProps {
   icon: IconName;
   title: string;
   description?: string;
   tone?: 'default' | 'danger';
   children: React.ReactNode;
}

/** Card grouping related controls under an icon + title (+ short description). */
export function SectionCard({ icon, title, description, tone = 'default', children }: SectionCardProps) {
   const danger = tone === 'danger';
   return (
      <ThemedView variant="card" padding="md" rounded="xl" border="subtle" gap="md">
         <Row items="center" gap="sm" bg="transparent">
            <ThemedIcon name={icon} color={danger ? 'danger' : 'primary'} size="lg" />
            <ThemedView bg="transparent" gap="xs" className="flex-1">
               <ThemedText variant="body-large" weight="bold" color={danger ? 'danger' : 'default'}>
                  {title}
               </ThemedText>
               {description ? (
                  <ThemedText variant="caption" color="secondary">
                     {description}
                  </ThemedText>
               ) : null}
            </ThemedView>
         </Row>
         {children}
      </ThemedView>
   );
}
