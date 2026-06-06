// Feature: campaign-manager-dashboard, Property 2: Rupiah input parsing keeps only digits
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { parseRupiahInput } from '@/lib/currency';

/**
 * Property 2: Rupiah input parsing keeps only digits
 * Validates: Requirements 4.6, 4.7
 *
 * Contract: parseRupiahInput keeps only the ASCII digit characters (0-9) of
 * the input, in order. It returns `null` when the input contains no digit
 * characters (including the empty string), otherwise Number(digits).
 *
 * The reference extracts digits independently via s.replace(/[^0-9]/g, '') and
 * compares. Both the implementation and the reference convert via Number(), so
 * the comparison stays exact even for very long digit runs.
 */
describe('Property 2: Rupiah input parsing keeps only digits', () => {
  // Reference implementation derived directly from the contract.
  const reference = (s: string): number | null => {
    const digits = s.replace(/[^0-9]/g, '');
    return digits.length === 0 ? null : Number(digits);
  };

  it('matches independent digit extraction for arbitrary strings', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        expect(parseRupiahInput(s)).toBe(reference(s));
      }),
      { numRuns: 300 }
    );
  });

  it('matches independent digit extraction for unicode/binary strings', () => {
    // fc.string() defaults to full-unicode code points in fast-check v4; the
    // 'binary' unit additionally exercises arbitrary 16-bit code units.
    fc.assert(
      fc.property(fc.string({ unit: 'binary' }), (s) => {
        expect(parseRupiahInput(s)).toBe(reference(s));
      }),
      { numRuns: 300 }
    );
  });

  it('keeps only digits for mixed digit/non-digit strings', () => {
    // Interleave digit runs with arbitrary non-digit noise so the generated
    // space is rich in the digits-only behaviour we care about.
    const noise = fc.string();
    // Bound the digit-run length so the exact decimal value stays within a
    // range we can reason about; comparison is still against Number(digits).
    const digitRun = fc
      .array(fc.integer({ min: 0, max: 9 }), { maxLength: 15 })
      .map((ns) => ns.join(''));

    const interleaved = fc
      .array(fc.tuple(noise, digitRun), { maxLength: 12 })
      .map((pairs) => pairs.map(([n, d]) => n + d).join(''));

    fc.assert(
      fc.property(interleaved, (s) => {
        const expectedDigits = s.replace(/[^0-9]/g, '');
        const result = parseRupiahInput(s);
        if (expectedDigits.length === 0) {
          expect(result).toBeNull();
        } else {
          expect(result).toBe(Number(expectedDigits));
        }
      }),
      { numRuns: 300 }
    );
  });

  it('returns null when the input has no digit characters', () => {
    // Strip any digits from arbitrary strings to guarantee a digit-free input.
    const nonDigitString = fc
      .string({ unit: 'binary' })
      .map((s) => s.replace(/[0-9]/g, ''));

    fc.assert(
      fc.property(nonDigitString, (s) => {
        expect(parseRupiahInput(s)).toBeNull();
      }),
      { numRuns: 200 }
    );
  });

  it('returns null for the empty string', () => {
    expect(parseRupiahInput('')).toBeNull();
  });
});
