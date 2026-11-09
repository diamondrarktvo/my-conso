import React from 'react';
import { Row } from './themed-view';
import { ThemedText } from './themed-text';

/** Label on the left, value on the right, hairline below. Stack several in a card for a table. */
export function InfoRow({ label, value }: { label: string; value: string }) {
   return (
      <Row justify="between" items="center" gap="md" bg="transparent" className="border-border-subtle min-h-11 border-b">
         <ThemedText color="secondary" className="flex-1">
            {label}
         </ThemedText>
         <ThemedText weight="semibold" align="right" className="flex-1">
            {value}
         </ThemedText>
      </Row>
   );
}
