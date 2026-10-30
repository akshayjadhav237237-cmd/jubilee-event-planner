import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEMO_SCENARIOS } from '../../src/data/demoScenarios';
import { CATEGORIES } from '../../src/data/categories';
import { BUDGET_PRESETS } from '../../src/data/budgetPresets';
import { ALL_TASKS } from '../../src/data/tasks';
import { ALL_VENDOR_GUIDES } from '../../src/data/vendors';
import { ALL_IDEAS } from '../../src/data/ideas';
import { ALL_ADAPTATION_RULES } from '../../src/domain/adaptations/rules';
import { AI_DISCLOSURE_FIELDS, AI_WITHHELD_FIELDS } from '../../src/ai/disclosure';

/** Recursively counts test files within a given directory. */
function countTestFiles(dir: string): number {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countTestFiles(fullPath);
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.test.ts') || entry.name.endsWith('.test.tsx'))
    ) {
      count += 1;
    }
  }
  return count;
}

describe('README Facts and Architectural Documentation Assertions', () => {
  const rootDir = process.cwd();
  const readmePath = path.resolve(rootDir, 'README.md');
  const readme = fs.readFileSync(readmePath, 'utf-8');

  it('validates the five required top-level headings in exact sequential order', () => {
    const headingOrder = [
      '# Jubilee - GenAI Celebration & Event Planner',
      '## 1. Chosen Vertical and Persona',
      '## 2. Approach and Logic',
      '## 3. How the Solution Works',
      '## 4. Assumptions Made',
      '## 5. Evaluation Focus',
    ];

    let lastIndex = -1;
    for (const heading of headingOrder) {
      const idx = readme.indexOf(heading);
      expect(idx).toBeGreaterThan(-1);
      expect(idx).toBeGreaterThan(lastIndex);
      lastIndex = idx;
    }
  });

  it('verifies critical links, license declaration, and quick start instructions', () => {
    expect(readme).toContain(
      'Live demo: https://akshayjadhav237237-cmd.github.io/jubilee-event-planner/',
    );
    expect(readme).toContain('License: MIT');
    expect(readme).toContain('npm ci');
    expect(readme).toContain('npm run dev');
    expect(readme).toContain('npm run check');
  });

  it('verifies Mermaid architecture diagram, layer rules, and command pattern', () => {
    expect(readme).toContain('```mermaid');
    expect(readme).toContain('flowchart TD');
    const layers = [
      'src/domain',
      'src/data',
      'src/ai',
      'src/state',
      'src/features',
      'src/shared',
      'src/app',
    ];
    for (const layer of layers) {
      expect(readme).toContain(layer);
    }
    expect(readme).toContain('Command');
    expect(readme).toContain('execute()');
    expect(readme).toContain('undo()');
  });

  it('verifies privacy table contains all disclosure and withheld fields from code', () => {
    for (const field of AI_DISCLOSURE_FIELDS) {
      expect(readme).toContain(`\`${field}\``);
    }
    for (const field of AI_WITHHELD_FIELDS) {
      expect(readme).toContain(`\`${field}\``);
    }
    expect(readme).toContain('Disclosed');
    expect(readme).toContain('Withheld');
  });

  it('verifies all eleven npm package scripts are documented in scripts table', () => {
    const pkgPath = path.resolve(rootDir, 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as {
      scripts?: Record<string, string>;
    };
    const scripts = Object.keys(pkgJson.scripts ?? {});
    expect(scripts.length).toBe(11);
    for (const scriptName of scripts) {
      expect(readme).toContain(`\`${scriptName}\``);
    }
  });

  it('verifies documented test categories and required limitations', () => {
    const testCategories = [
      'Unit Tests',
      'Integration Tests',
      'Axe Accessibility Tests',
      'Round-Trip Persistence Tests',
      'Formula Injection Tests',
    ];
    for (const cat of testCategories) {
      expect(readme).toContain(cat);
    }

    const limitations = [
      'heuristic floors are planning baselines not vendor commitments',
      'fully client-side operation',
      'GitHub Pages cannot emit HTTP response headers so CSP is enforced via build-time HTML meta tag',
      'search engines read robots.txt only at domain root',
    ];
    for (const limitation of limitations) {
      expect(readme).toContain(limitation);
    }
  });

  it('verifies exact numbers and catalog metrics match live source code constants', () => {
    const testFileCount = countTestFiles(path.resolve(rootDir, 'tests'));
    expect(testFileCount).toBe(78);
    expect(readme).toContain(`**${testFileCount}** automated test suites`);

    expect(readme).toContain(`**${DEMO_SCENARIOS.length}** pre-loaded demo scenarios`);
    expect(readme).toContain(`**${Object.keys(BUDGET_PRESETS).length}** budget presets`);
    expect(readme).toContain(`**${CATEGORIES.length}** canonical budget categories`);
    expect(readme).toContain(`**${ALL_TASKS.length}** task templates`);
    expect(readme).toContain(`**${ALL_VENDOR_GUIDES.length}** vendor negotiation playbooks`);
    expect(readme).toContain(`**${ALL_IDEAS.length}** curated celebration ideas`);
    expect(readme).toContain(`**${ALL_ADAPTATION_RULES.length}** adaptation heuristics`);
    expect(readme).toContain(`**${AI_DISCLOSURE_FIELDS.length}** AI disclosure fields`);
    expect(readme).toContain(`**${AI_WITHHELD_FIELDS.length}** AI withheld privacy fields`);
  });
});
