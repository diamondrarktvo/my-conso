/**
 * Fuel consumption — "full-to-full" method.
 *
 * Pure module: no React, no storage. Derived values are never persisted;
 * they are recomputed from the list of fill-ups every time.
 */

import type { FuelEntry } from '@/src/features/fuel/types';

type EntryInput = Pick<
   FuelEntry,
   'id' | 'date' | 'odometerKm' | 'liters' | 'isFullTank' | 'missedPrevious'
> &
   Partial<Pick<FuelEntry, 'pricePerLiter' | 'totalCost'>>;

export interface Segment {
   /** Id of the full-tank entry that closes the segment */
   entryId: string;
   /** Id of the reference entry that opens it */
   fromEntryId: string;
   date: string;
   distanceKm: number;
   liters: number;
   /** null when at least one price is missing */
   cost: number | null;
   l100: number;
   kmPerL: number;
   costPer100Km: number | null;
}

export type EntryRole =
   /** Full tank used as a starting point, no consumption computed */
   | 'reference'
   /** Full tank that closes a valid segment */
   | 'segment'
   /** Full tank whose segment is unusable (distance <= 0) */
   | 'invalid'
   /** Partial fill that was folded into a closed segment */
   | 'partial'
   /** Partial fill after the last reference, not yet closed by a full tank */
   | 'pending'
   /** Entry flagged "missed previous": the chain is broken here */
   | 'broken'
   /** Partial fill with no reference before it: not usable */
   | 'ignored';

export interface EntryInfo {
   role: EntryRole;
   segment?: Segment;
}

export interface Summary {
   segmentCount: number;
   totalKm: number;
   totalLiters: number;
   /** Weighted average: total liters * 100 / total km */
   l100: number | null;
   kmPerL: number | null;
   /** Total cost / total km * 100, over segments that have a cost */
   costPer100Km: number | null;
}

export interface ConsumptionResult {
   sorted: EntryInput[];
   info: Record<string, EntryInfo>;
   /** Valid segments, chronological */
   segments: Segment[];
   /** Segments rejected because distance <= 0 */
   invalidSegments: Segment[];
   /** Partial fills after the last reference (excluded from averages) */
   pendingEntryIds: string[];
   summary: Summary;
   /** Weighted average over the 3 last valid segments */
   recent: Summary;
   lastSegment: Segment | null;
   bestSegment: Segment | null;
   worstSegment: Segment | null;
   /** Sum of all known costs, whatever the segment status */
   totalSpent: number;
}

export const RECENT_SEGMENTS = 3;
export const MIN_SEGMENTS_FOR_ALERT = 3;

/** Cost of an entry, derived from totalCost or pricePerLiter. null if unknown. */
export function entryCost(e: Pick<FuelEntry, 'liters' | 'pricePerLiter' | 'totalCost'>): number | null {
   if (e.totalCost != null && e.totalCost > 0) return e.totalCost;
   if (e.pricePerLiter != null && e.pricePerLiter > 0) return e.pricePerLiter * e.liters;
   return null;
}

export function sortEntries<T extends Pick<FuelEntry, 'date' | 'odometerKm'>>(entries: T[]): T[] {
   return [...entries].sort((a, b) => {
      const da = Date.parse(a.date);
      const db = Date.parse(b.date);
      if (da !== db) return da - db;
      return a.odometerKm - b.odometerKm;
   });
}

export function summarize(segments: Segment[]): Summary {
   const totalKm = segments.reduce((s, x) => s + x.distanceKm, 0);
   const totalLiters = segments.reduce((s, x) => s + x.liters, 0);
   const withCost = segments.filter(x => x.cost != null);
   const costKm = withCost.reduce((s, x) => s + x.distanceKm, 0);
   const cost = withCost.reduce((s, x) => s + (x.cost as number), 0);
   return {
      segmentCount: segments.length,
      totalKm,
      totalLiters,
      l100: totalKm > 0 ? (totalLiters * 100) / totalKm : null,
      kmPerL: totalLiters > 0 && totalKm > 0 ? totalKm / totalLiters : null,
      costPer100Km: costKm > 0 ? (cost * 100) / costKm : null,
   };
}

export function computeConsumption(entries: EntryInput[]): ConsumptionResult {
   const sorted = sortEntries(entries);
   const info: Record<string, EntryInfo> = {};
   const segments: Segment[] = [];
   const invalidSegments: Segment[] = [];

   let reference: EntryInput | null = null;
   let pendingLiters = 0;
   let pendingCost: number | null = 0;
   let pendingIds: string[] = [];

   for (const p of sorted) {
      // a. Broken chain
      if (p.missedPrevious) {
         pendingLiters = 0;
         pendingCost = 0;
         // earlier partials that never got closed are dropped from the chain
         for (const id of pendingIds) info[id] = { role: 'ignored' };
         pendingIds = [];
         if (p.isFullTank) {
            reference = p;
         } else {
            reference = null;
         }
         info[p.id] = { role: 'broken' };
         continue;
      }

      // b. No reference yet
      if (reference === null) {
         info[p.id] = { role: p.isFullTank ? 'reference' : 'ignored' };
         if (p.isFullTank) reference = p;
         continue;
      }

      const cost = entryCost(p);

      // c. Partial fill
      if (!p.isFullTank) {
         pendingLiters += p.liters;
         pendingCost = pendingCost !== null && cost !== null ? pendingCost + cost : null;
         pendingIds.push(p.id);
         info[p.id] = { role: 'pending' };
         continue;
      }

      // d. Full tank closes a segment
      const distanceKm = p.odometerKm - reference.odometerKm;
      const liters = pendingLiters + p.liters;
      const segCost = pendingCost !== null && cost !== null ? pendingCost + cost : null;
      const valid = distanceKm > 0 && liters > 0;
      const segment: Segment = {
         entryId: p.id,
         fromEntryId: reference.id,
         date: p.date,
         distanceKm,
         liters,
         cost: segCost,
         l100: valid ? (liters * 100) / distanceKm : NaN,
         kmPerL: valid ? distanceKm / liters : NaN,
         costPer100Km: valid && segCost !== null ? (segCost * 100) / distanceKm : null,
      };
      for (const id of pendingIds) info[id] = { role: 'partial' };
      if (valid) {
         segments.push(segment);
         info[p.id] = { role: 'segment', segment };
      } else {
         invalidSegments.push(segment);
         info[p.id] = { role: 'invalid', segment };
      }
      reference = p;
      pendingLiters = 0;
      pendingCost = 0;
      pendingIds = [];
   }

   // Partials after the last reference stay "pending" (already marked above)
   const summary = summarize(segments);
   const recent = summarize(segments.slice(-RECENT_SEGMENTS));

   let bestSegment: Segment | null = null;
   let worstSegment: Segment | null = null;
   for (const s of segments) {
      if (!bestSegment || s.l100 < bestSegment.l100) bestSegment = s;
      if (!worstSegment || s.l100 > worstSegment.l100) worstSegment = s;
   }

   const totalSpent = sorted.reduce((sum, e) => sum + (entryCost(e) ?? 0), 0);

   return {
      sorted,
      info,
      segments,
      invalidSegments,
      pendingEntryIds: pendingIds,
      summary,
      recent,
      lastSegment: segments.length ? segments[segments.length - 1] : null,
      bestSegment,
      worstSegment,
      totalSpent,
   };
}

/** Estimated range in km with a full tank, or null when it can't be computed. */
export function estimatedRangeKm(l100: number | null, tankCapacityLiters?: number): number | null {
   if (!l100 || l100 <= 0 || !tankCapacityLiters || tankCapacityLiters <= 0) return null;
   return (tankCapacityLiters * 100) / l100;
}

export interface ConsumptionAlert {
   /** Increase of the last segment vs the global average, in % */
   percent: number;
}

/**
 * Alert when the last segment is more than `thresholdPercent` above the global average,
 * and at least 3 valid segments exist.
 */
export function computeAlert(result: ConsumptionResult, thresholdPercent: number): ConsumptionAlert | null {
   const { lastSegment, summary } = result;
   if (!lastSegment || !summary.l100 || summary.segmentCount < MIN_SEGMENTS_FOR_ALERT) return null;
   const percent = ((lastSegment.l100 - summary.l100) / summary.l100) * 100;
   return percent > thresholdPercent ? { percent } : null;
}

export type Period = '3m' | '6m' | '1y' | 'all';

export function filterSegmentsByPeriod(segments: Segment[], period: Period, now: Date = new Date()): Segment[] {
   if (period === 'all') return segments;
   const months = period === '3m' ? 3 : period === '6m' ? 6 : 12;
   const limit = new Date(now);
   limit.setMonth(limit.getMonth() - months);
   return segments.filter(s => Date.parse(s.date) >= limit.getTime());
}

/**
 * Preview of what a draft entry would produce, used by the form.
 * `editingId` replaces an existing entry; otherwise the draft is added.
 */
export function previewEntry(
   entries: EntryInput[],
   draft: EntryInput,
   editingId?: string,
): { info: EntryInfo; previous: EntryInput | null; distanceFromLastFullKm: number | null } {
   const others = entries.filter(e => e.id !== editingId);
   const result = computeConsumption([...others, draft]);
   const idx = result.sorted.findIndex(e => e.id === draft.id);
   const previous = idx > 0 ? result.sorted[idx - 1] : null;
   let lastFull: EntryInput | null = null;
   for (let i = idx - 1; i >= 0; i--) {
      if (result.sorted[i].isFullTank) {
         lastFull = result.sorted[i];
         break;
      }
   }
   return {
      info: result.info[draft.id] ?? { role: 'ignored' },
      previous,
      distanceFromLastFullKm: lastFull ? draft.odometerKm - lastFull.odometerKm : null,
   };
}
