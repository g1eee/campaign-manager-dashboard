// Feature: campaign-manager-dashboard, Property 13: Sections render with an empty-state placeholder and never crash on empty data
//
// Validates: Requirements 1.8, 7.12, 8.7, 9.7, 10.5
//
// Property 13: For any of the four section components supplied with an empty or
// missing data collection, the section renders its card-based container without
// throwing and displays an empty-state placeholder.
//
// Each of the four sections owns a distinct heading + placeholder string:
//   - CampaignInfoSection: heading "Informasi Campaign" / "Belum ada data campaign."
//   - AssetChannelSection: heading "Asset & Channel"   / "Belum ada data channel yang tersedia."
//   - WorkflowSection:     heading "Workflow Campaign"  / "Workflow steps are unavailable."
//   - SummarySection:      heading "Status & Ringkasan" / "Belum ada data ringkasan yang tersedia."
//
// The property drives each section with a small generated set of "empty-ish"
// collection forms (empty array, and where the prop type allows it, a missing
// value coerced via `?? []` inside the components). Combined with a randomized
// section-ordering wrapper this yields well over 100 iterations.
//
// Two example-based assertions complement the property (per the task):
//   - SummaryCard renders "-" and omits the trend note for a null primary value (Req 9.7)
//   - The four sections preserve A->B->C->D order when rendered together.

import { createElement } from 'react';
import type { ComponentType } from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import fc from 'fast-check';

import CampaignInfoSection from '@/components/dashboard/CampaignInfoSection';
import AssetChannelSection from '@/components/dashboard/AssetChannelSection';
import WorkflowSection from '@/components/dashboard/WorkflowSection';
import SummarySection from '@/components/dashboard/SummarySection';
import type { SummaryMetric } from '@/lib/types';

afterEach(cleanup);

const noop = () => {};

// A descriptor for each section: how to render it with a given empty collection
// (an array passed to its data prop) and the placeholder text it must show.
interface SectionDescriptor {
  key: 'A' | 'B' | 'C' | 'D';
  heading: string;
  placeholder: string;
  /** Renders the section element given a value for its data collection prop. */
  renderWith: (collection: unknown) => ReturnType<typeof createElement>;
}

const SECTIONS: SectionDescriptor[] = [
  {
    key: 'A',
    heading: 'Informasi Campaign',
    placeholder: 'Belum ada data campaign.',
    renderWith: (collection) =>
      createElement(CampaignInfoSection as ComponentType<any>, {
        rows: collection,
        approvalOptions: ['Pending', 'Approved', 'Rejected'],
        onRowChange: noop,
        onApproveChange: noop,
      }),
  },
  {
    key: 'B',
    heading: 'Asset & Channel',
    placeholder: 'Belum ada data channel yang tersedia.',
    renderWith: (collection) =>
      createElement(AssetChannelSection as ComponentType<any>, {
        channels: collection,
      }),
  },
  {
    key: 'C',
    heading: 'Workflow Campaign',
    placeholder: 'Workflow steps are unavailable.',
    renderWith: (collection) =>
      createElement(WorkflowSection as ComponentType<any>, {
        steps: collection,
      }),
  },
  {
    key: 'D',
    heading: 'Status & Ringkasan',
    placeholder: 'Belum ada data ringkasan yang tersedia.',
    renderWith: (collection) =>
      createElement(SummarySection as ComponentType<any>, {
        metrics: collection,
      }),
  },
];

// "Empty-ish" collection forms. Each section coerces a missing collection with
// `?? []`, so `undefined` and `null` are valid empty inputs alongside `[]`.
const emptyCollectionArb: fc.Arbitrary<unknown> = fc.constantFrom(
  [] as unknown[],
  undefined,
  null
);

describe('Property 13: Sections render an empty-state placeholder and never crash on empty data', () => {
  it('renders the card container + placeholder for each section on empty/missing data without throwing', () => {
    const sectionArb = fc.constantFrom(...SECTIONS);

    fc.assert(
      fc.property(sectionArb, emptyCollectionArb, (section, collection) => {
        let container: HTMLElement | undefined;

        // (a) Rendering with an empty/missing collection must not throw.
        expect(() => {
          const result = render(section.renderWith(collection));
          container = result.container;
        }).not.toThrow();

        // The card-based <section> container is present...
        const sectionEl = container!.querySelector('section');
        expect(sectionEl).not.toBeNull();
        // ...and the heading is rendered.
        expect(screen.getByText(section.heading)).toBeInTheDocument();

        // (b) The empty-state placeholder text is present.
        expect(screen.getByText(section.placeholder)).toBeInTheDocument();

        cleanup();
      }),
      { numRuns: 150 }
    );
  });

  it('preserves A->B->C->D section order when rendered together with empty data', () => {
    // Randomize the empty-collection form fed to each section while keeping the
    // render order fixed as A, B, C, D; the rendered heading order must match.
    fc.assert(
      fc.property(
        fc.array(emptyCollectionArb, { minLength: 4, maxLength: 4 }),
        ([a, b, c, d]) => {
          const { container } = render(
            createElement(
              'div',
              null,
              SECTIONS[0].renderWith(a),
              SECTIONS[1].renderWith(b),
              SECTIONS[2].renderWith(c),
              SECTIONS[3].renderWith(d)
            )
          );

          const headingEls = SECTIONS.map((s) => screen.getByText(s.heading));

          // Each heading follows the previous one in document order.
          for (let i = 1; i < headingEls.length; i += 1) {
            const relation = headingEls[i - 1].compareDocumentPosition(
              headingEls[i]
            );
            expect(relation & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
          }

          // All four placeholders are present simultaneously.
          for (const s of SECTIONS) {
            expect(screen.getByText(s.placeholder)).toBeInTheDocument();
          }

          cleanup();
        }
      ),
      { numRuns: 60 }
    );
  });

  // ---- Example-based complements (per task) ----

  it('SummaryCard renders "-" and omits the trend note for a null primary value (Req 9.7)', () => {
    const metrics: SummaryMetric[] = [
      {
        id: 'with-value',
        label: 'Total Campaign',
        icon: 'layers',
        value: 128,
        format: 'number',
        trend: { change: 12, period: 'dari bulan lalu' },
      },
      {
        id: 'no-value',
        label: 'Budget Terpakai',
        icon: 'wallet',
        value: null,
        format: 'rupiah',
        trend: { change: 15, period: 'periode rahasia' },
      },
    ];

    render(createElement(SummarySection, { metrics }));

    const nullCard = within(
      screen.getByText('Budget Terpakai').closest('div.rounded-lg') as HTMLElement
    );
    // Placeholder "-" is shown for the missing primary number.
    expect(nullCard.getByText('-')).toBeInTheDocument();
    // The trend note is omitted for the null-value card.
    expect(nullCard.queryByText('periode rahasia')).not.toBeInTheDocument();

    // A card with a value still renders its trend note.
    const valueCard = within(
      screen.getByText('Total Campaign').closest('div.rounded-lg') as HTMLElement
    );
    expect(valueCard.getByText('dari bulan lalu')).toBeInTheDocument();
  });

  it('renders the four sections together in A->B->C->D order (fixed example)', () => {
    render(
      createElement(
        'div',
        null,
        SECTIONS[0].renderWith([]),
        SECTIONS[1].renderWith([]),
        SECTIONS[2].renderWith([]),
        SECTIONS[3].renderWith([])
      )
    );

    const order = ['Informasi Campaign', 'Asset & Channel', 'Workflow Campaign', 'Status & Ringkasan'];
    const headingEls = order.map((h) => screen.getByText(h));
    for (let i = 1; i < headingEls.length; i += 1) {
      const relation = headingEls[i - 1].compareDocumentPosition(headingEls[i]);
      expect(relation & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });
});
