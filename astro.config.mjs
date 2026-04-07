// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import phaseToolbar from './src/integrations/phase-toolbar/integration.ts';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), phaseToolbar()],
  output: "static",
  redirects: {},
  build: {
    format: "directory",
  },
  image: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.cca.edu",
      },
    ],
  },
});
