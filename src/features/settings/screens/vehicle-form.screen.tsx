import React, { useState } from 'react';
import { Alert, Pressable, ScrollView } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react-native';
import { Screen } from '@/src/components/layout/screen';
import { ThemedView } from '@/src/components/ui/themed-view';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedInput } from '@/src/components/ui/themed-input';
import { ThemedButton } from '@/src/components/ui/themed-button';
import { useFuelStore } from '@/src/features/fuel/store';
import { formatNumber, parseDecimal } from '@/src/lib/format';
import { showToast } from '@/src/providers/toast-provider';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import type { RootStackParamList } from '@/src/navigation/types';

export function VehicleFormScreen() {
   const { t } = useTranslation('fuel');
   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
   const route = useRoute<RouteProp<RootStackParamList, 'VehicleForm'>>();
   const vehicleId = route.params?.vehicleId;

   const vehicles = useFuelStore(s => s.vehicles);
   const entries = useFuelStore(s => s.entries);
   const addVehicle = useFuelStore(s => s.addVehicle);
   const updateVehicle = useFuelStore(s => s.updateVehicle);
   const deleteVehicle = useFuelStore(s => s.deleteVehicle);
   const iconColor = useThemeColor('--color-foreground', 'foreground');

   const existing = vehicles.find(v => v.id === vehicleId);
   const isEdit = !!existing;

   const [name, setName] = useState(existing?.name ?? '');
   const [tank, setTank] = useState(existing?.tankCapacityLiters != null ? formatNumber(existing.tankCapacityLiters, 2).replace(/,?0+$/, '') : '');
   const [submitted, setSubmitted] = useState(false);

   const goBack = () => {
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
   };

   const nameError = submitted && name.trim() === '' ? t('vehicle_form.name_required') : undefined;

   const onSave = () => {
      setSubmitted(true);
      if (name.trim() === '') return;
      const parsed = parseDecimal(tank);
      const tankCapacityLiters = parsed != null && parsed > 0 ? parsed : undefined;
      if (isEdit && vehicleId) updateVehicle(vehicleId, { name: name.trim(), tankCapacityLiters });
      else addVehicle({ name: name.trim(), tankCapacityLiters });
      showToast('success', t('vehicle_form.saved'));
      goBack();
   };

   const onDelete = () => {
      if (!vehicleId) return;
      if (vehicles.length <= 1) {
         showToast('error', t('vehicle_form.delete_last'));
         return;
      }
      const count = entries.filter(e => e.vehicleId === vehicleId).length;
      Alert.alert(t('vehicle_form.delete_title', { name: existing?.name ?? '' }), t('vehicle_form.delete_text', { count }), [
         { text: t('vehicle_form.cancel'), style: 'cancel' },
         {
            text: t('vehicle_form.delete'),
            style: 'destructive',
            onPress: () => {
               deleteVehicle(vehicleId);
               showToast('success', t('vehicle_form.deleted'));
               goBack();
            },
         },
      ]);
   };

   return (
      <Screen withKeyboardAvoiding withSmallPadding={false}>
         <ThemedView flex="row" items="center" gap="sm" className="bg-transparent px-2 py-2">
            <Pressable
               onPress={goBack}
               accessibilityRole="button"
               accessibilityLabel={t('vehicle_form.back')}
               hitSlop={8}
               style={{ minWidth: 44, minHeight: 44 }}
               className="items-center justify-center">
               <ArrowLeft size={26} color={iconColor} />
            </Pressable>
            <ThemedText variant="h3" weight="bold">
               {isEdit ? t('vehicle_form.title_edit') : t('vehicle_form.title_new')}
            </ThemedText>
         </ThemedView>

         <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }} keyboardShouldPersistTaps="handled">
            <ThemedInput
               label={t('vehicle_form.name')}
               placeholder={t('vehicle_form.name_placeholder')}
               value={name}
               onChangeText={setName}
               size="lg"
               error={nameError}
            />
            <ThemedInput
               label={t('vehicle_form.tank')}
               helperText={t('vehicle_form.tank_help')}
               value={tank}
               onChangeText={setTank}
               keyboardType="decimal-pad"
               size="lg"
            />
            <ThemedView gap="sm" className="bg-transparent">
               <ThemedButton title={t('vehicle_form.save')} size="lg" fullWidth onPress={onSave} />
               <ThemedButton title={t('vehicle_form.cancel')} variant="secondary" size="lg" fullWidth onPress={goBack} />
               {isEdit && vehicles.length > 1 ? (
                  <ThemedButton title={t('vehicle_form.delete')} variant="danger" size="lg" fullWidth onPress={onDelete} />
               ) : null}
            </ThemedView>
         </ScrollView>
      </Screen>
   );
}
