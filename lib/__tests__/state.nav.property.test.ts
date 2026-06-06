// Feature: campaign-manager-dashboard, Property 8: Exactly one navigation item is active
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { selectNav } from '@/lib/dashboardState';

// Fixed set of valid navigation ids (mirrors the 9 sidebar Nav_Items, Req 2.2).
const NAV_IDS = [
  'dashboard',
  'tab-promo',
  'banner',
  'toko',
  'ig-story',
  'host-live',
  'ads-cpas',
  'timeline',
  'approval',
] as const;

const DEFAULT_ACTIVE = 'dashboard';

describe('selectNav — Property 8: Exactly one navigation item is active', () => {
  // Validates: Requirements 2.4, 2.5, 2.7
  it('folding any sequence of selections yields the most recently selected id, and the active state is always a single valid id', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...NAV_IDS)),
        (selections) => {
          let active: string = DEFAULT_ACTIVE;

          // Model "exactly one active" as a single id value. At every step the
          // active state is one and only one id, and it must remain valid.
          for (const next of selections) {
            active = selectNav(active, next);

            // Single-active invariant: the active state is one well-defined id.
            expect(typeof active).toBe('string');
            expect(NAV_IDS).toContain(active);
          }

          // After folding the full sequence, the active id equals the most
          // recently selected id (or the default when no selections occurred).
          const expected =
            selections.length === 0
              ? DEFAULT_ACTIVE
              : selections[selections.length - 1];
          expect(active).toBe(expected);
        },
      ),
      { numRuns: 200 },
    );
  });

  // Validates: Requirements 2.7
  it('selecting the currently-active id leaves the active id unchanged (no-op)', () => {
    fc.assert(
      fc.property(fc.constantFrom(...NAV_IDS), (id) => {
        expect(selectNav(id, id)).toBe(id);
      }),
      { numRuns: 100 },
    );
  });

  // Validates: Requirements 2.5
  it('selecting a different id makes that id the single active id', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...NAV_IDS),
        fc.constantFrom(...NAV_IDS),
        (current, next) => {
          expect(selectNav(current, next)).toBe(next);
        },
      ),
      { numRuns: 100 },
    );
  });
});
