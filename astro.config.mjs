// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: "static",
  redirects: {
    "/students/": "/showcase/students/",
    "/students/[...slug]": "/showcase/students/[...slug]",
    "/works/": "/showcase/works/",
    "/works/[...slug]": "/showcase/works/[...slug]",
  },
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
