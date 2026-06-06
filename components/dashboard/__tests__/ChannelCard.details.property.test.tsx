// Feature: campaign-manager-dashboard, Property 12: Channel card renders every detail with placeholder substitution
//
// Validates: Requirements 7.11, 7.12
//
// Property 12: For any channel with an arbitrary list of detail label/value
// pairs, the rendered Channel_Card contains every detail label, and for each
// detail displays its value when present (non-empty) or the "-" placeholder
// when the value is null, empty, or whitespace-only.

import { createElement } from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import ChannelCard from '@/components/dashboard/ChannelCard';
import type { Channel } from '@/lib/types';

afterEach(cleanup);

/** Expected on-screen text for a detail value, mirroring ChannelCard's rule. */
function expectedDisplay(value: string | null): string {
  if (value === null || value.trim() === '') {
    return '-';
  }
  return value;
}

describe('Property 12: Channel card renders every detail with placeholder substitution', () => {
  it('renders every detail label, showing the value when present or "-" for null/empty/whitespace', () => {
    fc.assert(
      fc.property(
        // Arbitrary list of details. Labels are prefixed with their index to
        // stay unique (so queries are unambiguous); values include null and
        // arbitrary strings (covering empty and whitespace-only cases).
        // Arrays are kept small (maxLength 8) for render performance.
        fc.array(
          fc.record({
            labelSuffix: fc.string(),
            value: fc.oneof(fc.constant(null), fc.string()),
          }),
          { maxLength: 8 }
        ),
        (rawDetails) => {
          const details = rawDetails.map((d, index) => ({
            label: `Label_${index}_${d.labelSuffix}`,
            value: d.value,
          }));

          const channel: Channel = {
            id: 'channel-under-test',
            name: 'Test Channel',
            icon: 'banner',
            details,
          };

          const { container } = render(createElement(ChannelCard, { channel }));

          const labelEls = container.querySelectorAll('dt');
          const valueEls = container.querySelectorAll('dd');

          // Every detail is rendered as exactly one label/value pair.
          expect(labelEls.length).toBe(details.length);
          expect(valueEls.length).toBe(details.length);

          details.forEach((detail, i) => {
            // The label text is present (Req 7.11).
            expect(labelEls[i].textContent).toBe(detail.label);
            // The value is shown when present, or "-" otherwise (Req 7.12).
            expect(valueEls[i].textContent).toBe(expectedDisplay(detail.value));
          });

          // Clean up between iterations to avoid DOM contamination.
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
