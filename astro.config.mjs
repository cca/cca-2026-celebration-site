// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import phaseToolbar from './src/integrations/phase-toolbar/integration.ts';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), phaseToolbar()],
  output: "static",
  redirects: {
    '/commencement/undergraduate': '/commencement/bachelors',
    '/commencement/undergraduate/program': '/commencement/bachelors',
    '/commencement/graduate': '/commencement/masters',
    '/commencement/graduate/program': '/commencement/masters',
  },
  build: {
    format: "directory",
  },
  image: {
    remotePatterns: [
      { protocol: "https", hostname: "**.cca.edu" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "i.vimeocdn.com" },
    ],
  },
});
