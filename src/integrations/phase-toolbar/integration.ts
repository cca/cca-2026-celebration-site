import type { AstroIntegration } from 'astro';
import { setPhaseOverride } from './state.ts';

export default function phaseToolbar(): AstroIntegration {
  return {
    name: 'phase-toolbar',
    hooks: {
      'astro:config:setup': ({ addDevToolbarApp, command }) => {
        // Only set up in dev mode
        if (command !== 'dev') return;

        addDevToolbarApp({
          id: 'phase-toolbar',
          name: 'Phase',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`,
          entrypoint: new URL('./app.ts', import.meta.url),
        });
      },

      'astro:server:setup': ({ toolbar }) => {
        toolbar.on<{ phase: string }>('phase-changed', ({ phase }) => {
          setPhaseOverride(phase || null);

          // Confirm back to the toolbar app — it will trigger the reload client-side
          toolbar.send('phase-confirmed', { phase });
        });
      },
    },
  };
}
