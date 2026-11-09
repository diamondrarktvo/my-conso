import React, { useState } from 'react';
import { ThemedView } from './themed-view';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { useThemeColor } from '@/src/hooks/use-theme-color';

export interface BarItem {
   label: string;
   value: number;
}

const HEIGHT = 200;
const PAD = { top: 20, right: 8, bottom: 28, left: 8 };

/** Simple SVG bar chart. Values are printed above the bars (compact format). */
export function BarChart({ items, format }: { items: BarItem[]; format: (v: number) => string }) {
   const [width, setWidth] = useState(0);
   const primary = useThemeColor('--color-primary', 'primary');
   const muted = useThemeColor('--color-foreground-secondary', 'foregroundSecondary');
   const grid = useThemeColor('--color-border-subtle', 'borderSubtle');

   const max = Math.max(...items.map(i => i.value), 1);
   const innerW = Math.max(width - PAD.left - PAD.right, 1);
   const innerH = HEIGHT - PAD.top - PAD.bottom;
   const slot = innerW / Math.max(items.length, 1);
   const barW = Math.min(slot * 0.6, 48);

   return (
      <ThemedView bg="transparent" onLayout={e => setWidth(e.nativeEvent.layout.width)} accessible accessibilityLabel={items.map(i => `${i.label} ${format(i.value)}`).join(', ')}>
         {width > 0 && (
            <Svg width={width} height={HEIGHT}>
               <Line x1={PAD.left} x2={width - PAD.right} y1={PAD.top + innerH} y2={PAD.top + innerH} stroke={grid} strokeWidth={1} />
               {items.map((it, i) => {
                  const h = (it.value / max) * innerH;
                  const cx = PAD.left + slot * i + slot / 2;
                  return (
                     <React.Fragment key={i}>
                        <Rect x={cx - barW / 2} y={PAD.top + innerH - h} width={barW} height={Math.max(h, 1)} rx={4} fill={primary} />
                        <SvgText x={cx} y={PAD.top + innerH - h - 5} fontSize={10} fill={muted} textAnchor="middle">
                           {format(it.value)}
                        </SvgText>
                        <SvgText x={cx} y={HEIGHT - 8} fontSize={11} fill={muted} textAnchor="middle">
                           {it.label}
                        </SvgText>
                     </React.Fragment>
                  );
               })}
            </Svg>
         )}
      </ThemedView>
   );
}
