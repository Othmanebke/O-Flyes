import { firstDay, fitToBudget, parseActivity, proposalItems } from './itinerary';
import type { Plan, PlanItem } from './plan';

describe('parseActivity', () => {
    it('lit un prix entre parenthèses', () => {
        expect(parseActivity('Musée national (12 €)')).toEqual({ title: 'Musée national', perPerson: 12 });
    });
    it('comprend « gratuit »', () => {
        expect(parseActivity('Plage de Cascais (gratuit)')).toEqual({ title: 'Plage de Cascais', perPerson: 0 });
    });
    it('prend le milieu d\'une fourchette', () => {
        expect(parseActivity('Dîner au marché (20-30 €)').perPerson).toBe(25);
    });
    it('renvoie null sans prix', () => {
        expect(parseActivity('Balade dans l\'Alfama')).toEqual({ title: 'Balade dans l\'Alfama', perPerson: null });
    });
});

describe('firstDay', () => {
    it('lit le premier jour de l\'étape', () => {
        expect(firstDay('Jour 3')).toBe(3);
        expect(firstDay('Jour 3 à 4')).toBe(3);
        expect(firstDay('Étape')).toBeNull();
    });
});

const plan: Plan = { destination: 'Lisbonne', origin: 'Paris', depart: '2026-12-10', ret: '2026-12-17', travelers: 2, items: [], createdAt: 0 };

describe('proposalItems', () => {
    it('range les activités au bon jour avec le prix pour le groupe', () => {
        const [first] = proposalItems({ title: '', summary: '', totalDays: 8, steps: [
            { dayRange: 'Jour 2', locationName: 'Belém', country: 'Portugal', description: '', activities: ['Monastère (10 €)', 'Pastéis (gratuit)'] },
        ] }, plan, 'trip1');
        expect(first.items[0]).toMatchObject({ key: 'ai:trip1:0:0', date: '2026-12-11', price: 20, type: 'activity' });
        expect(first.items[1].price).toBe(0);
    });
});

describe('fitToBudget', () => {
    const it_ = (key: string, price: number | null) => ({ key, type: 'activity', title: key, price }) as PlanItem;
    it('garde le gratuit puis le moins cher jusqu\'au budget', () => {
        const kept = fitToBudget([it_('a', 50), it_('b', 0), it_('c', 20), it_('d', null)], 30);
        expect(kept.map(i => i.key)).toEqual(['b', 'c']);
    });
});
