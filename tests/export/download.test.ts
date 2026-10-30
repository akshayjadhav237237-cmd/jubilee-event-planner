import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { triggerBrowserDownload } from '../../src/export/download';

describe('Browser Download Helper', () => {
  let createdUrl: string | null = null;
  let revokedUrl: string | null = null;
  let clickTriggered = false;
  let downloadedFilename = '';
  let appendedElement: HTMLElement | null = null;

  beforeEach(() => {
    createdUrl = null;
    revokedUrl = null;
    clickTriggered = false;
    downloadedFilename = '';
    appendedElement = null;

    vi.stubGlobal('URL', {
      createObjectURL: vi.fn((blob: Blob) => {
        createdUrl = `blob:http://localhost/${blob.size}`;
        return createdUrl;
      }),
      revokeObjectURL: vi.fn((url: string) => {
        revokedUrl = url;
      }),
    });

    const originalAppendChild = document.body.appendChild.bind(document.body);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      if (node instanceof HTMLAnchorElement) {
        appendedElement = node;
        downloadedFilename = node.download;
        node.click = () => {
          clickTriggered = true;
        };
      }
      return originalAppendChild(node);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates blob, appends anchor, triggers click, and cleans up URL', () => {
    const content = '# Jubilee Markdown Plan';
    const filename = 'jubilee-plan-2027.md';
    const mimeType = 'text/markdown';

    triggerBrowserDownload(content, filename, mimeType);

    expect(createdUrl).toBeTruthy();
    expect(clickTriggered).toBe(true);
    expect(downloadedFilename).toBe(filename);
    expect(revokedUrl).toBe(createdUrl);
    expect(document.body.contains(appendedElement)).toBe(false);
  });

  it('safely no-ops when URL.createObjectURL is undefined', () => {
    vi.stubGlobal('URL', {});

    expect(() => {
      triggerBrowserDownload('data', 'file.csv', 'text/csv');
    }).not.toThrow();
  });
});
