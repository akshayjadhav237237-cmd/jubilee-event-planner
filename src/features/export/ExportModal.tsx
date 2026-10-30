import type { JSX } from 'react';
import type { Plan } from '../../domain/types';
import {
  generateBudgetCsv,
  generateExportFilename,
  generateMarkdownBrief,
  generateTimelineIcs,
  triggerBrowserDownload,
} from '../../export';
import { Dialog } from '../../shared/ui/Dialog';
import { Button } from '../../shared/ui/Button';
import { exportPlanToJson } from '../../state/persistence';

export interface ExportModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly plan: Plan;
}

interface ExportRowProps {
  readonly title: string;
  readonly description: string;
  readonly actionLabel: string;
  readonly onClick: () => void;
}

function ExportRow({ title, description, actionLabel, onClick }: ExportRowProps): JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-stone-200 bg-stone-50/60 hover:bg-stone-50 transition-colors">
      <div className="space-y-0.5">
        <h3 className="text-sm font-semibold text-ink-text">{title}</h3>
        <p className="text-xs text-stone-600">{description}</p>
      </div>
      <Button
        variant="secondary"
        onClick={onClick}
        className="shrink-0 text-xs py-1.5 px-3 self-start sm:self-auto"
      >
        {actionLabel}
      </Button>
    </div>
  );
}

/** Modal dialog presenting celebration plan export formats including Markdown, CSV, ICS, JSON, and print. */
export function ExportModal({ isOpen, onClose, plan }: ExportModalProps): JSX.Element {
  const { brief, budget, timeline } = plan;

  const handleDownloadMarkdown = (): void => {
    const content = generateMarkdownBrief(plan);
    const filename = generateExportFilename(brief.title, brief.eventDate, 'md');
    triggerBrowserDownload(content, filename, 'text/markdown;charset=utf-8');
  };

  const handleDownloadCsv = (): void => {
    const content = generateBudgetCsv(budget, brief.currency);
    const filename = generateExportFilename(brief.title, brief.eventDate, 'csv');
    triggerBrowserDownload(content, filename, 'text/csv;charset=utf-8');
  };

  const handleDownloadIcs = (): void => {
    const content = generateTimelineIcs(timeline, brief.title);
    const filename = generateExportFilename(brief.title, brief.eventDate, 'ics');
    triggerBrowserDownload(content, filename, 'text/calendar;charset=utf-8');
  };

  const handleDownloadJson = (): void => {
    const content = exportPlanToJson(plan);
    const filename = generateExportFilename(brief.title, brief.eventDate, 'json');
    triggerBrowserDownload(content, filename, 'application/json;charset=utf-8');
  };

  const handlePrint = (): void => {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} title="Export Celebration Plan" id="export-modal">
      <div className="space-y-3">
        <p className="text-xs text-stone-600 pb-1">
          Select an export format to save your celebration plan or import milestones into your
          calendar.
        </p>

        <ExportRow
          title="Markdown Brief (.md)"
          description="Comprehensive human-readable summary of all 4 pillars and adaptations."
          actionLabel="Download .md"
          onClick={handleDownloadMarkdown}
        />

        <ExportRow
          title="Budget Spreadsheet (.csv)"
          description="Excel and Google Sheets compatible sheet with allocations, spend, and weights."
          actionLabel="Download .csv"
          onClick={handleDownloadCsv}
        />

        <ExportRow
          title="Timeline Calendar (.ics)"
          description="Standard iCalendar file with milestone countdowns and task deadlines."
          actionLabel="Download .ics"
          onClick={handleDownloadIcs}
        />

        <ExportRow
          title="JSON Backup (.json)"
          description="Portable backup payload that can be restored on another device or browser."
          actionLabel="Download .json"
          onClick={handleDownloadJson}
        />

        <ExportRow
          title="Print / Save PDF"
          description="Opens standard browser print dialog for printing or generating clean PDF documents."
          actionLabel="Print / PDF"
          onClick={handlePrint}
        />

        <div className="flex justify-end pt-3 border-t border-stone-200">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
