import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IsoDate } from '../../../src/domain/dates';
import type { Plan } from '../../../src/domain/types';
import { exportPlanToJson } from '../../../src/state/persistence';
import { RestoreModal } from '../../../src/features/export/RestoreModal';

const VALID_PLAN: Plan = {
  id: 'valid-plan-id',
  brief: {
    title: 'Ananya & Rohan Celebration',
    eventType: 'wedding',
    subFormat: 'traditional',
    guestCount: 150,
    totalBudget: 250000000,
    currency: 'INR',
    eventDate: '2027-11-20' as IsoDate,
    setting: 'indoor',
    flags: {
      kids: true,
      elders: true,
      dietary: true,
      accessibility: true,
      openBar: true,
      amplifiedMusic: true,
      surprise: false,
    },
    top3Priorities: ['Venue', 'Catering', 'Photography'],
  },
  budget: {
    totalBudget: 250000000,
    contingencyRate: 10,
    categories: [
      { id: 'venue', name: 'Venue & Facilities', allocated: 100000000, spent: 0, weight: 40 },
    ],
  },
  timeline: [],
  vendorChecklist: [],
  quotes: [],
  ideas: [],
  createdAt: '2026-10-30' as IsoDate,
  updatedAt: '2026-10-30' as IsoDate,
};

describe('RestoreModal component', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.open = true;
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.open = false;
    });
  });

  it('renders title, file input, textarea, and action buttons', () => {
    render(<RestoreModal isOpen={true} onClose={vi.fn()} onRestore={vi.fn()} />);

    expect(screen.getByRole('dialog', { name: 'Restore Plan from Backup' })).toBeInTheDocument();
    expect(screen.getByLabelText('Upload Backup File (.json)')).toBeInTheDocument();
    expect(screen.getByLabelText('Or Paste Raw Backup JSON')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Restore Plan' })).toBeInTheDocument();
  });

  it('restores plan when pasting valid JSON and clicking Restore Plan', async () => {
    const user = userEvent.setup();
    const handleRestore = vi.fn();
    const handleClose = vi.fn();
    const validJson = exportPlanToJson(VALID_PLAN);

    render(<RestoreModal isOpen={true} onClose={handleClose} onRestore={handleRestore} />);

    const textarea = screen.getByLabelText('Or Paste Raw Backup JSON');
    fireEvent.change(textarea, { target: { value: validJson } });

    await user.click(screen.getByRole('button', { name: 'Restore Plan' }));

    expect(handleRestore).toHaveBeenCalledWith(expect.objectContaining({ id: 'valid-plan-id' }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('displays error alert when invalid JSON is submitted', async () => {
    const user = userEvent.setup();
    const handleRestore = vi.fn();
    const handleClose = vi.fn();

    render(<RestoreModal isOpen={true} onClose={handleClose} onRestore={handleRestore} />);

    const textarea = screen.getByLabelText('Or Paste Raw Backup JSON');
    fireEvent.change(textarea, { target: { value: 'not-json' } });

    await user.click(screen.getByRole('button', { name: 'Restore Plan' }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(handleRestore).not.toHaveBeenCalled();
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('restores plan when uploading a valid JSON file', async () => {
    const user = userEvent.setup();
    const handleRestore = vi.fn();
    const handleClose = vi.fn();
    const validJson = exportPlanToJson(VALID_PLAN);

    render(<RestoreModal isOpen={true} onClose={handleClose} onRestore={handleRestore} />);

    const file = new File([validJson], 'backup.json', { type: 'application/json' });
    const input = screen.getByLabelText('Upload Backup File (.json)');

    await user.upload(input, file);

    await vi.waitFor(() => {
      expect(handleRestore).toHaveBeenCalledWith(expect.objectContaining({ id: 'valid-plan-id' }));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  it('passes axe accessibility checks without violations', async () => {
    const { container } = render(
      <RestoreModal isOpen={true} onClose={vi.fn()} onRestore={vi.fn()} />,
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
