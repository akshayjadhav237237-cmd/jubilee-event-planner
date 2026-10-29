/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const CSP_DIRECTIVE =
  "default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'self' https://generativelanguage.googleapis.com; object-src 'none'; frame-src 'none'; worker-src 'none'; media-src 'none'; manifest-src 'self'; base-uri 'none'; form-action 'none';";

/** Plugin to ensure the Content Security Policy meta tag is the first child of head. */
function cspPlugin(): Plugin {
  return {
    name: 'csp-plugin',
    transformIndexHtml(html: string): string {
      const metaTag = `<meta http-equiv="Content-Security-Policy" content="${CSP_DIRECTIVE}" />`;
      if (html.includes(metaTag)) {
        return html;
      }
      if (html.includes('<!-- CSP_CONTENT -->')) {
        return html.replace('<!-- CSP_CONTENT -->', CSP_DIRECTIVE);
      }
      return html.replace(/<head>/i, `<head>\n    ${metaTag}`);
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), cspPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-zod': ['zod'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/domain/**', 'src/shared/lib/**', 'src/state/**'],
      exclude: ['src/**/types.ts', 'src/domain/types.ts', 'src/state/types.ts'],
      thresholds: {
        lines: 90,
        branches: 85,
        functions: 90,
        statements: 90,
      },
    },
  },
});
