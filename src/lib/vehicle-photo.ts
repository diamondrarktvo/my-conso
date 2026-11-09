/**
 * Vehicle photos live in the app's document directory (persistent, unlike the picker's cache).
 * The Vehicle only stores the file URI. Photos are NOT part of the JSON backup.
 */

import { Directory, File, Paths } from 'expo-file-system';

const photosDir = () => new Directory(Paths.document, 'vehicle-photos');

/** Copies a picked image into persistent storage and returns its new URI. */
export function saveVehiclePhoto(sourceUri: string, vehicleKey: string): string {
   const dir = photosDir();
   dir.create({ idempotent: true, intermediates: true });
   // Unique name per save so image caches never show a stale picture
   const dest = new File(dir, `${vehicleKey}-${Date.now()}.jpg`);
   new File(sourceUri).copy(dest);
   return dest.uri;
}

/** Best-effort removal; never throws. */
export function deleteVehiclePhoto(uri?: string): void {
   if (!uri) return;
   try {
      const file = new File(uri);
      if (file.exists) file.delete();
   } catch {
      // nothing to do: an orphaned file is harmless
   }
}
