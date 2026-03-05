// @ts-check
import { defineConfig } from 'astro/config';
import phaseToolbar from './src/integrations/phase-toolbar/integration.ts';

// https://astro.build/config
export default defineConfig({
  integrations: [phaseToolbar()],
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
