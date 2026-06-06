// Feature: campaign-manager-dashboard, Property 5: Percentage formatting shape
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { formatPercent1 } from '@/lib/currency';

describe('formatPercent1 - Property 5: Percentage formatting shape', () => {
  // Validates: Requirements 9.6
  it('renders exactly one decimal place with a comma separator and "%" suffix, round-tripping the rounded value', () => {
    fc.assert(
      fc.property(
        fc.double({
          min: 0,
          max: 1_000_000_000,
          noNaN: true,
          noDefaultInfinity: true,
        }),
        (x) => {
          const out = formatPercent1(x);

          // Shape: one or more integer digits, a comma, exactly one decimal
          // digit, then a "%" suffix (e.g. "12,3%").
          expect(out).toMatch(/^\d+,\d%$/);

          // Re-parse the displayed value (comma -> dot, drop "%") and compare
          // it against x rounded to one decimal place.
          const reparsed = parseFloat(out.replace(',', '.').replace('%', ''));
          expect(reparsed).toBe(parseFloat(x.toFixed(1)));
        }
      ),
      { numRuns: 100 }
    );
  });
});
