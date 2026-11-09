/**
 * Fuel-entry form validation. Pure: returns codes, the UI translates them.
 * Errors block saving; warnings ask the user to confirm.
 */

import type { FuelEntry } from '@/src/features/fuel/types';
import { previewEntry, sortEntries } from './consumption';

export type FieldErrorCode =
   | 'odometer_required'
   | 'odometer_invalid'
   | 'odometer_not_after_previous'
   | 'odometer_not_before_next'
   | 'liters_required'
   | 'liters_invalid'
   | 'price_invalid';

export type WarningCode = 'liters_over_tank' | 'distance_over_600' | 'consumption_out_of_range';

export interface FormDraft {
   date: string;
   odometerKm: number | null;
   liters: number | null;
   /** Resolved values (null = not provided) */
   pricePerLiter: number | null;
   totalCost: number | null;
   isFullTank: boolean;
   missedPrevious: boolean;
}

export interface FieldErrors {
   odometerKm?: { code: FieldErrorCode; params?: Record<string, string | number> };
   liters?: { code: FieldErrorCode };
   price?: { code: FieldErrorCode };
}

export interface Warning {
   code: WarningCode;
   params?: Record<string, number>;
}

export interface ValidationResult {
   errors: FieldErrors;
   warnings: Warning[];
   hasErrors: boolean;
}

export const MAX_DISTANCE_WARNING_KM = 600;
export const MIN_PLAUSIBLE_L100 = 1.0;
export const MAX_PLAUSIBLE_L100 = 8.0;

/** Rounds to 2 decimals max (for the stored liters value). */
export const round2 = (n: number) => Math.round(n * 100) / 100;

export function validateDraft(
   draft: FormDraft,
   entries: FuelEntry[],
   settings: { tankCapacityLiters?: number },
   editingId?: string,
): ValidationResult {
   const errors: FieldErrors = {};
   const warnings: Warning[] = [];

   // Odometer
   if (draft.odometerKm == null) {
      errors.odometerKm = { code: 'odometer_required' };
   } else if (!(draft.odometerKm > 0)) {
      errors.odometerKm = { code: 'odometer_invalid' };
   } else {
      const others = sortEntries(entries.filter(e => e.id !== editingId));
      const t = Date.parse(draft.date);
      const prev = [...others].reverse().find(e => Date.parse(e.date) <= t);
      const next = others.find(e => Date.parse(e.date) > t);
      if (prev && draft.odometerKm <= prev.odometerKm) {
         errors.odometerKm = { code: 'odometer_not_after_previous', params: { km: prev.odometerKm } };
      } else if (next && draft.odometerKm >= next.odometerKm) {
         errors.odometerKm = { code: 'odometer_not_before_next', params: { km: next.odometerKm } };
      }
   }

   // Liters
   if (draft.liters == null) {
      errors.liters = { code: 'liters_required' };
   } else if (!(draft.liters > 0)) {
      errors.liters = { code: 'liters_invalid' };
   }

   // Price
   if ((draft.pricePerLiter != null && !(draft.pricePerLiter > 0)) || (draft.totalCost != null && !(draft.totalCost > 0))) {
      errors.price = { code: 'price_invalid' };
   }

   const hasErrors = Object.keys(errors).length > 0;

   // Warnings only make sense on a coherent draft
   if (!hasErrors && draft.odometerKm != null && draft.liters != null) {
      const tank = settings.tankCapacityLiters;
      if (tank && draft.liters > tank) {
         warnings.push({ code: 'liters_over_tank', params: { tank } });
      }

      const asEntry = {
         id: '__draft__',
         date: draft.date,
         odometerKm: draft.odometerKm,
         liters: draft.liters,
         isFullTank: draft.isFullTank,
         missedPrevious: draft.missedPrevious,
         pricePerLiter: draft.pricePerLiter ?? undefined,
         totalCost: draft.totalCost ?? undefined,
      };
      const preview = previewEntry(entries, asEntry, editingId);

      if (preview.previous) {
         const distance = draft.odometerKm - preview.previous.odometerKm;
         if (distance > MAX_DISTANCE_WARNING_KM) {
            warnings.push({ code: 'distance_over_600', params: { km: distance } });
         }
      }

      const seg = preview.info.segment;
      if (seg && Number.isFinite(seg.l100) && (seg.l100 < MIN_PLAUSIBLE_L100 || seg.l100 > MAX_PLAUSIBLE_L100)) {
         warnings.push({ code: 'consumption_out_of_range', params: { l100: seg.l100 } });
      }
   }

   return { errors, warnings, hasErrors };
}
