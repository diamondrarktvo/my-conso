import React from 'react';
import { Platform } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Row, ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { ThemedIcon } from './themed-icon';
import { ThemedPressable } from './themed-pressable';
import { useTheme } from '@/src/theme/ThemeProvider';
import { formatDateLong, formatTime } from '@/src/lib/format';

interface Props {
   label: string;
   value: Date;
   onChange: (d: Date) => void;
}

/** Native date + time picker. Android: date dialog then time dialog. iOS: inline compact picker. */
export function DateTimeField({ label, value, onChange }: Props) {
   const { isDark } = useTheme();

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
               },
            });
         },
      });
   };

   return (
      <ThemedView gap="xs" bg="transparent">
         <ThemedText variant="label" weight="medium">
            {label}
         </ThemedText>
         {Platform.OS === 'android' ? (
            <ThemedPressable
               onPress={openAndroid}
               accessibilityLabel={label}
               className="bg-card border-border min-h-12 flex-row items-center gap-3 rounded-lg border px-4">
               <ThemedIcon name="calendar" color="primary" />
               <ThemedText>
                  {formatDateLong(value.toISOString())} · {formatTime(value.toISOString())}
               </ThemedText>
            </ThemedPressable>
         ) : (
            <Row items="center" justify="start" bg="transparent" className="min-h-12">
               <DateTimePicker
                  value={value}
                  mode="datetime"
                  display="compact"
                  locale="fr-FR"
                  maximumDate={new Date()}
                  themeVariant={isDark ? 'dark' : 'light'}
                  onChange={(_, d) => d && onChange(d)}
               />
            </Row>
         )}
      </ThemedView>
   );
}
