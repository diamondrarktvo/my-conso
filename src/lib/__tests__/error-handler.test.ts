import { classifyError, parseStackTrace } from '../error-handler';

jest.mock('i18next', () => ({
   __esModule: true,
   default: { t: (key: string) => key, exists: () => true },
}));

describe('classifyError', () => {
   it('handles plain errors', () => {
      const result = classifyError(new Error('boom'));
      expect(result.devInfo.originalMessage).toBe('boom');
      expect(result.canRetry).toBe(false);
   });

   it('handles non-error throws', () => {
      const result = classifyError('a string');
      expect(result.devInfo.errorClass).toBe('UnknownError');
      expect(result.canRetry).toBe(false);
   });
});

describe('parseStackTrace', () => {
   it('parses a Hermes frame', () => {
      const stack = 'Error: x\n    at fetchUser (/app/src/features/user.ts:42:10)';
      expect(parseStackTrace(stack)).toEqual({
         method: 'fetchUser',
         file: 'user.ts',
         line: 42,
         column: 10,
      });
   });

   it('skips internal frames and returns undefined without a stack', () => {
      expect(parseStackTrace('at x (node_modules/lib/index.js:1:1)')).toBeUndefined();
      expect(parseStackTrace(undefined)).toBeUndefined();
   });
});
