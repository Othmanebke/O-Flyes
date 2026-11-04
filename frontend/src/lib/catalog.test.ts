import { findDestination } from './catalog';

describe('findDestination', () => {
    it('retrouve une destination par son nom exact', () => {
        expect(findDestination('Lisbonne')?.id).toBe('t2');
    });

    it('retrouve une destination par une ville que cite le copilote', () => {
        expect(findDestination('Reykjavik')?.id).toBe('c2');
        expect(findDestination('Tokyo')?.id).toBe('c1');
        expect(findDestination('Bora Bora')?.id).toBe('l2');
    });

    it('ignore les accents et la casse', () => {
        expect(findDestination('hanoi')?.id).toBe('b4');
        expect(findDestination('MEDELLIN')?.id).toBe('t4');
    });

    it("ne rattache pas une ville hors catalogue", () => {
        expect(findDestination('Tromsø')).toBeUndefined();
        expect(findDestination('Ljubljana')).toBeUndefined();
    });
});
