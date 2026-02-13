/**
 * Hero Media Scale Effect
 * Scales the hero image/placeholder from ~78% to 100% width as the user scrolls,
 * transitioning border-radius from rounded to flush. Inspired by wearecollins.com.
 */

function initHeroScale() {
  const frame = document.getElementById('hero-frame');
  if (!frame) return;

  // Respect prefers-reduced-motion — show at full size immediately
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    frame.style.transform = 'scale(1)';
    frame.style.borderRadius = '0';
    return;
  }

  const section = frame.closest('.hero-media') as HTMLElement | null;
  if (!section) return;

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  }

  function update() {
    if (!section || !frame) return;

    const rect = section.getBoundingClientRect();
    const viewportH = window.innerHeight;

    // Progress: 0 when section top enters viewport bottom, 1 when section top reaches viewport center
    const start = viewportH;         // section top is at viewport bottom
    const end = viewportH * 0.3;     // section top is near viewport top third
    const current = rect.top;

    let progress = 1 - (current - end) / (start - end);
    progress = Math.max(0, Math.min(1, progress));

    const scale = 0.78 + progress * 0.22;     // 0.78 → 1
    const radius = (1 - progress) * 16;       // 16px → 0

    frame.style.transform = `scale(${scale})`;
    frame.style.borderRadius = `${radius}px`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  update(); // initial state
}

// Run on initial load
document.addEventListener('DOMContentLoaded', initHeroScale);

// Re-run after Astro page transitions (View Transitions)
document.addEventListener('astro:page-load', initHeroScale);
