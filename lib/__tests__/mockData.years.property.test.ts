// Feature: campaign-manager-dashboard, Property 7: Year options are distinct, ascending, and default to the most recent
//
// Validates: Requirements 3.4, 3.5, 3.6
//
// Property 7: For any array of year numbers (in any order, possibly containing
// duplicates or empty), `distinctSortedYears` returns a strictly ascending array
// containing exactly the distinct values of the input; and when the input is
// non-empty the default selected year (`getMostRecentYearFrom`) equals the
// maximum value, while an empty input yields an empty option list with no error.

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { distinctSortedYears, getMostRecentYearFrom } from '@/lib/mockData';

describe('Property 7: Year options are distinct, ascending, and default to the most recent', () => {
  it('returns a strictly ascending, duplicate-free list of exactly the distinct input values; default = max (empty -> empty, no error)', () => {
    fc.assert(
      fc.property(
        // Integer-array generator including duplicates and empty arrays (years).
        fc.array(fc.integer({ min: -10000, max: 10000 })),
        (years) => {
          const result = distinctSortedYears(years);
          const expectedDistinct = Array.from(new Set(years));

          // Contains exactly the distinct input values (same set, same count).
          expect(result.length).toBe(expectedDistinct.length);
          expect(new Set(result)).toEqual(new Set(expectedDistinct));

          // Strictly ascending: every element is greater than its predecessor.
          for (let i = 1; i < result.length; i++) {
            expect(result[i]).toBeGreaterThan(result[i - 1]);
          }

          // Default selected year equals the maximum for non-empty input;
          // empty input yields an empty list and a null default (no error).
          const mostRecent = getMostRecentYearFrom(years);
          if (years.length === 0) {
            expect(result).toEqual([]);
            expect(mostRecent).toBeNull();
          } else {
            expect(mostRecent).toBe(Math.max(...years));
            expect(mostRecent).toBe(result[result.length - 1]);
          }
        }
      ),
      { numRuns: 200 }
    );
  });
});
