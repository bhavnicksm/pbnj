// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

// Cloudflare Workers configuration
// Build with: npm run build:cloudflare
// Deploy with: npm run deploy
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    imageService: 'passthrough',
  }),
  integrations: [tailwind()],
  security: {
    checkOrigin: false,
  },
});
