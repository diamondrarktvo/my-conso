export interface Vehicle {
   id: string;
   name: string;
   /** undefined until the user fills it in */
   tankCapacityLiters?: number;
   /** Local file URI of the (optional) photo, stored in the app's document directory */
   photoUri?: string;
}

export interface FuelEntry {
   id: string;
   vehicleId: string;
   /** ISO date-time */
   date: string;
   /** Total odometer reading in km */
   odometerKm: number;
   liters: number;
   pricePerLiter?: number;
   totalCost?: number;
   isFullTank: boolean;
   /** The user forgot to record a fill-up before this one → the chain is broken */
   missedPrevious: boolean;
   station?: string;
   note?: string;
   createdAt: string;
   updatedAt: string;
}

/** App-wide settings (per-vehicle settings live on Vehicle). */
export interface Settings {
   currency: string;
   alertThresholdPercent: number;
}

/**
 * Id/name of the vehicle that early versions created automatically.
 * No vehicle is created by default anymore: the user adds their own.
 * Only used to migrate old data.
 */
export const LEGACY_VEHICLE_ID = 'default';
export const LEGACY_VEHICLE_NAME = 'Yamaha Cygnus X 2013';

export const DEFAULT_SETTINGS: Settings = {
   currency: 'Ar',
   alertThresholdPercent: 15,
};
