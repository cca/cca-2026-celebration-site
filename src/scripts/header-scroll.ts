/**
 * Header Scroll Behavior
 * Adds .scrolled class to .site-header when scrollY > 20,
 * enabling backdrop blur glass-morphism effect.
 */

function initHeaderScroll() {
  const header = document.querySelector('.site-header') as HTMLElement;
  if (!header) return;

  let ticking = false;

  function updateHeader() {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  // Set initial state
  updateHeader();
}

document.addEventListener('DOMContentLoaded', initHeaderScroll);
document.addEventListener('astro:page-load', initHeaderScroll);
