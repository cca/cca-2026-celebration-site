import { CURRENT_PHASE, PHASES, type Phase } from '../../config/phases';

/**
 * In dev mode, reads `?phase=` from the URL to allow preview overrides.
 * In production, always returns CURRENT_PHASE.
 */
export function getCurrentPhase(url: URL): Phase {
  if (import.meta.env.DEV) {
    const override = url.searchParams.get('phase');
    if (override && PHASES.includes(override as Phase)) {
      return override as Phase;
    }
  }
  return CURRENT_PHASE;
}

/**
 * Determines if content should be visible in the current phase.
 * - `visibleIn`: content is only shown in these phases
 * - `hiddenIn`: content is hidden in these phases (shown in all others)
 * Exactly one of visibleIn or hiddenIn should be provided.
 */
export function isContentVisible(
  currentPhase: Phase,
  visibleIn?: Phase[],
  hiddenIn?: Phase[],
): boolean {
  if (visibleIn) return visibleIn.includes(currentPhase);
  if (hiddenIn) return !hiddenIn.includes(currentPhase);
  return true;
}
