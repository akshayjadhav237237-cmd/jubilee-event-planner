import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IsoDate } from '../../../src/domain/dates';
import type { Plan } from '../../../src/domain/types';
import * as exportModule from '../../../src/export';
import { ExportModal } from '../../../src/features/export/ExportModal';

const MOCK_PLAN: Plan = {
  id: 'test-export-plan',
  brief: {
    title: 'Ananya & Rohan Wedding',
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
      {
        id: 'venue',
        name: 'Venue & Facilities',
        allocated: 100000000,
        spent: 20000000,
        weight: 40,
      },
    ],
  },
  timeline: [
    {
      id: 'task-1',
      title: 'Book Venue',
      dueDate: '2027-01-01' as IsoDate,
      completed: true,
      category: 'Venue & Facilities',
      dependencies: [],
    },
  ],
  vendorChecklist: [],
  quotes: [],
  ideas: [],
  createdAt: '2026-10-30' as IsoDate,
  updatedAt: '2026-10-30' as IsoDate,
};

describe('ExportModal component', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.open = true;
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.open = false;
    });
    window.print = vi.fn();
  });

  it('renders all export options and dialog heading', () => {
    render(<ExportModal isOpen={true} onClose={vi.fn()} plan={MOCK_PLAN} />);

    expect(screen.getByRole('dialog', { name: 'Export Celebration Plan' })).toBeInTheDocument();
    expect(screen.getByText('Markdown Brief (.md)')).toBeInTheDocument();
    expect(screen.getByText('Budget Spreadsheet (.csv)')).toBeInTheDocument();
    expect(screen.getByText('Timeline Calendar (.ics)')).toBeInTheDocument();
    expect(screen.getByText('JSON Backup (.json)')).toBeInTheDocument();
    expect(screen.getByText('Print / Save PDF')).toBeInTheDocument();
  });

  it('triggers browser download for Markdown brief', async () => {
    const user = userEvent.setup();
    const downloadSpy = vi
      .spyOn(exportModule, 'triggerBrowserDownload')
      .mockImplementation(() => {});

    render(<ExportModal isOpen={true} onClose={vi.fn()} plan={MOCK_PLAN} />);

    await user.click(screen.getByRole('button', { name: 'Download .md' }));
    expect(downloadSpy).toHaveBeenCalledWith(
      expect.stringContaining('# Ananya & Rohan Wedding'),
      expect.stringMatching(/\.md$/),
      'text/markdown;charset=utf-8',
    );
    downloadSpy.mockRestore();
  });

  it('triggers browser download for CSV budget', async () => {
    const user = userEvent.setup();
    const downloadSpy = vi
      .spyOn(exportModule, 'triggerBrowserDownload')
      .mockImplementation(() => {});

    render(<ExportModal isOpen={true} onClose={vi.fn()} plan={MOCK_PLAN} />);

    await user.click(screen.getByRole('button', { name: 'Download .csv' }));
    expect(downloadSpy).toHaveBeenCalledWith(
      expect.stringContaining('Category,Allocated,Spent,Remaining,Weight (%)'),
      expect.stringMatching(/\.csv$/),
      'text/csv;charset=utf-8',
    );
    downloadSpy.mockRestore();
  });

  it('triggers browser download for ICS timeline', async () => {
    const user = userEvent.setup();
    const downloadSpy = vi
      .spyOn(exportModule, 'triggerBrowserDownload')
      .mockImplementation(() => {});

    render(<ExportModal isOpen={true} onClose={vi.fn()} plan={MOCK_PLAN} />);

    await user.click(screen.getByRole('button', { name: 'Download .ics' }));
    expect(downloadSpy).toHaveBeenCalledWith(
      expect.stringContaining('BEGIN:VCALENDAR'),
      expect.stringMatching(/\.ics$/),
      'text/calendar;charset=utf-8',
    );
    downloadSpy.mockRestore();
  });

  it('triggers browser download for JSON backup', async () => {
    const user = userEvent.setup();
    const downloadSpy = vi
      .spyOn(exportModule, 'triggerBrowserDownload')
      .mockImplementation(() => {});

    render(<ExportModal isOpen={true} onClose={vi.fn()} plan={MOCK_PLAN} />);

    await user.click(screen.getByRole('button', { name: 'Download .json' }));
    expect(downloadSpy).toHaveBeenCalledWith(
      expect.stringContaining('"schemaVersion": 2'),
      expect.stringMatching(/\.json$/),
      'application/json;charset=utf-8',
    );
    downloadSpy.mockRestore();
  });

  it('calls window.print when Print / PDF button is clicked', async () => {
    const user = userEvent.setup();
    render(<ExportModal isOpen={true} onClose={vi.fn()} plan={MOCK_PLAN} />);

    await user.click(screen.getByRole('button', { name: 'Print / PDF' }));
    expect(window.print).toHaveBeenCalledTimes(1);
  });

  it('passes axe accessibility checks without violations', async () => {
    const { container } = render(<ExportModal isOpen={true} onClose={vi.fn()} plan={MOCK_PLAN} />);

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
