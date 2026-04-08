/**
 * Initializes all [data-chimera-loop] elements on the page with
 * an elastic morph/skew chimera shape cycle animation.
 *
 * Uses CSS mask-image + background-color for pixel-perfect color accuracy
 * (no filter approximation).
 */

const shapes = [
  'chimera-expanded-shape01',
  'chimera-expanded-shape02',
  'chimera-expanded-shape03',
  'chimera-expanded-shape04',
];

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function elasticOut(t: number): number {
  if (t === 0 || t === 1) return t;
  const p = 0.4;
  return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
}

function easeInCubic(t: number): number {
  return t * t * t;
}

type Phase = 'idle' | 'morph-in' | 'hold' | 'morph-out';

interface SlotState {
  phase: Phase;
  start: number;
  skewDir: number;
  rotDir: number;
  sizeMult: number;
}

interface LoopInstance {
  el: HTMLElement;
  slotEls: [HTMLElement, HTMLElement];
  shapeEls: [HTMLElement, HTMLElement];
  state: [SlotState, SlotState];
  cycleDuration: number;
  fadeOverlap: number;
  elasticIntensity: number;
  skewAmount: number;
  driftSpeed: number;
  sizeVariance: number;
  colors: string[];
  colorIndex: number;
  shapeIndex: number;
  startDelay: number;
  started: boolean;
}

function kick(inst: LoopInstance, slot: 0 | 1, now: number) {
  const s = inst.state[slot];
  const shape = shapes[inst.shapeIndex % shapes.length];
  inst.shapeIndex++;

  const color = inst.colors[inst.colorIndex % inst.colors.length];
  inst.colorIndex++;

  const shapeEl = inst.shapeEls[slot];
  const url = `/images/chimera-expanded/${shape}.svg`;
  shapeEl.style.maskImage = `url('${url}')`;
  shapeEl.style.setProperty('-webkit-mask-image', `url('${url}')`);
  shapeEl.style.backgroundColor = color;

  s.phase = 'morph-in';
  s.start = now;
  s.skewDir = Math.random() < 0.5 ? -1 : 1;
  s.rotDir = Math.random() < 0.5 ? -1 : 1;
  s.sizeMult = 1 + (Math.random() * 2 - 1) * inst.sizeVariance;
}

function updateSlot(inst: LoopInstance, slotIdx: 0 | 1, now: number) {
  const s = inst.state[slotIdx];
  const el = inst.slotEls[slotIdx];
  if (s.phase === 'idle') return;

  const elapsed = (now - s.start) / 1000;
  const morphDur = inst.cycleDuration * inst.fadeOverlap;
  const holdDur = inst.cycleDuration * (1 - inst.fadeOverlap * 2);

  if (s.phase === 'morph-in') {
    const t = Math.min(elapsed / morphDur, 1);
    const elastic = elasticOut(t) * inst.elasticIntensity + (1 - inst.elasticIntensity) * easeInOut(t);
    const smooth = easeInOut(t);

    const scale = s.sizeMult * (0.3 + 0.7 * elastic);
    const skew = (1 - elastic) * inst.skewAmount * s.skewDir;
    const rotate = (1 - smooth) * 12 * s.rotDir;
    const opacity = Math.min(t / 0.6, 1);

    el.style.opacity = String(opacity);
    el.style.transform = `rotate(${rotate}deg) skew(${skew}deg) scale(${scale})`;

    if (t >= 1) {
      s.phase = 'hold';
      s.start = now;
      el.style.opacity = '1';
      el.style.transform = `scale(${s.sizeMult})`;
    }
  } else if (s.phase === 'hold') {
    const t = elapsed / Math.max(holdDur, 0.1);
    const ds = inst.driftSpeed;

    const breathe = Math.sin(elapsed * ds * 0.8) * 0.06;
    const driftRotate = Math.sin(elapsed * ds * 0.5) * 5 * s.rotDir;
    const driftSkew = Math.sin(elapsed * ds * 0.3) * 3 * s.skewDir;
    const driftY = Math.sin(elapsed * ds * 0.4) * 8;

    el.style.transform = `translateY(${driftY}px) rotate(${driftRotate}deg) skew(${driftSkew}deg) scale(${s.sizeMult * (1 + breathe)})`;

    if (t >= 1) {
      s.phase = 'morph-out';
      s.start = now;
      const next = (slotIdx === 0 ? 1 : 0) as 0 | 1;
      kick(inst, next, now);
    }
  } else if (s.phase === 'morph-out') {
    const t = Math.min(elapsed / morphDur, 1);
    const e = easeInCubic(t);

    const scaleX = s.sizeMult * (1 + e * 1.2);
    const scaleY = s.sizeMult * (1 - e * 0.4);
    const skew = e * inst.skewAmount * 1.5 * -s.skewDir;
    const rotate = e * 20 * -s.rotDir;
    const opacity = 1 - easeInOut(t);

    el.style.opacity = String(opacity);
    el.style.transform = `rotate(${rotate}deg) skew(${skew}deg) scaleX(${scaleX}) scaleY(${scaleY})`;

    if (t >= 1) {
      s.phase = 'idle';
      el.style.opacity = '0';
    }
  }
}

let cancelLoop: (() => void) | undefined;

function init() {
  cancelLoop?.();

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const containers = document.querySelectorAll<HTMLElement>('[data-chimera-loop]');
  if (containers.length === 0) return;

  const instances: LoopInstance[] = [];

  containers.forEach(el => {
    const slotEls = [
      el.querySelector('[data-slot="a"]') as HTMLElement,
      el.querySelector('[data-slot="b"]') as HTMLElement,
    ] as [HTMLElement, HTMLElement];
    const shapeEls = [
      el.querySelector('[data-shape="a"]') as HTMLElement,
      el.querySelector('[data-shape="b"]') as HTMLElement,
    ] as [HTMLElement, HTMLElement];

    const inst: LoopInstance = {
      el,
      slotEls,
      shapeEls,
      state: [
        { phase: 'idle', start: 0, skewDir: 1, rotDir: 1, sizeMult: 1 },
        { phase: 'idle', start: 0, skewDir: 1, rotDir: 1, sizeMult: 1 },
      ],
      cycleDuration: parseFloat(el.dataset.cycleDuration || '4'),
      fadeOverlap: parseFloat(el.dataset.fadeOverlap || '0.3'),
      elasticIntensity: parseFloat(el.dataset.elasticIntensity || '1'),
      skewAmount: parseFloat(el.dataset.skewAmount || '15'),
      driftSpeed: parseFloat(el.dataset.driftSpeed || '1'),
      sizeVariance: parseFloat(el.dataset.sizeVariance || '0.25'),
      colors: (el.dataset.colors || '#ffffff').split(','),
      colorIndex: 0,
      shapeIndex: Math.floor(Math.random() * shapes.length),
      startDelay: parseFloat(el.dataset.startDelay || '0'),
      started: false,
    };

    if (!reducedMotion && inst.startDelay <= 0) {
      kick(inst, 0, performance.now());
      inst.started = true;
    } else if (reducedMotion) {
      const shape = shapes[inst.shapeIndex % shapes.length];
      const url = `/images/chimera-expanded/${shape}.svg`;
      shapeEls[0].style.maskImage = `url('${url}')`;
      shapeEls[0].style.setProperty('-webkit-mask-image', `url('${url}')`);
      shapeEls[0].style.backgroundColor = inst.colors[0];
      slotEls[0].style.opacity = '1';
    }

    instances.push(inst);
  });

  const initTime = performance.now();

  let rafId: number;
  function tick(now: number) {
    const elapsed = (now - initTime) / 1000;
    for (const inst of instances) {
      if (!inst.started && elapsed >= inst.startDelay) {
        kick(inst, 0, now);
        inst.started = true;
      }
      updateSlot(inst, 0, now);
      updateSlot(inst, 1, now);
    }
    rafId = requestAnimationFrame(tick);
  }

  if (!reducedMotion) {
    rafId = requestAnimationFrame(tick);
    cancelLoop = () => {
      cancelAnimationFrame(rafId);
      cancelLoop = undefined;
    };
  }
}

init();

export {};
