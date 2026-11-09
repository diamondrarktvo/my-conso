import { validateDraft, type FormDraft } from '../validation';
import { parseBackupJson, toBackupJson, toCsv } from '../data-io';
import { DEFAULT_SETTINGS, type FuelEntry } from '@/src/features/fuel/types';

const mk = (id: string, day: number, km: number, liters: number, full = true): FuelEntry => ({
   id,
   date: new Date(2026, 2, day, 10).toISOString(),
   odometerKm: km,
   liters,
   pricePerLiter: 5000,
   totalCost: 5000 * liters,
   isFullTank: full,
   missedPrevious: false,
   createdAt: '2026-03-01T00:00:00.000Z',
   updatedAt: '2026-03-01T00:00:00.000Z',
});

const entries = [mk('a', 1, 1000, 5), mk('b', 8, 1150, 4.2), mk('c', 18, 1330, 5)];

const draft = (over: Partial<FormDraft>): FormDraft => ({
   date: new Date(2026, 2, 25, 10).toISOString(),
   odometerKm: 1450,
   liters: 4,
   pricePerLiter: 5000,
   totalCost: 20000,
   isFullTank: true,
   missedPrevious: false,
   ...over,
});

describe('validateDraft', () => {
   it('plein valide', () => {
      const r = validateDraft(draft({}), entries, {});
      expect(r.hasErrors).toBe(false);
      expect(r.warnings).toEqual([]);
   });
   it('champs vides ou nuls', () => {
      const r = validateDraft(draft({ odometerKm: null, liters: null }), entries, {});
      expect(r.errors.odometerKm?.code).toBe('odometer_required');
      expect(r.errors.liters?.code).toBe('liters_required');
      expect(validateDraft(draft({ liters: 0 }), entries, {}).errors.liters?.code).toBe('liters_invalid');
      expect(validateDraft(draft({ odometerKm: 0 }), entries, {}).errors.odometerKm?.code).toBe('odometer_invalid');
   });
   it('prix <= 0 bloque', () => {
      expect(validateDraft(draft({ pricePerLiter: 0 }), entries, {}).errors.price?.code).toBe('price_invalid');
   });
   it('km <= précédent bloque', () => {
      const r = validateDraft(draft({ odometerKm: 1330 }), entries, {});
      expect(r.errors.odometerKm?.code).toBe('odometer_not_after_previous');
   });
   it('km >= suivant bloque (modification d’un ancien plein)', () => {
      const r = validateDraft(draft({ date: entries[1].date, odometerKm: 1400 }), entries, {}, 'b');
      expect(r.errors.odometerKm?.code).toBe('odometer_not_before_next');
   });
   it('modifier un plein sans changer ses km est valide', () => {
      const r = validateDraft(draft({ date: entries[1].date, odometerKm: 1150, liters: 4.2 }), entries, {}, 'b');
      expect(r.hasErrors).toBe(false);
   });
   it('avertit : litres > réservoir', () => {
      const r = validateDraft(draft({ liters: 9 }), entries, { tankCapacityLiters: 5.5 });
      expect(r.warnings.map(w => w.code)).toContain('liters_over_tank');
   });
   it('avertit : distance > 600 km', () => {
      const r = validateDraft(draft({ odometerKm: 2000, liters: 30 }), entries, {});
      expect(r.warnings.map(w => w.code)).toContain('distance_over_600');
   });
   it('avertit : consommation hors 1,0–8,0 L/100', () => {
      const low = validateDraft(draft({ odometerKm: 1500, liters: 1 }), entries, {});
      expect(low.warnings.map(w => w.code)).toContain('consumption_out_of_range');
      const high = validateDraft(draft({ odometerKm: 1360, liters: 6 }), entries, {});
      expect(high.warnings.map(w => w.code)).toContain('consumption_out_of_range');
   });
});

describe('sauvegarde', () => {
   it('export puis import redonne les mêmes données', () => {
      const json = toBackupJson(entries, { ...DEFAULT_SETTINGS, tankCapacityLiters: 5.5 });
      const r = parseBackupJson(json);
      expect(r.ok).toBe(true);
      if (r.ok) {
         expect(r.entries).toHaveLength(3);
         expect(r.entries[1].liters).toBe(4.2);
         expect(r.settings.tankCapacityLiters).toBe(5.5);
      }
   });
   it('rejette un fichier invalide', () => {
      expect(parseBackupJson('pas du json')).toEqual({ ok: false, reason: 'invalid_json' });
      expect(parseBackupJson('{"a":1}')).toEqual({ ok: false, reason: 'invalid_format' });
      expect(parseBackupJson('{"entries":[{"id":"x"}]}')).toEqual({ ok: false, reason: 'invalid_entry' });
   });
   it('CSV : en-tête + une ligne par plein, cellules échappées', () => {
      const withNote = { ...entries[0], note: 'trajet, avec "passager"' };
      const csv = toCsv([withNote, entries[1]]).split('\n');
      expect(csv).toHaveLength(3);
      expect(csv[0].startsWith('date,kilometrage')).toBe(true);
      expect(csv[1]).toContain('"trajet, avec ""passager"""');
   });
});
