import { cn } from '../tailwind';

describe('cn', () => {
   it('merges conflicting tailwind classes, last one wins', () => {
      expect(cn('p-2', 'p-4')).toBe('p-4');
   });

   it('ignores falsy values and supports conditionals', () => {
      expect(cn('text-sm', false && 'hidden', undefined, { 'font-bold': true })).toBe(
         'text-sm font-bold'
      );
   });
});
