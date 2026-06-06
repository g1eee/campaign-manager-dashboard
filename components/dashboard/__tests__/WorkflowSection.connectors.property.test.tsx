// Feature: campaign-manager-dashboard, Property 11: Workflow connector count
//
// Validates: Requirements 8.4
//
// Property 11: For any non-empty list of N workflow steps, the Workflow_Section
// renders exactly N - 1 directional connectors, one between each pair of
// consecutive steps; and 0 connectors when the list is empty (where the section
// instead shows the "unavailable" message).
//
// Counting approach: WorkflowSection passes showConnector={index > 0} to each
// WorkflowStep, which renders the connector as a <span aria-hidden="true"> whose
// textContent is the directional arrow glyph "→". The numbered badge uses
// step.order (digits) and the name text is distinct, so filtering DOM elements
// by textContent === '→' counts connectors unambiguously.

import { createElement } from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import WorkflowSection from '@/components/dashboard/WorkflowSection';
import type { WorkflowStepModel } from '@/lib/types';

afterEach(cleanup);

const ARROW = '→';

/** Count rendered directional connectors: elements whose own text is the arrow. */
function countConnectors(container: HTMLElement): number {
  return Array.from(container.querySelectorAll('*')).filter(
    (el) => el.textContent === ARROW
  ).length;
}

describe('Property 11: Workflow connector count', () => {
  it('counting approach is correct on a fixed 3-step example (2 connectors)', () => {
    const steps: WorkflowStepModel[] = [
      { order: 1, name: 'Brief Campaign', icon: 'clipboard' },
      { order: 2, name: 'Siapkan Asset', icon: 'package' },
      { order: 3, name: 'Jadwalkan Post', icon: 'calendar-clock' },
    ];
    const { container } = render(createElement(WorkflowSection, { steps }));
    expect(countConnectors(container)).toBe(2);
  });

  it('renders exactly N-1 connectors for non-empty lists and 0 for empty', () => {
    // Step generator: arbitrary order/name/icon. Names are constrained so they
    // never equal the arrow glyph (string generators essentially never produce
    // a bare "→", but we filter defensively to keep counting unambiguous).
    const stepArb: fc.Arbitrary<WorkflowStepModel> = fc.record({
      order: fc.integer({ min: 1, max: 99 }),
      name: fc.string().filter((s) => s !== ARROW && !s.includes(ARROW)),
      icon: fc.constantFrom(
        'clipboard',
        'package',
        'calendar-clock',
        'send',
        'wallet',
        'calculator',
        'check-circle',
        'unknown-icon'
      ),
    });

    fc.assert(
      fc.property(fc.array(stepArb, { maxLength: 12 }), (steps) => {
        const { container } = render(createElement(WorkflowSection, { steps }));

        const expected = steps.length === 0 ? 0 : steps.length - 1;
        expect(countConnectors(container)).toBe(expected);

        cleanup();
      }),
      { numRuns: 200 }
    );
  });

  it('covers specific lengths 0, 1, 7, and a larger list', () => {
    const makeSteps = (n: number): WorkflowStepModel[] =>
      Array.from({ length: n }, (_, i) => ({
        order: i + 1,
        name: `Step ${i + 1}`,
        icon: 'clipboard',
      }));

    for (const n of [0, 1, 7, 12]) {
      const { container } = render(
        createElement(WorkflowSection, { steps: makeSteps(n) })
      );
      const expected = n === 0 ? 0 : n - 1;
      expect(countConnectors(container)).toBe(expected);
      cleanup();
    }
  });
});
