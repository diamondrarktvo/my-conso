export interface FuelEntry {
   id: string;
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

export interface Settings {
   vehicleName: string;
   /** undefined until the user fills it in */
   tankCapacityLiters?: number;
   currency: string;
   alertThresholdPercent: number;
}

export const DEFAULT_SETTINGS: Settings = {
   vehicleName: 'Yamaha Cygnus X 2013',
   tankCapacityLiters: undefined,
   currency: 'Ar',
   alertThresholdPercent: 15,
};
