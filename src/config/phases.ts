export const PHASES = ['save-the-date', 'pre-event', 'during-event', 'post-event'] as const;

export type Phase = (typeof PHASES)[number];

/**
 * The single knob to change for deployment.
 * Update this value and rebuild to transition the entire site to the next phase.
 */
export const CURRENT_PHASE: Phase = 'during-event';

/** Returns true if `current` is at or after `minimum` in the phase order. */
export function isPhaseAtLeast(current: Phase, minimum: Phase): boolean {
  return PHASES.indexOf(current) >= PHASES.indexOf(minimum);
}

/** Returns true if `current` is before `threshold` in the phase order. */
export function isPhaseBefore(current: Phase, threshold: Phase): boolean {
  return PHASES.indexOf(current) < PHASES.indexOf(threshold);
}
