import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WorkflowSection from '@/components/dashboard/WorkflowSection';
import { getWorkflowSteps } from '@/lib/mockData';

// Example/render tests for Workflow_Section (Section C).
// _Requirements: 8.1, 8.2, 8.3, 8.6, 8.7_

// The 7 workflow step names, in their required 1->7 order (Req 8.2, 8.3).
const EXPECTED_STEP_NAMES = [
  'Brief Campaign',
  'Siapkan Asset',
  'Jadwalkan Post',
  'Tayang di Channel',
  'Monitor Biaya',
  'Hitung Margin & NPM',
  'Approve/Evaluasi',
];

describe('WorkflowSection', () => {
  it('renders the section title "Workflow Campaign" (Req 8.1)', () => {
    render(<WorkflowSection steps={getWorkflowSteps()} />);

    expect(
      screen.getByRole('heading', { name: 'Workflow Campaign' }),
    ).toBeInTheDocument();
  });

  it('uses the real Mock_Data with exactly 7 steps', () => {
    const steps = getWorkflowSteps();
    expect(steps).toHaveLength(7);
    expect(steps.map((s) => s.name)).toEqual(EXPECTED_STEP_NAMES);
  });

  it('renders all 7 step names (Req 8.2)', () => {
    render(<WorkflowSection steps={getWorkflowSteps()} />);

    for (const name of EXPECTED_STEP_NAMES) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it('renders the 7 step names in 1->7 document order (Req 8.3)', () => {
    const { container } = render(<WorkflowSection steps={getWorkflowSteps()} />);

    const text = container.textContent ?? '';
    const indices = EXPECTED_STEP_NAMES.map((name) => text.indexOf(name));

    for (const idx of indices) {
      expect(idx).toBeGreaterThanOrEqual(0);
    }
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]).toBeGreaterThan(indices[i - 1]);
    }
  });

  it('renders a horizontal scroll container (Req 8.6)', () => {
    const { container } = render(<WorkflowSection steps={getWorkflowSteps()} />);

    expect(container.querySelector('.overflow-x-auto')).not.toBeNull();
  });

  it('shows the unavailable message and no scroll track when steps are empty (Req 8.7)', () => {
    const { container } = render(<WorkflowSection steps={[]} />);

    // Title still renders.
    expect(
      screen.getByRole('heading', { name: 'Workflow Campaign' }),
    ).toBeInTheDocument();

    // Unavailable message shown instead of a partial/empty row.
    expect(
      screen.getByText('Workflow steps are unavailable.'),
    ).toBeInTheDocument();

    // No horizontal scroll container is rendered in the empty state.
    expect(container.querySelector('.overflow-x-auto')).toBeNull();
    expect(screen.queryByText('Brief Campaign')).not.toBeInTheDocument();
  });
});
