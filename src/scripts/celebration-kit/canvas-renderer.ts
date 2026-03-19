/**
 * canvas-renderer.ts — Canvas 2D draw pipeline for celebration kit
 * Handles background, photo, overlays, and text rendering at any scale.
 */

import type { ResolvedTemplate, Background, PhotoConfig, TextField, Overlay } from './template-manager';

const FONT_MAP: Record<string, string> = {
  display: '"Merriweather", Georgia, "Times New Roman", serif',
  body: '"Lineto Brown", "Helvetica Neue", Helvetica, Arial, sans-serif',
  heading: '"Lineto Brown", "Helvetica Neue", Helvetica, Arial, sans-serif',
  mono: '"Lineto Brown", "Helvetica Neue", Helvetica, Arial, sans-serif',
};

const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) return Promise.resolve(imageCache.get(src)!);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

function resolveFontString(field: { fontFamily: string; fontSize: number; fontWeight: number; fontStyle?: string }, scale: number): string {
  const style = field.fontStyle ?? 'normal';
  const weight = field.fontWeight;
  const size = Math.round(field.fontSize * scale);
  const family = FONT_MAP[field.fontFamily] ?? FONT_MAP.body;
  return `${style} ${weight} ${size}px ${family}`;
}

/** Ensure all kit fonts are loaded before first render */
export async function ensureFontsLoaded(): Promise<void> {
  const families = [
    { family: 'Merriweather', weight: '400' },
    { family: 'Merriweather', weight: '700' },
    { family: 'Lineto Brown', weight: '400' },
    { family: 'Lineto Brown', weight: '700' },
    { family: 'Roboto Mono', weight: '400' },
    { family: 'Roboto Mono', weight: '500' },
  ];
  await document.fonts.ready;
  await Promise.allSettled(
    families.map(f => document.fonts.load(`${f.weight} 16px "${f.family}"`))
  );
}

// --- Draw methods ---

function drawBackground(ctx: CanvasRenderingContext2D, bg: Background, w: number, h: number, scale: number) {
  if (bg.type === 'color' && bg.value) {
    ctx.fillStyle = bg.value;
    ctx.fillRect(0, 0, w, h);
  } else if (bg.type === 'gradient' && bg.stops) {
    const angle = (bg.angle ?? 135) * Math.PI / 180;
    const cx = w / 2, cy = h / 2;
    const len = Math.max(w, h);
    const dx = Math.cos(angle) * len;
    const dy = Math.sin(angle) * len;
    const grad = ctx.createLinearGradient(cx - dx / 2, cy - dy / 2, cx + dx / 2, cy + dy / 2);
    for (const [color, stop] of bg.stops) {
      grad.addColorStop(stop, color);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
  // bg.type === 'image' handled via preloaded image
}

function drawPhoto(
  ctx: CanvasRenderingContext2D,
  photo: PhotoConfig,
  userImage: HTMLImageElement | null,
  scale: number
) {
  const x = photo.x * scale;
  const y = photo.y * scale;
  const w = photo.width * scale;
  const h = photo.height * scale;
  const bw = photo.borderWidth ? photo.borderWidth * scale : 0;

  ctx.save();

  // Clip path for photo shape
  ctx.beginPath();
  if (photo.shape === 'circle') {
    const r = Math.min(w, h) / 2;
    ctx.arc(x, y, r, 0, Math.PI * 2);
  } else if (photo.shape === 'rounded-rect') {
    const radius = (photo.borderRadius ?? 12) * scale;
    const left = x - w / 2;
    const top = y - h / 2;
    ctx.roundRect(left, top, w, h, radius);
  } else {
    // rectangle
    ctx.rect(x - w / 2, y - h / 2, w, h);
  }
  ctx.closePath();

  if (userImage) {
    ctx.save();
    ctx.clip();
    // Object-fit: cover calculation
    const imgAspect = userImage.naturalWidth / userImage.naturalHeight;
    const areaAspect = w / h;
    let sw: number, sh: number, sx: number, sy: number;
    if (imgAspect > areaAspect) {
      sh = userImage.naturalHeight;
      sw = sh * areaAspect;
      sx = (userImage.naturalWidth - sw) / 2;
      sy = 0;
    } else {
      sw = userImage.naturalWidth;
      sh = sw / areaAspect;
      sx = 0;
      sy = (userImage.naturalHeight - sh) / 2;
    }
    ctx.drawImage(userImage, sx, sy, sw, sh, x - w / 2, y - h / 2, w, h);
    ctx.restore();
  } else {
    // Placeholder
    ctx.fillStyle = 'rgba(128, 128, 128, 0.15)';
    ctx.fill();

    // Placeholder icon
    ctx.fillStyle = 'rgba(128, 128, 128, 0.3)';
    ctx.font = `${Math.round(40 * scale)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', x, y);
  }

  // Border
  if (bw > 0 && photo.borderColor) {
    ctx.strokeStyle = photo.borderColor;
    ctx.lineWidth = bw;
    ctx.beginPath();
    if (photo.shape === 'circle') {
      const r = Math.min(w, h) / 2;
      ctx.arc(x, y, r, 0, Math.PI * 2);
    } else if (photo.shape === 'rounded-rect') {
      const radius = (photo.borderRadius ?? 12) * scale;
      ctx.roundRect(x - w / 2, y - h / 2, w, h, radius);
    } else {
      ctx.rect(x - w / 2, y - h / 2, w, h);
    }
    ctx.stroke();
  }

  ctx.restore();
}

function drawOverlays(ctx: CanvasRenderingContext2D, overlays: Overlay[], scale: number, canvasW: number, canvasH: number) {
  for (const o of overlays) {
    ctx.save();

    // Confetti and seal manage their own globalAlpha internally —
    // skip the outer opacity so it doesn't compound.
    if (o.type !== 'confetti' && o.type !== 'seal') {
      ctx.globalAlpha = o.opacity ?? 1.0;
    }

    if (o.type === 'text' && o.text) {
      const family = FONT_MAP[o.fontFamily ?? 'mono'] ?? FONT_MAP.mono;
      const size = Math.round((o.fontSize ?? 24) * scale);
      const weight = o.fontWeight ?? 400;
      ctx.font = `${weight} ${size}px ${family}`;
      ctx.fillStyle = o.color ?? '#FFFFFF';
      ctx.textAlign = (o.align as CanvasTextAlign) ?? 'center';
      ctx.textBaseline = 'middle';
      if (o.letterSpacing && o.letterSpacing > 0) {
        (ctx as any).letterSpacing = `${o.letterSpacing * scale}px`;
      }
      ctx.fillText(o.text, (o.x ?? 0) * scale, (o.y ?? 0) * scale);
      if (o.letterSpacing) {
        (ctx as any).letterSpacing = '0px';
      }
    } else if (o.type === 'rect') {
      ctx.fillStyle = o.color ?? '#FFFFFF';
      ctx.fillRect((o.x ?? 0) * scale, (o.y ?? 0) * scale, (o.width ?? 0) * scale, (o.height ?? 0) * scale);
    } else if (o.type === 'decorative-dots') {
      drawDecorativeDots(ctx, o, scale, canvasW, canvasH);
    } else if (o.type === 'confetti') {
      drawConfetti(ctx, o, scale);
    } else if (o.type === 'seal') {
      drawSeal(ctx, o, scale);
    } else if (o.type === 'image' && o.src) {
      const img = imageCache.get(o.src);
      if (img) {
        ctx.drawImage(img, (o.x ?? 0) * scale, (o.y ?? 0) * scale, (o.width ?? 0) * scale, (o.height ?? 0) * scale);
      }
    }

    ctx.restore();
  }
}

/** Seeded pseudo-random for deterministic dot placement */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

const CONFETTI_COLORS = ['#00BFB3', '#563D82', '#FFC845', '#E57200', '#005776'];
const CONFETTI_SHAPES: ('rect' | 'circle' | 'triangle')[] = ['rect', 'circle', 'triangle'];

function drawConfetti(ctx: CanvasRenderingContext2D, o: Overlay, scale: number) {
  const count = o.count ?? 35;
  const region = o.region ?? { x: 0, y: 0, width: 1080, height: 1080 };
  const opacityMul = o.opacity ?? 0.15;
  const rand = seededRandom(o.seed ?? 42);

  for (let i = 0; i < count; i++) {
    const px = (region.x + rand() * region.width) * scale;
    const py = (region.y + rand() * region.height) * scale;
    const size = (3 + rand() * 5) * scale;
    const rotation = rand() * Math.PI * 2;
    const particleOpacity = (0.2 + rand() * 0.4) * opacityMul;
    const color = CONFETTI_COLORS[Math.floor(rand() * CONFETTI_COLORS.length)];
    const shape = CONFETTI_SHAPES[Math.floor(rand() * CONFETTI_SHAPES.length)];

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rotation);
    ctx.globalAlpha = particleOpacity;
    ctx.fillStyle = color;

    switch (shape) {
      case 'rect':
        ctx.fillRect(-size / 2, -size / 2, size, size * 0.6);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -size / 2);
        ctx.lineTo(size / 2, size / 2);
        ctx.lineTo(-size / 2, size / 2);
        ctx.closePath();
        ctx.fill();
        break;
    }

    ctx.restore();
  }
}

/**
 * Draw the CCA seal tinted to a specific color.
 * The seal SVG uses `fill="currentColor"` which renders as black on canvas.
 * We draw it to an offscreen canvas, then composite a solid color fill
 * using 'source-in' so only the seal shape gets colored.
 */
function drawSeal(ctx: CanvasRenderingContext2D, o: Overlay, scale: number) {
  const src = o.src ?? '/images/cca-seal.svg';
  const img = imageCache.get(src);
  if (!img) return;

  const size = Math.round((o.size ?? 200) * scale);
  const cx = (o.x ?? 540) * scale;
  const cy = (o.y ?? 540) * scale;
  const tint = o.color ?? '#FFFFFF';

  // Render seal to offscreen canvas, then tint it
  const off = document.createElement('canvas');
  off.width = size;
  off.height = size;
  const oc = off.getContext('2d');
  if (!oc) return;

  // Draw the black seal shape
  oc.drawImage(img, 0, 0, size, size);
  // Tint: fill the color but only where the seal pixels exist
  oc.globalCompositeOperation = 'source-in';
  oc.fillStyle = tint;
  oc.fillRect(0, 0, size, size);

  ctx.save();
  ctx.globalAlpha = o.opacity ?? 0.15;
  ctx.drawImage(off, cx - size / 2, cy - size / 2);
  ctx.restore();
}

function drawDecorativeDots(ctx: CanvasRenderingContext2D, o: Overlay, scale: number, _cw: number, _ch: number) {
  const colors = [o.color1 ?? '#00BFB3', o.color2 ?? '#FFC845', o.color3 ?? '#563D82'];
  const count = o.count ?? 20;
  const region = o.region ?? { x: 0, y: 0, width: 1080, height: 1080 };
  const size = (o.size ?? 6) * scale;
  const rand = seededRandom(42);

  for (let i = 0; i < count; i++) {
    const dx = (region.x + rand() * region.width) * scale;
    const dy = (region.y + rand() * region.height) * scale;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(dx, dy, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTextFields(
  ctx: CanvasRenderingContext2D,
  fields: TextField[],
  values: Record<string, string>,
  scale: number
) {
  for (const field of fields) {
    const text = values[field.id] || field.placeholder;
    if (!text) continue;

    ctx.save();
    ctx.textAlign = field.align as CanvasTextAlign;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = field.color;

    if (field.letterSpacing && field.letterSpacing > 0) {
      (ctx as any).letterSpacing = `${field.letterSpacing * scale}px`;
    }

    // Auto-shrink font if text exceeds maxWidth
    let fontSize = field.fontSize;
    const maxW = field.maxWidth * scale;

    while (fontSize > 12) {
      ctx.font = resolveFontString({ ...field, fontSize }, scale);
      const measured = ctx.measureText(text);
      if (measured.width <= maxW) break;
      fontSize -= 2;
    }
    ctx.font = resolveFontString({ ...field, fontSize }, scale);

    ctx.fillText(text, field.x * scale, field.y * scale, maxW);

    if (field.letterSpacing) {
      (ctx as any).letterSpacing = '0px';
    }
    ctx.restore();
  }
}

// --- Main render function ---

export interface RenderOptions {
  canvas: HTMLCanvasElement;
  template: ResolvedTemplate;
  userImage: HTMLImageElement | null;
  textValues: Record<string, string>;
  scale?: number;
}

export function render(opts: RenderOptions): void {
  const { canvas, template, userImage, textValues, scale = 1 } = opts;
  const w = template.canvasWidth * scale;
  const h = template.canvasHeight * scale;

  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, w, h);

  // Split overlays: background-layer types (seal, confetti) go behind the photo,
  // everything else (text, rect, dots, images) goes above it.
  const bgOverlays = template.overlays.filter(o => o.type === 'seal' || o.type === 'confetti');
  const fgOverlays = template.overlays.filter(o => o.type !== 'seal' && o.type !== 'confetti');

  // 1. Background
  drawBackground(ctx, template.background, w, h, scale);

  // 2. Background overlays (seal + confetti as texture behind photo)
  drawOverlays(ctx, bgOverlays, scale, w, h);

  // 3. Photo
  drawPhoto(ctx, template.photo, userImage, scale);

  // 4. Foreground overlays (under text)
  drawOverlays(ctx, fgOverlays, scale, w, h);

  // 5. Text fields
  drawTextFields(ctx, template.textFields, textValues, scale);
}

/**
 * Preload any image-type overlay assets referenced in the template.
 */
export async function preloadTemplateAssets(template: ResolvedTemplate): Promise<void> {
  const urls: string[] = [];

  if (template.background.type === 'image' && template.background.src) {
    urls.push(template.background.src);
  }
  for (const o of template.overlays) {
    if (o.type === 'image' && o.src) {
      urls.push(o.src);
    } else if (o.type === 'seal') {
      urls.push(o.src ?? '/images/cca-seal.svg');
    }
  }

  await Promise.allSettled(urls.map(loadImage));
}
