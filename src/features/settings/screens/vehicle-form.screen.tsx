import React, { useState } from 'react';
import { Alert, Pressable, ScrollView } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Camera, ImageIcon, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '@/src/components/layout/screen';
import { ThemedView } from '@/src/components/ui/themed-view';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedInput } from '@/src/components/ui/themed-input';
import { ThemedButton } from '@/src/components/ui/themed-button';
import { VehicleAvatar } from '@/src/features/fuel/components/vehicle-avatar';
import { useFuelStore } from '@/src/features/fuel/store';
import { formatNumber, parseDecimal } from '@/src/lib/format';
import { deleteVehiclePhoto, saveVehiclePhoto } from '@/src/lib/vehicle-photo';
import { showToast } from '@/src/providers/toast-provider';
import { showError } from '@/src/providers/error-provider';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import type { RootStackParamList } from '@/src/navigation/types';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
   mediaTypes: ['images'],
   allowsEditing: true, // lets the user crop to a square
   aspect: [1, 1],
   quality: 0.7,
};

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
   const primary = useThemeColor('--color-primary', 'primary');
   const danger = useThemeColor('--color-danger', 'danger');

   const existing = vehicles.find(v => v.id === vehicleId);
   const isEdit = !!existing;

   const [name, setName] = useState(existing?.name ?? '');
   const [tank, setTank] = useState(existing?.tankCapacityLiters != null ? formatNumber(existing.tankCapacityLiters, 2).replace(/,?0+$/, '') : '');
   // The photo is only written to permanent storage on Save, so cancelling leaves no orphan file.
   const [photoUri, setPhotoUri] = useState<string | undefined>(existing?.photoUri);
   const [submitted, setSubmitted] = useState(false);

   const goBack = () => {
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
   };

   const nameError = submitted && name.trim() === '' ? t('vehicle_form.name_required') : undefined;

   const pick = async (source: 'camera' | 'library') => {
      try {
         if (source === 'camera') {
            const perm = await ImagePicker.requestCameraPermissionsAsync();
            if (!perm.granted) {
               showToast('error', t('vehicle_form.photo_permission'));
               return;
            }
         }
         const res =
            source === 'camera'
               ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
               : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
         if (!res.canceled && res.assets[0]) setPhotoUri(res.assets[0].uri);
      } catch (e) {
         showToast('error', t('vehicle_form.photo_error'));
         if (__DEV__) showError(e);
      }
   };

   const onSave = () => {
      setSubmitted(true);
      if (name.trim() === '') return;
      try {
         const parsed = parseDecimal(tank);
         const tankCapacityLiters = parsed != null && parsed > 0 ? parsed : undefined;

         // Copy only when the photo changed (a new pick lives in the picker's cache)
         const changed = photoUri !== existing?.photoUri;
         const finalPhoto = changed && photoUri ? saveVehiclePhoto(photoUri, existing?.id ?? 'new') : photoUri;
         if (changed) deleteVehiclePhoto(existing?.photoUri);

         if (isEdit && vehicleId) updateVehicle(vehicleId, { name: name.trim(), tankCapacityLiters, photoUri: finalPhoto });
         else addVehicle({ name: name.trim(), tankCapacityLiters, photoUri: finalPhoto });
         showToast('success', t('vehicle_form.saved'));
         goBack();
      } catch (e) {
         showError(e);
      }
   };

   const onDelete = () => {
      if (!vehicleId) return;
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
            <ThemedView gap="md" className="items-center bg-transparent">
               <VehicleAvatar vehicle={{ name: name || '?', photoUri }} size={112} />
               <ThemedView items="center" gap="xs" className="bg-transparent">
                  <ThemedText weight="semibold">{t('vehicle_form.photo')}</ThemedText>
                  <ThemedText variant="caption" color="secondary" align="center">
                     {t('vehicle_form.photo_help')}
                  </ThemedText>
               </ThemedView>
               <ThemedView flex="row" gap="sm" className="bg-transparent">
                  <ThemedButton
                     title={t('vehicle_form.photo_take')}
                     variant="secondary"
                     size="md"
                     className="flex-1"
                     leftIcon={<Camera size={18} color={primary} />}
                     onPress={() => pick('camera')}
                  />
                  <ThemedButton
                     title={t('vehicle_form.photo_pick')}
                     variant="secondary"
                     size="md"
                     className="flex-1"
                     leftIcon={<ImageIcon size={18} color={primary} />}
                     onPress={() => pick('library')}
                  />
               </ThemedView>
               {photoUri ? (
                  <Pressable
                     onPress={() => setPhotoUri(undefined)}
                     accessibilityRole="button"
                     style={{ minHeight: 44 }}
                     className="flex-row items-center gap-2 px-3">
                     <Trash2 size={18} color={danger} />
                     <ThemedText color="danger" weight="semibold">
                        {t('vehicle_form.photo_remove')}
                     </ThemedText>
                  </Pressable>
               ) : null}
            </ThemedView>

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
               {isEdit ? <ThemedButton title={t('vehicle_form.delete')} variant="danger" size="lg" fullWidth onPress={onDelete} /> : null}
            </ThemedView>
         </ScrollView>
      </Screen>
   );
}
