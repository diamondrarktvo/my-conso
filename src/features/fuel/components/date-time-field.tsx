import React, { useState } from 'react';
import { Platform, Pressable } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { ThemedView } from '@/src/components/ui/themed-view';
import { ThemedText } from '@/src/components/ui/themed-text';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { useTheme } from '@/src/theme/ThemeProvider';
import { formatDateLong, formatTime } from '@/src/lib/format';

interface Props {
   label: string;
   value: Date;
   onChange: (d: Date) => void;
}

/** Native date + time picker. Android: date dialog then time dialog. iOS: inline compact picker. */
export function DateTimeField({ label, value, onChange }: Props) {
   const iconColor = useThemeColor('--color-primary', 'primary');
   const { isDark } = useTheme();
   const [, force] = useState(0);

   const openAndroid = () => {
      DateTimePickerAndroid.open({
         value,
         mode: 'date',
         maximumDate: new Date(),
         onChange: (e: DateTimePickerEvent, date?: Date) => {
            if (e.type !== 'set' || !date) return;
            DateTimePickerAndroid.open({
               value: date,
               mode: 'time',
               is24Hour: true,
               onChange: (e2: DateTimePickerEvent, time?: Date) => {
                  if (e2.type !== 'set' || !time) return;
                  const merged = new Date(date);
                  merged.setHours(time.getHours(), time.getMinutes(), 0, 0);
                  onChange(merged);
                  force(n => n + 1);
               },
            });
         },
      });
   };

   return (
      <ThemedView gap="xs" className="bg-transparent">
         <ThemedText variant="label" weight="medium">
            {label}
         </ThemedText>
         {Platform.OS === 'android' ? (
            <Pressable
               onPress={openAndroid}
               accessibilityRole="button"
               accessibilityLabel={label}
               style={{ minHeight: 48 }}
               className="bg-card border-border flex-row items-center gap-3 rounded-lg border px-4">
               <Calendar size={20} color={iconColor} />
               <ThemedText>
                  {formatDateLong(value.toISOString())} · {formatTime(value.toISOString())}
               </ThemedText>
            </Pressable>
         ) : (
            <ThemedView flex="row" items="center" justify="start" className="bg-transparent" style={{ minHeight: 48 }}>
               <DateTimePicker
                  value={value}
                  mode="datetime"
                  display="compact"
                  locale="fr-FR"
                  maximumDate={new Date()}
                  themeVariant={isDark ? 'dark' : 'light'}
                  onChange={(_, d) => d && onChange(d)}
               />
            </ThemedView>
         )}
      </ThemedView>
   );
}
