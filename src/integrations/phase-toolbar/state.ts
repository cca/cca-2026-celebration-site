const KEY = '__astro_phase_override__';

export function getPhaseOverride(): string | null {
  return (globalThis as any)[KEY] ?? null;
}

export function setPhaseOverride(phase: string | null): void {
  (globalThis as any)[KEY] = phase;
}
