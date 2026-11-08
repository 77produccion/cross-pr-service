import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// Configure the verified production domain before adding sitemap/canonical URLs.
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  integrations: [mdx()],
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  vite: { build: { sourcemap: false } },
});
