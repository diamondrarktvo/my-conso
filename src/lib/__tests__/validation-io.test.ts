import { validateDraft, type FormDraft } from '../validation';
import { parseBackupJson, toBackupJson, toCsv } from '../data-io';
import { migrateV1ToV2 } from '../migrations';
import { DEFAULT_SETTINGS, DEFAULT_VEHICLE, type FuelEntry } from '@/src/features/fuel/types';

const mk = (id: string, day: number, km: number, liters: number, full = true, vehicleId = 'default'): FuelEntry => ({
   id,
   vehicleId,
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

const vehicles = [
   { id: 'default', name: 'Cygnus', tankCapacityLiters: 5.5 },
   { id: 'v2', name: 'Honda PCX', tankCapacityLiters: undefined },
];

describe('sauvegarde', () => {
   it('export puis import redonne les mêmes données (plusieurs véhicules)', () => {
      const all = [...entries, mk('x', 5, 300, 3, true, 'v2')];
      const json = toBackupJson({ entries: all, vehicles, activeVehicleId: 'v2', settings: DEFAULT_SETTINGS });
      const r = parseBackupJson(json);
      expect(r.ok).toBe(true);
      if (r.ok) {
         expect(r.entries).toHaveLength(4);
         expect(r.vehicles.map(v => v.name)).toEqual(['Cygnus', 'Honda PCX']);
         expect(r.vehicles[0].tankCapacityLiters).toBe(5.5);
         expect(r.activeVehicleId).toBe('v2');
         expect(r.entries.find(e => e.id === 'x')!.vehicleId).toBe('v2');
         expect(r.entries.find(e => e.id === 'b')!.liters).toBe(4.2);
      }
   });
   it('ancienne sauvegarde v1 : un véhicule créé depuis les réglages', () => {
      const v1 = JSON.stringify({
         version: 1,
         settings: { vehicleName: 'Ma moto', tankCapacityLiters: 6, currency: 'Ar', alertThresholdPercent: 20 },
         entries: entries.map(({ vehicleId: _v, ...e }) => e),
      });
      const r = parseBackupJson(v1);
      expect(r.ok).toBe(true);
      if (r.ok) {
         expect(r.vehicles).toHaveLength(1);
         expect(r.vehicles[0]).toMatchObject({ name: 'Ma moto', tankCapacityLiters: 6 });
         expect(r.entries.every(e => e.vehicleId === r.vehicles[0].id)).toBe(true);
         expect(r.settings.alertThresholdPercent).toBe(20);
      }
   });
   it('un plein vers un véhicule inconnu est rattaché au premier véhicule', () => {
      const json = toBackupJson({ entries: [mk('z', 1, 100, 3, true, 'ghost')], vehicles, activeVehicleId: 'ghost', settings: DEFAULT_SETTINGS });
      const r = parseBackupJson(json);
      expect(r.ok && r.entries[0].vehicleId).toBe('default');
      expect(r.ok && r.activeVehicleId).toBe('default');
   });
   it('rejette un fichier invalide', () => {
      expect(parseBackupJson('pas du json')).toEqual({ ok: false, reason: 'invalid_json' });
      expect(parseBackupJson('{"a":1}')).toEqual({ ok: false, reason: 'invalid_format' });
      expect(parseBackupJson('{"entries":[{"id":"x"}]}')).toEqual({ ok: false, reason: 'invalid_entry' });
      expect(parseBackupJson('{"entries":[],"vehicles":[{"id":"a"},{"id":"a"}]}')).toEqual({ ok: false, reason: 'invalid_vehicle' });
   });
   it('CSV : en-tête + une ligne par plein, véhicule, cellules échappées', () => {
      const withNote = { ...entries[0], note: 'trajet, avec "passager"' };
      const csv = toCsv([withNote, entries[1]], vehicles).split('\n');
      expect(csv).toHaveLength(3);
      expect(csv[0].startsWith('vehicule,date,kilometrage')).toBe(true);
      expect(csv[1].startsWith('Cygnus,')).toBe(true);
      expect(csv[1]).toContain('"trajet, avec ""passager"""');
   });
});

describe('migration v1 → v2', () => {
   it('crée le véhicule par défaut depuis les anciens réglages et rattache les pleins', () => {
      const old = {
         entries: entries.map(({ vehicleId: _v, ...e }) => e),
         settings: { vehicleName: 'Yamaha', tankCapacityLiters: 5.2, currency: 'Ar', alertThresholdPercent: 15 },
      };
      const m = migrateV1ToV2(old);
      expect(m.vehicles).toEqual([{ id: 'default', name: 'Yamaha', tankCapacityLiters: 5.2 }]);
      expect(m.activeVehicleId).toBe('default');
      expect(m.entries).toHaveLength(3);
      expect(m.entries.every(e => e.vehicleId === 'default')).toBe(true);
      expect(m.settings).toEqual({ currency: 'Ar', alertThresholdPercent: 15 });
   });
   it('tolère un état vide ou corrompu', () => {
      const m = migrateV1ToV2(undefined);
      expect(m.entries).toEqual([]);
      expect(m.vehicles[0].name).toBe(DEFAULT_VEHICLE.name);
   });
});
