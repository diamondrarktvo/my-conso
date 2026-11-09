/**
 * Display and parsing helpers. Computation is done at full precision;
 * rounding happens ONLY here, at display time.
 * Formatting is hand-written (no Intl) so it behaves the same on every JS engine.
 */

const MONTHS = [
   'janvier',
   'février',
   'mars',
   'avril',
   'mai',
   'juin',
   'juillet',
   'août',
   'septembre',
   'octobre',
   'novembre',
   'décembre',
];
const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

/** Parses "4,2" or "4.2" (spaces allowed). Returns null if empty or invalid. */
export function parseDecimal(input: string | undefined | null): number | null {
   if (input == null) return null;
   const cleaned = input.replace(/[\s ]/g, '').replace(',', '.');
   if (cleaned === '' || !/^\d*\.?\d+$|^\d+\.$/.test(cleaned)) return null;
   const n = Number(cleaned);
   return Number.isFinite(n) ? n : null;
}

/** French number: space as thousands separator, comma as decimal separator. */
export function formatNumber(value: number, decimals = 0): string {
   if (!Number.isFinite(value)) return '—';
   const fixed = Math.abs(value).toFixed(decimals);
   const [int, dec] = fixed.split('.');
   const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
   const sign = value < 0 && Number(fixed) !== 0 ? '-' : '';
   return sign + grouped + (dec ? `,${dec}` : '');
}

export const formatMoney = (value: number, currency: string) => `${formatNumber(value, 0)} ${currency}`;
export const formatL100 = (v: number) => formatNumber(v, 2);
export const formatKmPerL = (v: number) => formatNumber(v, 1);
export const formatKm = (v: number) => formatNumber(v, 0);
export const formatLiters = (v: number) => formatNumber(v, 2);

/** "30 mars 2026" */
export function formatDate(iso: string): string {
   const d = new Date(iso);
   return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "lundi 30 mars 2026" */
export function formatDateLong(iso: string): string {
   const d = new Date(iso);
   return `${DAYS[d.getDay()]} ${formatDate(iso)}`;
}

/** "14:05" */
export function formatTime(iso: string): string {
   const d = new Date(iso);
   return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** "mars 2026" */
export function formatMonthYear(iso: string): string {
   const d = new Date(iso);
   return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "mars" short label for charts */
export function formatMonthShort(iso: string): string {
   const d = new Date(iso);
   return MONTHS[d.getMonth()].slice(0, 4) + (MONTHS[d.getMonth()].length > 4 ? '.' : '');
}

/** "01/03" for chart axes */
export function formatDayMonth(iso: string): string {
   const d = new Date(iso);
   return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Number of whole days between `iso` and now (never negative). */
export function daysSince(iso: string, now: Date = new Date()): number {
   const ms = now.getTime() - new Date(iso).getTime();
   return Math.max(0, Math.floor(ms / 86_400_000));
}

/** Year-month key "2026-03" in local time. */
export function monthKey(iso: string): string {
   const d = new Date(iso);
   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
