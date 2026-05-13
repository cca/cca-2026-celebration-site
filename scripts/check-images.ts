#!/usr/bin/env bun
/**
 * Pre-build validation for image references.
 *
 * Two passes:
 *   1. .astro pass — every <Image src="..."> with a string-literal src must
 *      have width+height OR inferSize. Otherwise Astro fails the build with
 *      "Missing width and height attributes ... when using remote images".
 *   2. .json pass — every image-like path under src/content/ must resolve
 *      to a file that actually exists in src/ or public/. Catches typos and
 *      uncommitted assets before Astro reaches them.
 *
 * Run via: bun run check:images
 * Auto-runs before: bun run build
 */

import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, relative, dirname, join } from 'node:path';

const ROOT = resolve(import.meta.dir, '..');
const SRC = resolve(ROOT, 'src');
const PUBLIC_DIR = resolve(ROOT, 'public');
const CONTENT_DIR = resolve(SRC, 'content');

type Severity = 'error' | 'warn';

interface Issue {
  severity: Severity;
  file: string;
  line?: number;
  message: string;
  fix?: string;
}

const issues: Issue[] = [];

// Promote .json issues to errors with --strict (or CHECK_IMAGES_STRICT=1).
// Default: .json issues warn, .astro issues always error.
const STRICT =
  process.argv.includes('--strict') || process.env.CHECK_IMAGES_STRICT === '1';

const SKIP_DIRS = new Set(['node_modules', '.astro', 'dist', '.git', '.cache']);

async function walk(dir: string, exts: string[]): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walk(p, exts)));
    } else if (exts.some(x => e.name.endsWith(x))) {
      out.push(p);
    }
  }
  return out;
}

function lineOf(source: string, index: number): number {
  return source.slice(0, index).split('\n').length;
}

// ── .astro pass ─────────────────────────────────────────────────────────────

const IMAGE_TAG_RE = /<Image\b([\s\S]*?)\/?>/g;
const REMOTE_RE = /^https?:\/\//;

function checkAstro(file: string, source: string) {
  let m: RegExpExecArray | null;
  IMAGE_TAG_RE.lastIndex = 0;
  while ((m = IMAGE_TAG_RE.exec(source)) !== null) {
    const attrs = m[1];

    // Look for src=... with a string literal (single or double quote).
    // src={...} is treated as a typed expression and skipped — the type system
    // handles those (typically ImageMetadata from import.meta.glob or schema image()).
    const srcMatch = attrs.match(/\bsrc\s*=\s*("([^"]*)"|'([^']*)')/);
    if (!srcMatch) continue;

    const stringSrc = srcMatch[2] ?? srcMatch[3] ?? '';
    if (!stringSrc) continue;

    const hasWidth = /\bwidth\s*=/.test(attrs);
    const hasHeight = /\bheight\s*=/.test(attrs);
    const hasInferSize = /\binferSize\b/.test(attrs);

    if ((hasWidth && hasHeight) || hasInferSize) continue;

    const line = lineOf(source, m.index);
    issues.push({
      severity: 'error',
      file: relative(ROOT, file),
      line,
      message: `<Image src="${stringSrc}"> is missing width/height/inferSize`,
      fix: 'Add width={N} height={N}, or inferSize, or import the file from src/assets/ so Astro can infer dimensions.',
    });
  }
}

// ── .json pass ──────────────────────────────────────────────────────────────

const IMAGE_EXT_RE = /\.(jpg|jpeg|png|gif|svg|webp|avif)(\?.*)?$/i;
const IMAGE_KEYS = new Set(['src', 'thumbnail']);

function findLineForValue(source: string, value: string): number | undefined {
  const idx = source.indexOf(JSON.stringify(value));
  if (idx === -1) return undefined;
  return lineOf(source, idx);
}

function walkJson(
  value: unknown,
  jsonDir: string,
  jsonFile: string,
  jsonText: string,
  key?: string,
) {
  if (typeof value === 'string') {
    const isImageKey = !!key && IMAGE_KEYS.has(key);
    const looksLikeImage = IMAGE_EXT_RE.test(value);
    if (!isImageKey && !looksLikeImage) return;
    if (REMOTE_RE.test(value)) return;

    let resolvedPath: string;
    let where: string;
    if (value.startsWith('/')) {
      resolvedPath = join(PUBLIC_DIR, value);
      where = `public${value}`;
    } else if (value.startsWith('../') || value.startsWith('./')) {
      resolvedPath = resolve(jsonDir, value);
      where = relative(ROOT, resolvedPath);
    } else {
      // Bare string (no leading path) — can't classify, skip.
      return;
    }

    if (!existsSync(resolvedPath)) {
      issues.push({
        severity: STRICT ? 'error' : 'warn',
        file: relative(ROOT, jsonFile),
        line: findLineForValue(jsonText, value),
        message: `${key ?? 'image'} "${value}" — file not found at ${where}`,
        fix: value.startsWith('/')
          ? `Add the file at public${value}, or fix the path.`
          : `Fix the path (resolved relative to ${relative(ROOT, jsonDir)}/).`,
      });
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) walkJson(item, jsonDir, jsonFile, jsonText, key);
    return;
  }

  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      walkJson(v, jsonDir, jsonFile, jsonText, k);
    }
  }
}

async function checkJson(file: string) {
  const text = await readFile(file, 'utf8');
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return; // parse errors are caught by Astro's content validator
  }
  walkJson(data, dirname(file), file, text);
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const astroFiles = await walk(SRC, ['.astro']);
  for (const f of astroFiles) {
    const src = await readFile(f, 'utf8');
    checkAstro(f, src);
  }

  const jsonFiles = await walk(CONTENT_DIR, ['.json']);
  for (const f of jsonFiles) {
    await checkJson(f);
  }

  if (issues.length === 0) {
    console.log(`✓ check-images: ${astroFiles.length} .astro + ${jsonFiles.length} .json files OK`);
    return;
  }

  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warn');

  for (const i of issues) {
    const loc = i.line ? `:${i.line}` : '';
    const mark = i.severity === 'error' ? '✗' : '⚠';
    console.error(`${mark} ${i.file}${loc}`);
    console.error(`  ${i.message}`);
    if (i.fix) console.error(`  Fix: ${i.fix}`);
    console.error();
  }

  const parts: string[] = [];
  if (errors.length) parts.push(`${errors.length} error${errors.length === 1 ? '' : 's'}`);
  if (warnings.length) parts.push(`${warnings.length} warning${warnings.length === 1 ? '' : 's'}`);
  console.error(parts.join(', ') + (STRICT ? '' : ' (run with --strict to fail on warnings)'));

  if (errors.length) process.exit(1);
}

main();
