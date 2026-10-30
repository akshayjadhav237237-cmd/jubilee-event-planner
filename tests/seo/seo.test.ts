import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT_DIR = process.cwd();
const CANONICAL_URL = 'https://akshayjadhav237237-cmd.github.io/jubilee-event-planner/';
const SITEMAP_URL = `${CANONICAL_URL}sitemap.xml`;
const OG_IMAGE_URL = `${CANONICAL_URL}og-image.png`;

describe('SEO and Public Crawler Metadata', () => {
  const htmlPath = path.resolve(ROOT_DIR, 'index.html');
  const rawHtml = fs.readFileSync(htmlPath, 'utf-8');
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');

  it('enforces CSP meta tag as the very first child of head', () => {
    const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    expect(headMatch).not.toBeNull();
    const firstTagMatch = headMatch?.[1]
      ?.trim()
      .match(/^<meta[^>]+http-equiv=["']Content-Security-Policy["']/i);
    expect(firstTagMatch).not.toBeNull();

    const firstElement = doc.head.firstElementChild;
    expect(firstElement).not.toBeNull();
    expect(firstElement?.getAttribute('http-equiv')).toBe('Content-Security-Policy');
  });

  it('validates document title under 60 characters and non-empty', () => {
    const titleElement = doc.querySelector('title');
    expect(titleElement).not.toBeNull();
    const titleText = titleElement?.textContent?.trim() ?? '';
    expect(titleText.length).toBeGreaterThan(0);
    expect(titleText.length).toBeLessThan(60);
    expect(titleText).toContain('Jubilee');
  });

  it('validates meta description between 140 and 160 characters inclusive', () => {
    const descMeta = doc.querySelector('meta[name="description"]');
    expect(descMeta).not.toBeNull();
    const description = descMeta?.getAttribute('content') ?? '';
    expect(description.length).toBeGreaterThanOrEqual(140);
    expect(description.length).toBeLessThanOrEqual(160);
  });

  it('verifies canonical link and robots indexation directive', () => {
    const canonical = doc.querySelector('link[rel="canonical"]');
    expect(canonical).not.toBeNull();
    expect(canonical?.getAttribute('href')).toBe(CANONICAL_URL);

    const robots = doc.querySelector('meta[name="robots"]');
    expect(robots).not.toBeNull();
    expect(robots?.getAttribute('content')).toBe('index, follow');
  });

  it('verifies Open Graph and Twitter card tags with absolute URLs', () => {
    const ogProperties: Record<string, string> = {
      'og:type': 'website',
      'og:title': 'Jubilee - GenAI Celebration & Event Planner',
      'og:url': CANONICAL_URL,
      'og:image': OG_IMAGE_URL,
      'og:image:width': '1200',
      'og:image:height': '630',
    };

    for (const [prop, val] of Object.entries(ogProperties)) {
      const meta = doc.querySelector(`meta[property="${prop}"]`);
      expect(meta).not.toBeNull();
      expect(meta?.getAttribute('content')).toBe(val);
    }

    const twitterMeta: Record<string, string> = {
      'twitter:card': 'summary_large_image',
      'twitter:title': 'Jubilee - GenAI Celebration & Event Planner',
      'twitter:image': OG_IMAGE_URL,
    };

    for (const [name, val] of Object.entries(twitterMeta)) {
      const meta = doc.querySelector(`meta[name="${name}"]`);
      expect(meta).not.toBeNull();
      expect(meta?.getAttribute('content')).toBe(val);
    }
  });

  it('validates JSON-LD WebApplication schema without ratings or reviews', () => {
    const script = doc.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const text = script?.textContent?.trim() ?? '{}';
    const json = JSON.parse(text) as Record<string, unknown>;

    expect(json['@context']).toBe('https://schema.org');
    expect(json['@type']).toBe('WebApplication');
    expect(json['name']).toBe('Jubilee');
    expect(json['url']).toBe(CANONICAL_URL);
    expect(json['aggregateRating']).toBeUndefined();
    expect(json['review']).toBeUndefined();
  });

  it('verifies noscript and root fallback content exist', () => {
    const root = doc.getElementById('root');
    expect(root).not.toBeNull();
    const noscript = root?.querySelector('noscript');
    expect(noscript).not.toBeNull();
    expect(noscript?.textContent).toContain('Jubilee requires JavaScript');
    expect(root?.textContent).toContain('Jubilee empowers hosts to plan');
  });

  it('validates public/robots.txt and public/sitemap.xml configuration', () => {
    const robotsPath = path.resolve(ROOT_DIR, 'public', 'robots.txt');
    expect(fs.existsSync(robotsPath)).toBe(true);
    const robotsContent = fs.readFileSync(robotsPath, 'utf-8');
    expect(robotsContent).toContain('User-agent: *');
    expect(robotsContent).toContain('Allow: /');
    expect(robotsContent).toContain(`Sitemap: ${SITEMAP_URL}`);

    const sitemapPath = path.resolve(ROOT_DIR, 'public', 'sitemap.xml');
    expect(fs.existsSync(sitemapPath)).toBe(true);
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
    expect(sitemapContent).toContain(`<loc>${CANONICAL_URL}</loc>`);
  });

  it('validates public/og-image.png dimensions, chunk header, and size limit', () => {
    const ogPath = path.resolve(ROOT_DIR, 'public', 'og-image.png');
    expect(fs.existsSync(ogPath)).toBe(true);
    const buf = fs.readFileSync(ogPath);

    expect(buf.length).toBeLessThan(200 * 1024);
    expect(buf.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(buf.subarray(12, 16).toString('ascii')).toBe('IHDR');

    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    expect(width).toBe(1200);
    expect(height).toBe(630);
  });
});
