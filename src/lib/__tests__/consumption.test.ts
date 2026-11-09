import {
   computeAlert,
   computeConsumption,
   estimatedRangeKm,
   filterSegmentsByPeriod,
   previewEntry,
} from '../consumption';
import { parseDecimal } from '../format';

const PRICE = 5000;

function entry(
   id: string,
   date: string,
   odometerKm: number,
   liters: number,
   opts: { full?: boolean; missed?: boolean; price?: number | null } = {},
) {
   const { full = true, missed = false, price = PRICE } = opts;
   return {
      id,
      date: `${date}T10:00:00.000Z`,
      odometerKm,
      liters,
      isFullTank: full,
      missedPrevious: missed,
      ...(price != null ? { pricePerLiter: price, totalCost: price * liters } : {}),
   };
}

const scenario = [
   entry('1', '2026-03-01', 1000, 5.0),
   entry('2', '2026-03-08', 1150, 4.2),
   entry('3', '2026-03-12', 1230, 2.0, { full: false }),
   entry('4', '2026-03-18', 1330, 3.0),
   entry('5', '2026-03-25', 1480, 4.5, { missed: true }),
   entry('6', '2026-03-30', 1600, 3.6),
];

describe('computeConsumption — scénario de référence', () => {
   const r = computeConsumption(scenario);

   it('plein 1 : référence, pas de conso', () => {
      expect(r.info['1'].role).toBe('reference');
      expect(r.info['1'].segment).toBeUndefined();
   });

   it('plein 2 : 150 km, 2,80 L/100, 35,7 km/L', () => {
      const s = r.info['2'].segment!;
      expect(s.distanceKm).toBe(150);
      expect(s.liters).toBeCloseTo(4.2);
      expect(s.l100).toBeCloseTo(2.8, 5);
      expect(s.kmPerL).toBeCloseTo(35.714, 3);
   });

   it('plein 3 : partiel, intégré au segment 4', () => {
      expect(r.info['3'].role).toBe('partial');
   });

   it('plein 4 : 180 km, 5,0 L → 2,78 L/100', () => {
      const s = r.info['4'].segment!;
      expect(s.distanceKm).toBe(180);
      expect(s.liters).toBeCloseTo(5.0);
      expect(s.l100).toBeCloseTo(2.7778, 3);
      expect(s.cost).toBeCloseTo(25000);
   });

   it('plein 5 : chaîne rompue, nouvelle référence, pas de conso', () => {
      expect(r.info['5'].role).toBe('broken');
      expect(r.info['5'].segment).toBeUndefined();
   });

   it('plein 6 : 120 km, 3,00 L/100', () => {
      const s = r.info['6'].segment!;
      expect(s.distanceKm).toBe(120);
      expect(s.l100).toBeCloseTo(3.0, 5);
   });

   it('totaux : 3 segments, 450 km, 12,8 L', () => {
      expect(r.summary.segmentCount).toBe(3);
      expect(r.summary.totalKm).toBe(450);
      expect(r.summary.totalLiters).toBeCloseTo(12.8, 10);
   });

   it('moyenne globale pondérée 2,8444 L/100, 35,2 km/L', () => {
      expect(r.summary.l100).toBeCloseTo(2.84444, 4);
      expect(r.summary.kmPerL).toBeCloseTo(35.156, 3);
      expect(r.summary.kmPerL!.toFixed(1)).toBe('35.2');
   });

   it('la moyenne n’est PAS la moyenne des moyennes', () => {
      const mean = r.segments.reduce((s, x) => s + x.l100, 0) / r.segments.length;
      expect(r.summary.l100).not.toBeCloseTo(mean, 6);
   });

   it('coût moyen : 14 222 Ar / 100 km', () => {
      expect(Math.round(r.summary.costPer100Km!)).toBe(14222);
   });

   it('min / max', () => {
      expect(r.bestSegment!.entryId).toBe('4'); // 2,78 < 2,80
      expect(r.worstSegment!.entryId).toBe('6');
   });

   it('total dépensé = tous les pleins', () => {
      const liters = 5 + 4.2 + 2 + 3 + 4.5 + 3.6;
      expect(r.totalSpent).toBeCloseTo(liters * PRICE);
   });

   it('l’ordre d’entrée n’a pas d’importance', () => {
      const shuffled = computeConsumption([...scenario].reverse());
      expect(shuffled.summary.l100).toBeCloseTo(r.summary.l100!, 10);
   });
});

describe('tendance récente', () => {
   it('pondérée sur les 3 derniers segments', () => {
      const r = computeConsumption([
         entry('a', '2026-01-01', 0, 5),
         entry('b', '2026-01-10', 100, 3), // 3,00
         entry('c', '2026-01-20', 300, 4), // 2,00 (200 km)
         entry('d', '2026-01-30', 400, 4), // 4,00
         entry('e', '2026-02-10', 600, 5), // 2,50
      ]);
      expect(r.segments).toHaveLength(4);
      // derniers 3 : c, d, e → 13 L / 500 km
      expect(r.recent.segmentCount).toBe(3);
      expect(r.recent.l100).toBeCloseTo(2.6, 6);
   });
});

describe('cas limites', () => {
   it('liste vide', () => {
      const r = computeConsumption([]);
      expect(r.segments).toHaveLength(0);
      expect(r.summary.l100).toBeNull();
      expect(r.summary.kmPerL).toBeNull();
      expect(r.summary.costPer100Km).toBeNull();
      expect(r.lastSegment).toBeNull();
      expect(r.totalSpent).toBe(0);
   });

   it('un seul plein : référence uniquement', () => {
      const r = computeConsumption([entry('1', '2026-03-01', 1000, 5)]);
      expect(r.segments).toHaveLength(0);
      expect(r.info['1'].role).toBe('reference');
      expect(r.summary.l100).toBeNull();
   });

   it('premier plein partiel : ignoré', () => {
      const r = computeConsumption([
         entry('1', '2026-03-01', 1000, 2, { full: false }),
         entry('2', '2026-03-05', 1050, 4),
         entry('3', '2026-03-10', 1150, 3),
      ]);
      expect(r.info['1'].role).toBe('ignored');
      expect(r.info['2'].role).toBe('reference');
      expect(r.segments).toHaveLength(1);
      expect(r.segments[0].liters).toBe(3);
   });

   it('pleins partiels après la dernière référence : en attente, hors moyennes', () => {
      const r = computeConsumption([
         entry('1', '2026-03-01', 1000, 5),
         entry('2', '2026-03-05', 1100, 3),
         entry('3', '2026-03-08', 1150, 2, { full: false }),
      ]);
      expect(r.info['3'].role).toBe('pending');
      expect(r.pendingEntryIds).toEqual(['3']);
      expect(r.summary.totalLiters).toBe(3);
   });

   it('distance nulle : segment invalide, non utilisé', () => {
      const r = computeConsumption([
         entry('1', '2026-03-01', 1000, 5),
         entry('2', '2026-03-05', 1000, 3),
      ]);
      expect(r.segments).toHaveLength(0);
      expect(r.invalidSegments).toHaveLength(1);
      expect(r.info['2'].role).toBe('invalid');
      expect(r.summary.l100).toBeNull();
   });

   it('distance négative : segment invalide', () => {
      const r = computeConsumption([
         entry('1', '2026-03-01', 1000, 5),
         entry('2', '2026-03-05', 900, 3),
      ]);
      expect(r.segments).toHaveLength(0);
      expect(r.invalidSegments).toHaveLength(1);
   });

   it('plein sans prix : consommation calculée, coût exclu', () => {
      const r = computeConsumption([
         entry('1', '2026-03-01', 1000, 5),
         entry('2', '2026-03-08', 1150, 4.2, { price: null }),
         entry('3', '2026-03-15', 1300, 4.5),
      ]);
      expect(r.segments).toHaveLength(2);
      expect(r.segments[0].cost).toBeNull();
      expect(r.segments[0].costPer100Km).toBeNull();
      // coût moyen = seul le segment 2 (22 500 Ar sur 150 km)
      expect(r.summary.costPer100Km).toBeCloseTo((4.5 * PRICE * 100) / 150);
      // litres/km restent comptés pour la conso
      expect(r.summary.totalLiters).toBeCloseTo(8.7);
   });

   it('prix manquant sur un partiel : coût du segment inconnu', () => {
      const r = computeConsumption([
         entry('1', '2026-03-01', 1000, 5),
         entry('2', '2026-03-05', 1050, 2, { full: false, price: null }),
         entry('3', '2026-03-10', 1150, 3),
      ]);
      expect(r.segments[0].cost).toBeNull();
      expect(r.segments[0].liters).toBe(5);
   });

   it('le prix peut venir de totalCost seul', () => {
      const r = computeConsumption([
         { ...entry('1', '2026-03-01', 1000, 5, { price: null }) },
         { ...entry('2', '2026-03-08', 1100, 4, { price: null }), totalCost: 20000 },
      ]);
      expect(r.segments[0].cost).toBe(20000);
   });

   it('plein partiel marqué « oublié » : pas de référence', () => {
      const r = computeConsumption([
         entry('1', '2026-03-01', 1000, 5),
         entry('2', '2026-03-05', 1100, 2, { full: false, missed: true }),
         entry('3', '2026-03-10', 1200, 4),
      ]);
      expect(r.info['2'].role).toBe('broken');
      expect(r.info['3'].role).toBe('reference');
      expect(r.segments).toHaveLength(0);
   });

   it('même date : tri par kilométrage', () => {
      const r = computeConsumption([
         entry('b', '2026-03-05', 1100, 3),
         entry('a', '2026-03-05', 1000, 5),
      ]);
      expect(r.sorted.map(e => e.id)).toEqual(['a', 'b']);
      expect(r.segments).toHaveLength(1);
   });
});

describe('saisie avec virgule ou point', () => {
   it('"4,2" et "4.2" donnent la même valeur', () => {
      expect(parseDecimal('4,2')).toBe(4.2);
      expect(parseDecimal('4.2')).toBe(4.2);
      const liters = parseDecimal('4,2')!;
      const r = computeConsumption([
         entry('1', '2026-03-01', 1000, 5),
         entry('2', '2026-03-08', 1150, liters),
      ]);
      expect(r.segments[0].l100).toBeCloseTo(2.8, 5);
   });
});

describe('autonomie, alerte, période, aperçu', () => {
   it('autonomie estimée', () => {
      const r = computeConsumption(scenario);
      expect(estimatedRangeKm(r.summary.l100, 5.5)).toBeCloseTo((5.5 * 100) / 2.84444, 2);
      expect(estimatedRangeKm(r.summary.l100, undefined)).toBeNull();
      expect(estimatedRangeKm(null, 5.5)).toBeNull();
   });

   it('alerte : au moins 3 segments et dernier > moyenne + seuil', () => {
      const base = [
         entry('a', '2026-01-01', 0, 5),
         entry('b', '2026-01-10', 100, 3), // 3,0
         entry('c', '2026-01-20', 200, 3), // 3,0
         entry('d', '2026-01-30', 300, 3), // 3,0
         entry('e', '2026-02-10', 400, 5), // 5,0
      ];
      const alert = computeAlert(computeConsumption(base), 15);
      expect(alert).not.toBeNull();
      // moyenne = 14 L / 400 km = 3,5 ; dernier 5,0 → +42,86 %
      expect(alert!.percent).toBeCloseTo(42.857, 2);
      expect(computeAlert(computeConsumption(base), 50)).toBeNull();
   });

   it('pas d’alerte avec moins de 3 segments', () => {
      const r = computeConsumption([
         entry('a', '2026-01-01', 0, 5),
         entry('b', '2026-01-10', 100, 3),
         entry('c', '2026-01-20', 200, 9),
      ]);
      expect(computeAlert(r, 15)).toBeNull();
   });

   it('filtre de période', () => {
      const r = computeConsumption(scenario);
      const now = new Date('2026-04-01T00:00:00.000Z');
      expect(filterSegmentsByPeriod(r.segments, 'all', now)).toHaveLength(3);
      expect(filterSegmentsByPeriod(r.segments, '3m', now)).toHaveLength(3);
      expect(filterSegmentsByPeriod(r.segments, '3m', new Date('2026-07-15T00:00:00.000Z'))).toHaveLength(0);
   });

   it('aperçu du formulaire', () => {
      const draft = entry('draft', '2026-04-05', 1700, 3.0);
      const p = previewEntry(scenario, draft);
      expect(p.info.role).toBe('segment');
      expect(p.info.segment!.l100).toBeCloseTo(3.0, 5);
      expect(p.distanceFromLastFullKm).toBe(100);
      expect(p.previous!.id).toBe('6');
   });

   it('aperçu en modification : remplace l’entrée existante', () => {
      const draft = { ...scenario[5], liters: 6 };
      const p = previewEntry(scenario, draft, '6');
      expect(p.info.segment!.l100).toBeCloseTo(5.0, 5);
   });
});
