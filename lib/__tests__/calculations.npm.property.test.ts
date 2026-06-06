// Feature: campaign-manager-dashboard, Property 4: NPM formula with zero-guard
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { computeNpm, formatNpm } from '@/lib/calculations';

// Finite, bounded margin values (including negatives).
const marginArb = fc.double({
  min: -1_000_000_000,
  max: 1_000_000_000,
  noNaN: true,
  noDefaultInfinity: true,
});

// Strictly-positive, finite hargaJual values that exercise the normal branch.
const positiveHargaJualArb = fc.double({
  min: 0.01,
  max: 1_000_000_000,
  noNaN: true,
  noDefaultInfinity: true,
});

// "Guard" hargaJual values for which both functions must short-circuit:
// 0, null, non-finite numbers, and negative numbers (hargaJual <= 0).
const guardHargaJualArb = fc.oneof(
  fc.constant(0),
  fc.constant(null),
  fc.constant(Number.POSITIVE_INFINITY),
  fc.constant(Number.NEGATIVE_INFINITY),
  fc.constant(Number.NaN),
  fc.double({ min: -1_000_000_000, max: 0, noNaN: true, noDefaultInfinity: true })
);

describe('computeNpm / formatNpm - Property 4: NPM formula with zero-guard', () => {
  // Validates: Requirements 5.5, 5.7
  it('computes (margin/hargaJual)*100 rounded to 2 dp with a "%" suffix when hargaJual > 0', () => {
    fc.assert(
      fc.property(marginArb, positiveHargaJualArb, (margin, hargaJual) => {
        const expectedRounded =
          Math.round(((margin / hargaJual) * 100) * 100) / 100;

        expect(computeNpm(margin, hargaJual)).toBe(expectedRounded);
        expect(formatNpm(margin, hargaJual)).toBe(`${expectedRounded}%`);
      }),
      { numRuns: 200 }
    );
  });

  // Validates: Requirements 5.7
  it('short-circuits to 0 / "0%" when hargaJual is 0, null, negative, or non-finite', () => {
    fc.assert(
      fc.property(marginArb, guardHargaJualArb, (margin, hargaJual) => {
        expect(computeNpm(margin, hargaJual as number | null)).toBe(0);
        expect(formatNpm(margin, hargaJual as number | null)).toBe('0%');
      }),
      { numRuns: 200 }
    );
  });
});
