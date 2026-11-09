import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { useThemeColor } from '@/src/hooks/use-theme-color';

export interface LinePoint {
   label: string;
   value: number;
}

const HEIGHT = 200;
const PAD = { top: 12, right: 12, bottom: 28, left: 40 };

/** Simple SVG line chart with an optional horizontal average line. Theme-aware, no external lib. */
export function LineChart({ points, average, format }: { points: LinePoint[]; average?: number | null; format: (v: number) => string }) {
   const [width, setWidth] = useState(0);
   const primary = useThemeColor('--color-primary', 'primary');
   const muted = useThemeColor('--color-foreground-secondary', 'foregroundSecondary');
   const grid = useThemeColor('--color-border-subtle', 'borderSubtle');
   const accent = useThemeColor('--color-success', 'success');

   const values = points.map(p => p.value).concat(average != null ? [average] : []);
   const min = Math.min(...values);
   const max = Math.max(...values);
   const span = max - min || 1;
   const lo = min - span * 0.15;
   const hi = max + span * 0.15;

   const innerW = Math.max(width - PAD.left - PAD.right, 1);
   const innerH = HEIGHT - PAD.top - PAD.bottom;
   const x = (i: number) => PAD.left + (points.length === 1 ? innerW / 2 : (i * innerW) / (points.length - 1));
   const y = (v: number) => PAD.top + innerH - ((v - lo) / (hi - lo)) * innerH;

   const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.value)}`).join(' ');
   const ticks = [lo + (hi - lo) * 0.1, (lo + hi) / 2, hi - (hi - lo) * 0.1];
   // Show at most ~5 x labels
   const step = Math.max(1, Math.ceil(points.length / 5));

   return (
      <View onLayout={e => setWidth(e.nativeEvent.layout.width)} accessible accessibilityLabel={points.map(p => `${p.label} ${format(p.value)}`).join(', ')}>
         {width > 0 && (
            <Svg width={width} height={HEIGHT}>
               {ticks.map((t, i) => (
                  <React.Fragment key={i}>
                     <Line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={grid} strokeWidth={1} />
                     <SvgText x={PAD.left - 6} y={y(t) + 4} fontSize={11} fill={muted} textAnchor="end">
                        {format(t)}
                     </SvgText>
                  </React.Fragment>
               ))}
               {average != null && (
                  <Line x1={PAD.left} x2={width - PAD.right} y1={y(average)} y2={y(average)} stroke={accent} strokeWidth={2} strokeDasharray="6 4" />
               )}
               <Path d={path} stroke={primary} strokeWidth={3} fill="none" strokeLinejoin="round" strokeLinecap="round" />
               {points.map((p, i) => (
                  <Circle key={i} cx={x(i)} cy={y(p.value)} r={4} fill={primary} />
               ))}
               {points.map((p, i) =>
                  i % step === 0 ? (
                     <SvgText key={`l${i}`} x={x(i)} y={HEIGHT - 8} fontSize={11} fill={muted} textAnchor="middle">
                        {p.label}
                     </SvgText>
                  ) : null,
               )}
            </Svg>
         )}
      </View>
   );
}
