/**
 * Export / import of the user's data. Pure (string in, string out) so it is testable;
 * file access and sharing live in the settings screen.
 */

import type { FuelEntry, Settings } from '@/src/features/fuel/types';
import { DEFAULT_SETTINGS } from '@/src/features/fuel/types';
import { entryCost, sortEntries } from './consumption';

export const BACKUP_VERSION = 1;

export interface Backup {
   app: 'my-conso';
   version: number;
   exportedAt: string;
   settings: Settings;
   entries: FuelEntry[];
}

export function toBackupJson(entries: FuelEntry[], settings: Settings, now: Date = new Date()): string {
   const backup: Backup = {
      app: 'my-conso',
      version: BACKUP_VERSION,
      exportedAt: now.toISOString(),
      settings,
      entries: sortEntries(entries),
   };
   return JSON.stringify(backup, null, 2);
}

const csvCell = (v: string | number | boolean | undefined | null) => {
   if (v == null) return '';
   const s = String(v);
   return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function toCsv(entries: FuelEntry[]): string {
   const header = [
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

export type ParseResult = { ok: true; entries: FuelEntry[]; settings: Settings } | { ok: false; reason: string };

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
      const now = new Date().toISOString();
      entries.push({
         id: e.id,
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

   const s = raw.settings ?? {};
   const settings: Settings = {
      vehicleName: optStr(s.vehicleName) ?? DEFAULT_SETTINGS.vehicleName,
      tankCapacityLiters: optNum(s.tankCapacityLiters),
      currency: optStr(s.currency) ?? DEFAULT_SETTINGS.currency,
      alertThresholdPercent: isNum(s.alertThresholdPercent) && s.alertThresholdPercent > 0 ? s.alertThresholdPercent : DEFAULT_SETTINGS.alertThresholdPercent,
   };
   return { ok: true, entries, settings };
}
