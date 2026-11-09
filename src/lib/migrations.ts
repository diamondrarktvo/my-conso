/**
 * Persisted-store migrations (pure, testable).
 * v1: one vehicle described in settings (vehicleName, tankCapacityLiters), no vehicleId on entries.
 * v2: vehicles[] + activeVehicleId, every entry has a vehicleId.
 */

import {
   DEFAULT_SETTINGS,
   DEFAULT_VEHICLE_ID,
   DEFAULT_VEHICLE_NAME,
   type FuelEntry,
   type Settings,
   type Vehicle,
} from '@/src/features/fuel/types';

export interface PersistedDataV2 {
   entries: FuelEntry[];
   vehicles: Vehicle[];
   activeVehicleId: string;
   settings: Settings;
}

export function migrateV1ToV2(persisted: unknown): PersistedDataV2 {
   const old = (persisted ?? {}) as { entries?: Omit<FuelEntry, 'vehicleId'>[]; settings?: Record<string, unknown> };
   const s = old.settings ?? {};
   return {
      entries: (old.entries ?? []).map(e => ({ ...e, vehicleId: DEFAULT_VEHICLE_ID })),
      vehicles: [
         {
            id: DEFAULT_VEHICLE_ID,
            name: typeof s.vehicleName === 'string' && s.vehicleName ? s.vehicleName : DEFAULT_VEHICLE_NAME,
            tankCapacityLiters: typeof s.tankCapacityLiters === 'number' ? s.tankCapacityLiters : undefined,
         },
      ],
      activeVehicleId: DEFAULT_VEHICLE_ID,
      settings: {
         currency: typeof s.currency === 'string' && s.currency ? s.currency : DEFAULT_SETTINGS.currency,
         alertThresholdPercent:
            typeof s.alertThresholdPercent === 'number' ? s.alertThresholdPercent : DEFAULT_SETTINGS.alertThresholdPercent,
      },
   };
}
