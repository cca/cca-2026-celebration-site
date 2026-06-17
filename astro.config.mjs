// @ts-check
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import phaseToolbar from './src/integrations/phase-toolbar/integration.ts';

/**
 * @param {string | undefined} value
 */
const normalizeBasePath = (value) => {
  if (!value || value === '/') return '/'

  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

const base = normalizeBasePath(process.env.PUBLIC_BASE_PATH || process.env.BASE_PATH)

const rewriteRootRelativeUrls = {
  name: 'rewrite-root-relative-urls',
  hooks: {
    /**
     * @param {{ dir: URL }} context
     */
    'astro:build:done': async ({ dir }) => {
      if (base === '/') return

      const basePrefix = base.endsWith('/') ? base.slice(0, -1) : base
      const outputDir = fileURLToPath(dir)

      /** @type {string[]} */
      const htmlFiles = []
      /**
       * @param {string} currentPath
       */
      const walk = async (currentPath) => {
        const entries = await readdir(currentPath, { withFileTypes: true })
        await Promise.all(entries.map(async (entry) => {
          const fullPath = join(currentPath, entry.name)
          if (entry.isDirectory()) {
            return walk(fullPath)
          }

          if (entry.isFile() && entry.name.endsWith('.html')) {
            htmlFiles.push(fullPath)
          }
        }))
      }

      await walk(outputDir)

      const attrPattern = /(href|src|poster|action)=(["'])(\/(?!\/)[^"']*)\2/g

      await Promise.all(htmlFiles.map(async (filePath) => {
        const content = await readFile(filePath, 'utf8')
        const updated = content.replace(attrPattern, (match, attr, quote, value) => {
          if (value.startsWith(basePrefix + '/')) return match
          return `${attr}=${quote}${basePrefix}${value}${quote}`
        })

        if (updated !== content) {
          await writeFile(filePath, updated, 'utf8')
        }
      }))
    }
  }
}

// https://astro.build/config
export default defineConfig({
  site: 'https://cca.github.io',
  base,
  integrations: [mdx(), phaseToolbar(), rewriteRootRelativeUrls],
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
