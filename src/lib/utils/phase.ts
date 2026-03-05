import { CURRENT_PHASE, PHASES, type Phase } from '../../config/phases';
import { getPhaseOverride } from '../../integrations/phase-toolbar/state';

/**
 * Returns the active phase. In dev mode, checks the toolbar override first.
 * The `url` parameter is kept for API compatibility but no longer used for phase detection.
 */
export function getCurrentPhase(_url?: URL): Phase {
  if (import.meta.env.DEV) {
    const override = getPhaseOverride();
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
