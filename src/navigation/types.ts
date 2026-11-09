import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
   Home: undefined;
   History: undefined;
   Stats: undefined;
   Settings: undefined;
};

export type RootStackParamList = {
   Tabs: NavigatorScreenParams<TabParamList> | undefined;
   /** No entryId → new fill-up, entryId → edit */
   FuelForm: { entryId?: string } | undefined;
   /** No vehicleId → new vehicle, vehicleId → edit */
   VehicleForm: { vehicleId?: string } | undefined;
};
