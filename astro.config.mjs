// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

// Node.js standalone server configuration
// Build with: npm run build
// Run with: npm run start
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [tailwind()],
  security: {
    checkOrigin: false,
  },
});
