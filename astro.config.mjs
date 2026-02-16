// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
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
