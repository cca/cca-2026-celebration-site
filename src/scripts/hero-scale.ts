/**
 * Hero Media Scale Effect
 * Scales the hero image/placeholder from ~78% to 100% width as the user scrolls,
 * transitioning border-radius from rounded to flush. Inspired by wearecollins.com.
 */

function initHeroScale() {
  const frame = document.getElementById('hero-frame');
  if (!frame) return;

  const video = frame.querySelector('.hero-media__video') as HTMLElement | null;

  // Respect prefers-reduced-motion — show at full size immediately
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    frame.style.transform = 'scale(1)';
    return;
  }

  const section = frame.closest('.hero-media') as HTMLElement | null;
  if (!section || !video) return;

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

    const scale = 0.65 + progress * 0.35;     // 0.65 → 1
    const radius = 12 + (1 - progress) * 8;   // 20px → 12px

    frame.style.transform = `scale(${scale})`;
    video!.style.borderRadius = `${radius}px`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  update(); // initial state
}

// Run on initial load
document.addEventListener('DOMContentLoaded', initHeroScale);
