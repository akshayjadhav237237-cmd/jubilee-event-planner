import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Print Stylesheet Rules', () => {
  it('defines required media print rules hiding dialogs and chrome while showing print brief', () => {
    const cssPath = path.resolve(process.cwd(), 'src/index.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    expect(css).toContain('@media print');

    // Extract print block
    const printBlockMatch = css.match(/@media print\s*\{([\s\S]*?)\n\}/);
    expect(printBlockMatch).not.toBeNull();
    const printBlock = printBlockMatch?.[1] ?? '';

    // Verify dialog rule exists
    expect(printBlock).toContain('dialog');
    expect(printBlock).toContain('display: none !important');

    // Verify UI chrome elements hidden
    const normalizedBlock = printBlock.replace(/'/g, '"');
    expect(normalizedBlock).toContain('header');
    expect(normalizedBlock).toContain('footer');
    expect(normalizedBlock).toContain('button');
    expect(normalizedBlock).toContain('[role="banner"]');
    expect(normalizedBlock).toContain('[role="tablist"]');

    // Verify print brief is displayed in print
    expect(printBlock).toContain('.print-brief');
    expect(printBlock).toContain('display: block !important');
  });
});
