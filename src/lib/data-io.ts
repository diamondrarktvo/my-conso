/**
 * Export / import of the user's data. Pure (string in, string out) so it is testable;
 * file access and sharing live in the settings screen.
 */

import type { FuelEntry, Settings, Vehicle } from '@/src/features/fuel/types';
import { DEFAULT_SETTINGS, DEFAULT_VEHICLE_ID, DEFAULT_VEHICLE_NAME } from '@/src/features/fuel/types';
import { entryCost, sortEntries } from './consumption';

export const BACKUP_VERSION = 2;

export interface Backup {
   app: 'my-conso';
   version: number;
   exportedAt: string;
   settings: Settings;
   vehicles: Vehicle[];
   activeVehicleId: string;
   entries: FuelEntry[];
}

export function toBackupJson(
   data: { entries: FuelEntry[]; vehicles: Vehicle[]; activeVehicleId: string; settings: Settings },
   now: Date = new Date(),
): string {
   const backup: Backup = {
      app: 'my-conso',
      version: BACKUP_VERSION,
      exportedAt: now.toISOString(),
      settings: data.settings,
      vehicles: data.vehicles,
      activeVehicleId: data.activeVehicleId,
      entries: sortEntries(data.entries),
   };
   return JSON.stringify(backup, null, 2);
}

const csvCell = (v: string | number | boolean | undefined | null) => {
   if (v == null) return '';
   const s = String(v);
   return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function toCsv(entries: FuelEntry[], vehicles: Vehicle[] = []): string {
   const names = new Map(vehicles.map(v => [v.id, v.name]));
   const header = [
      'vehicule',
      'date',
      'kilometrage',
      'litres',
      'prix_litre',
      'montant',
      'plein_complet',
      'plein_precedent_oublie',
      'station',
      'note',
   ];
   const rows = sortEntries(entries).map(e =>
      [
         names.get(e.vehicleId) ?? '',
         e.date,
         e.odometerKm,
         e.liters,
         e.pricePerLiter,
         entryCost(e),
         e.isFullTank ? 'oui' : 'non',
         e.missedPrevious ? 'oui' : 'non',
         e.station,
         e.note,
      ]
         .map(csvCell)
         .join(','),
   );
   return [header.join(','), ...rows].join('\n');
}

export type ParseResult =
   | { ok: true; entries: FuelEntry[]; vehicles: Vehicle[]; activeVehicleId: string; settings: Settings }
   | { ok: false; reason: string };

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const optNum = (v: unknown) => (isNum(v) && v > 0 ? v : undefined);
const optStr = (v: unknown) => (typeof v === 'string' && v.trim() ? v : undefined);

export function parseBackupJson(text: string): ParseResult {
   let raw: any;
   try {
      raw = JSON.parse(text);
   } catch {
      return { ok: false, reason: 'invalid_json' };
   }
   if (!raw || typeof raw !== 'object' || !Array.isArray(raw.entries)) {
      return { ok: false, reason: 'invalid_format' };
   }

   const s = raw.settings ?? {};

   // v2 has a vehicles list; v1 had a single vehicle described in settings
   let vehicles: Vehicle[] = [];
   if (Array.isArray(raw.vehicles)) {
      const ids = new Set<string>();
      for (const v of raw.vehicles) {
         if (!v || typeof v.id !== 'string' || ids.has(v.id)) return { ok: false, reason: 'invalid_vehicle' };
         ids.add(v.id);
         vehicles.push({ id: v.id, name: optStr(v.name) ?? DEFAULT_VEHICLE_NAME, tankCapacityLiters: optNum(v.tankCapacityLiters) });
      }
   }
   if (vehicles.length === 0) {
      vehicles = [{ id: DEFAULT_VEHICLE_ID, name: optStr(s.vehicleName) ?? DEFAULT_VEHICLE_NAME, tankCapacityLiters: optNum(s.tankCapacityLiters) }];
   }
   const vehicleIds = new Set(vehicles.map(v => v.id));

   const entries: FuelEntry[] = [];
   const seen = new Set<string>();
   for (const e of raw.entries) {
      if (
         !e ||
         typeof e.id !== 'string' ||
         seen.has(e.id) ||
         typeof e.date !== 'string' ||
         Number.isNaN(Date.parse(e.date)) ||
         !isNum(e.odometerKm) ||
         e.odometerKm <= 0 ||
         !isNum(e.liters) ||
         e.liters <= 0
      ) {
         return { ok: false, reason: 'invalid_entry' };
      }
      seen.add(e.id);
      const vehicleId = typeof e.vehicleId === 'string' && vehicleIds.has(e.vehicleId) ? e.vehicleId : vehicles[0].id;
      const now = new Date().toISOString();
      entries.push({
         id: e.id,
         vehicleId,
         date: e.date,
         odometerKm: e.odometerKm,
         liters: e.liters,
         pricePerLiter: optNum(e.pricePerLiter),
         totalCost: optNum(e.totalCost),
         isFullTank: e.isFullTank !== false,
         missedPrevious: e.missedPrevious === true,
         station: optStr(e.station),
         note: optStr(e.note),
         createdAt: typeof e.createdAt === 'string' ? e.createdAt : now,
         updatedAt: typeof e.updatedAt === 'string' ? e.updatedAt : now,
      });
   }

   const settings: Settings = {
      currency: optStr(s.currency) ?? DEFAULT_SETTINGS.currency,
      alertThresholdPercent:
         isNum(s.alertThresholdPercent) && s.alertThresholdPercent > 0 ? s.alertThresholdPercent : DEFAULT_SETTINGS.alertThresholdPercent,
   };
   const activeVehicleId = typeof raw.activeVehicleId === 'string' && vehicleIds.has(raw.activeVehicleId) ? raw.activeVehicleId : vehicles[0].id;
   return { ok: true, entries, vehicles, activeVehicleId, settings };
}
