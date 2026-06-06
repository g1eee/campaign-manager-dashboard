// Feature: campaign-manager-dashboard, Property 6: Search keyword clamping
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { clampSearch } from '@/lib/currency';

const MAX_SEARCH_LENGTH = 100;

describe('clampSearch — Property 6: Search keyword clamping', () => {
  // Validates: Requirements 3.9, 3.10
  it('returns the first min(length, 100) characters and never exceeds 100', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 250 }), (s) => {
        const result = clampSearch(s);
        expect(result.length).toBe(Math.min(s.length, MAX_SEARCH_LENGTH));
        expect(result).toBe(s.slice(0, MAX_SEARCH_LENGTH));
        expect(result.length).toBeLessThanOrEqual(MAX_SEARCH_LENGTH);
      }),
      { numRuns: 300 }
    );
  });

  // Validates: Requirements 3.9, 3.10
  it('clamps explicitly long strings (length > 100) to exactly 100 characters', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 101, max: 1000 }),
        fc.string({ minLength: 1, maxLength: 1 }),
        (len, ch) => {
          const long = ch.repeat(len);
          const result = clampSearch(long);
          expect(result.length).toBe(MAX_SEARCH_LENGTH);
          expect(result).toBe(long.slice(0, MAX_SEARCH_LENGTH));
        }
      ),
      { numRuns: 100 }
    );
  });

  // Validates: Requirements 3.9, 3.10
  it('leaves strings within the limit unchanged', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: MAX_SEARCH_LENGTH }), (s) => {
        expect(clampSearch(s)).toBe(s);
      }),
      { numRuns: 100 }
    );
  });
});
