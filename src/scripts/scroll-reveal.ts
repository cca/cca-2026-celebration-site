/**
 * Scroll Reveal System
 * IntersectionObserver that watches .reveal elements, adds .is-visible on
 * viewport entry, and applies stagger delays to grid children.
 */

const REVEAL_SELECTOR = '.reveal, .reveal-scale, .reveal-left, .reveal-right, .reveal-clip';

function initScrollReveal() {
  const reveals = document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR);
  if (!reveals.length) return;

  // Respect prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    reveals.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          el.classList.add('is-visible');

          // Apply stagger delays to grid children if this is a grid container
          const gridParent = el.closest('.grid-cards, .grid, .bento-grid');
          if (gridParent) {
            const siblings = Array.from(gridParent.querySelectorAll('.reveal'));
            const index = siblings.indexOf(el);
            if (index >= 0 && index < 8) {
              el.classList.add(`stagger-${index + 1}`);
            }
          }

          observer.unobserve(el);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  reveals.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', initScrollReveal);

// Cross-document view transitions capture the new page before JS runs,
// so .reveal elements are at opacity:0 in the snapshot — they appear as
// white holes when the old page fades away. Fix: immediately mark all
// reveals visible for the transition, then reset below-fold ones after
// so they still animate on scroll.
document.addEventListener('pagereveal', (e) => {
  // pagereveal.viewTransition is not yet in stable TS types
  const vt = (e as Event & { viewTransition?: ViewTransition }).viewTransition;
  if (!vt) return;

  const reveals = document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR);
  reveals.forEach(el => el.classList.add('is-visible'));

  vt.finished.then(() => {
    reveals.forEach(el => {
      // Keep visible if already in viewport; reset below-fold so they animate on scroll
      if (el.getBoundingClientRect().top >= window.innerHeight) {
        el.classList.remove('is-visible');
      }
    });
    initScrollReveal();
  });
});
