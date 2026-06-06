// Feature: campaign-manager-dashboard, Property 1: Rupiah formatting round-trip and grouping
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { formatRupiah } from '@/lib/currency';

/**
 * Property 1: Rupiah formatting round-trip and grouping
 *
 * For any integer amount n with -999,999,999,999 <= n <= 999,999,999,999:
 *   - the output contains the "Rp" marker
 *   - the digits of |n| are grouped into sets of three separated by periods
 *   - there is no decimal portion
 *   - a leading minus sign is present when n < 0 (before the "Rp" marker)
 *   - the digits extracted from the output (stripping non-digits) re-parse to |n|
 *
 * Validates: Requirements 4.5, 5.8, 5.9, 9.5
 */

const BOUND = 999_999_999_999;

/** Expected period-grouped digit string for a non-negative integer's absolute value. */
function expectedGrouping(absValue: number): string {
  return Math.abs(absValue)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function assertFormatRupiahProperty(n: number): void {
  const out = formatRupiah(n);
  const negative = n < 0;
  const abs = Math.abs(n);

  // Leading minus only for negative values; non-negative starts with "Rp".
  if (negative) {
    expect(out.startsWith('-')).toBe(true);
    expect(out.slice(1).startsWith('Rp')).toBe(true);
  } else {
    expect(out.startsWith('Rp')).toBe(true);
  }

  // Contains the "Rp" marker.
  expect(out.includes('Rp')).toBe(true);

  // No decimal portion (no comma or dot-followed-by-decimal separator usage).
  expect(out.includes(',')).toBe(false);

  // Digit grouping: portion after the "Rp" marker is correctly period-grouped.
  const afterMarker = out.slice(out.indexOf('Rp') + 2);
  expect(afterMarker).toBe(expectedGrouping(abs));

  // Round-trip: digits extracted from the output re-parse to |n|.
  const digitsOnly = out.replace(/[^0-9]/g, '');
  expect(Number(digitsOnly)).toBe(abs);
}

describe('formatRupiah — Property 1: round-trip and grouping', () => {
  it('formats any integer in range with grouping, sign, and digit round-trip', () => {
    fc.assert(
      fc.property(fc.integer({ min: -BOUND, max: BOUND }), (n) => {
        assertFormatRupiahProperty(n);
      }),
      { numRuns: 300 }
    );
  });

  it('holds at the explicit boundary and edge cases', () => {
    const boundaries = [-BOUND, -1, 0, 1, BOUND, 999, 1000, 1000000, -1234567];
    for (const n of boundaries) {
      assertFormatRupiahProperty(n);
    }

    // Spot-check exact formatting expectations.
    expect(formatRupiah(-1234567)).toBe('-Rp1.234.567');
    expect(formatRupiah(1234567)).toBe('Rp1.234.567');
    expect(formatRupiah(0)).toBe('Rp0');
    expect(formatRupiah(BOUND)).toBe('Rp999.999.999.999');
    expect(formatRupiah(-BOUND)).toBe('-Rp999.999.999.999');
  });
});
