import type { BudgetState } from '../domain/types';

/** Sanitizes a CSV cell against formula injection and escapes delimiters and quotes. */
export function sanitizeCsvCell(value: string | number): string {
  const str = String(value);
  const neutralized = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  const needsQuotes =
    neutralized.includes(',') ||
    neutralized.includes('\n') ||
    neutralized.includes('\r') ||
    neutralized.includes('"');
  const escaped = neutralized.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function formatMajor(minor: number): string {
  return (minor / 100).toFixed(2);
}

function formatCsvRow(cells: readonly (string | number)[]): string {
  return cells.map(sanitizeCsvCell).join(',');
}

function buildSummaryRows(
  budget: BudgetState,
  totalSpentMinor: number,
  totalAllocatedMinor: number,
): readonly string[] {
  const totalMinor = budget.totalBudget;
  const contingencyMinor = Math.floor((totalMinor * budget.contingencyRate) / 100);
  const unspentMinor = Math.max(0, totalMinor - totalSpentMinor);

  return [
    formatCsvRow([
      'Total Budget',
      formatMajor(totalMinor),
      formatMajor(totalSpentMinor),
      formatMajor(totalMinor - totalSpentMinor),
      100,
    ]),
    formatCsvRow([
      'Contingency Reserve',
      formatMajor(contingencyMinor),
      formatMajor(0),
      formatMajor(contingencyMinor),
      budget.contingencyRate,
    ]),
    formatCsvRow([
      'Net Spend',
      formatMajor(totalAllocatedMinor),
      formatMajor(totalSpentMinor),
      formatMajor(totalAllocatedMinor - totalSpentMinor),
      '',
    ]),
    formatCsvRow(['Unspent', '', '', formatMajor(unspentMinor), '']),
  ];
}

/** Generates an RFC 4180 compliant CSV spreadsheet representing budget allocations and summary metrics. */
export function generateBudgetCsv(budget: BudgetState, currency: string): string {
  void currency;
  const header = formatCsvRow(['Category', 'Allocated', 'Spent', 'Remaining', 'Weight (%)']);
  const rows: string[] = [header];

  let totalSpentMinor = 0;
  let totalAllocatedMinor = 0;

  for (const cat of budget.categories) {
    totalSpentMinor += cat.spent;
    totalAllocatedMinor += cat.allocated;
    const remaining = cat.allocated - cat.spent;
    rows.push(
      formatCsvRow([
        cat.name,
        formatMajor(cat.allocated),
        formatMajor(cat.spent),
        formatMajor(remaining),
        cat.weight,
      ]),
    );
  }

  const summaryRows = buildSummaryRows(budget, totalSpentMinor, totalAllocatedMinor);
  rows.push(...summaryRows);

  return rows.join('\r\n');
}
