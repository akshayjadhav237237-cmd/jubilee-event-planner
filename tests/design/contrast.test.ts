import { describe, expect, it } from 'vitest';

interface RgbColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

/** Parses a standard 6-character hex color code into RGB channel values. */
function parseHex(hex: string): RgbColor {
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/** Converts an 8-bit sRGB color channel into linear RGB space for luminance calculation. */
function channelToLinear(channel: number): number {
  const srgb = channel / 255;
  if (srgb <= 0.04045) {
    return srgb / 12.92;
  }
  return Math.pow((srgb + 0.055) / 1.055, 2.4);
}

/** Computes the WCAG 2.1 relative luminance for an sRGB hex color. */
function calculateLuminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  const linR = channelToLinear(r);
  const linG = channelToLinear(g);
  const linB = channelToLinear(b);
  return 0.2126 * linR + 0.7152 * linG + 0.0722 * linB;
}

/** Calculates the WCAG 2.1 contrast ratio between two hex colors. */
function calculateContrastRatio(hex1: string, hex2: string): number {
  const lum1 = calculateLuminance(hex1);
  const lum2 = calculateLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

const TOKENS = {
  paperBg: '#FAF7F2',
  inkText: '#1C1917',
  tealPrimary: '#005B5C',
  marigoldAccent: '#B45309',
  white: '#FFFFFF',
} as const;

describe('Design Token Contrast Ratios (WCAG 2.1 AA)', () => {
  it('guarantees ink-text on paper-bg satisfies AA normal text (>= 4.5:1)', () => {
    const ratio = calculateContrastRatio(TOKENS.inkText, TOKENS.paperBg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('guarantees white text on teal-primary satisfies AA normal text (>= 4.5:1)', () => {
    const ratio = calculateContrastRatio(TOKENS.white, TOKENS.tealPrimary);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('guarantees marigold-accent on paper-bg satisfies AA normal text (>= 4.5:1)', () => {
    const ratio = calculateContrastRatio(TOKENS.marigoldAccent, TOKENS.paperBg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('guarantees white text on marigold-accent satisfies AA normal text (>= 4.5:1)', () => {
    const ratio = calculateContrastRatio(TOKENS.white, TOKENS.marigoldAccent);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
