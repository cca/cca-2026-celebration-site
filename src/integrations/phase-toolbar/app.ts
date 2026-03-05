import type { DevToolbarApp } from 'astro';

const PHASES = ['save-the-date', 'pre-event', 'during-event', 'post-event'] as const;

const PHASE_LABELS: Record<string, string> = {
  'save-the-date': 'Save the Date',
  'pre-event': 'Pre-Event',
  'during-event': 'During Event',
  'post-event': 'Post-Event',
};

export default {
  init(canvas, app, server) {
    // Track whether we're waiting for the server to confirm a phase change.
    // Includes a timeout fallback in case the confirmation never arrives.
    let pendingReload = false;
    let pendingTimeout: ReturnType<typeof setTimeout> | null = null;

    // Mutable ref so onToggled always targets the live panel after rebuilds
    let currentPanel: HTMLElement | null = null;

    function getActivePhaseFromURL(): string | null {
      const phase = new URL(window.location.href).searchParams.get('phase');
      return phase && (PHASES as readonly string[]).includes(phase) ? phase : null;
    }

    let activePhase = getActivePhaseFromURL();

    function setPending(phase: string | null) {
      pendingReload = true;
      if (pendingTimeout) clearTimeout(pendingTimeout);
      pendingTimeout = setTimeout(() => {
        // If the server never confirmed, unlock buttons and try a direct reload
        // with the phase in the URL as fallback
        pendingReload = false;
        const url = new URL(window.location.href);
        if (phase) {
          url.searchParams.set('phase', phase);
        } else {
          url.searchParams.delete('phase');
        }
        window.history.replaceState({}, '', url.toString());
        window.location.reload();
      }, 3000);
    }

    function buildUI() {
      // Re-read phase from URL (may have changed after VT navigation)
      activePhase = getActivePhaseFromURL();

      const panel = document.createElement('astro-dev-toolbar-window');

      const heading = document.createElement('h2');
      heading.style.cssText = 'margin: 0 0 12px; font-size: 14px; font-weight: 600; color: white;';
      heading.textContent = 'Phase Override';
      panel.appendChild(heading);

      const description = document.createElement('p');
      description.style.cssText = 'margin: 0 0 16px; font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.4;';
      description.textContent = 'Preview the site as it appears in each deployment phase.';
      panel.appendChild(description);

      const buttonGroup = document.createElement('div');
      buttonGroup.style.cssText = 'display: flex; flex-direction: column; gap: 6px;';

      for (const phase of PHASES) {
        const btn = document.createElement('astro-dev-toolbar-button');
        btn.textContent = PHASE_LABELS[phase];
        btn.dataset.phase = phase;
        btn.style.cssText = 'width: 100%;';

        btn.addEventListener('click', () => {
          if (pendingReload) return;
          activePhase = phase;
          updateButtons();
          setPending(phase);
          server.send('phase-changed', { phase });
        });

        buttonGroup.appendChild(btn);
      }

      panel.appendChild(buttonGroup);

      const resetBtn = document.createElement('astro-dev-toolbar-button');
      resetBtn.textContent = 'Reset to Default';
      resetBtn.setAttribute('button-style', 'ghost');
      resetBtn.style.cssText = 'width: 100%; margin-top: 12px;';
      resetBtn.addEventListener('click', () => {
        if (pendingReload) return;
        activePhase = null;
        updateButtons();
        setPending(null);
        server.send('phase-changed', { phase: '' });
      });
      panel.appendChild(resetBtn);

      canvas.appendChild(panel);
      currentPanel = panel;

      function updateButtons() {
        const buttons = buttonGroup.querySelectorAll('astro-dev-toolbar-button');
        buttons.forEach((btn) => {
          const el = btn as HTMLElement;
          const isActive = el.dataset.phase === activePhase;
          el.setAttribute('button-style', isActive ? 'purple' : 'gray');
        });
      }

      updateButtons();
    }

    // Initial DOM build
    buildUI();

    // Rebuild DOM after View Transitions navigation wipes the shadow root.
    // Use requestAnimationFrame to ensure canvas shadow root has been reset.
    document.addEventListener('astro:after-swap', () => {
      requestAnimationFrame(() => buildUI());
    });

    // When the server confirms the phase change, reload the page from the client
    // side. This is more reliable than server-initiated full-reload because
    // it avoids potential issues with Vite HMR event delivery after View
    // Transitions navigation.
    server.on<{ phase: string }>('phase-confirmed', ({ phase }) => {
      if (pendingTimeout) clearTimeout(pendingTimeout);
      activePhase = phase || null;

      // Update the URL so the phase persists across hard reloads
      const url = new URL(window.location.href);
      if (phase) {
        url.searchParams.set('phase', phase);
      } else {
        url.searchParams.delete('phase');
      }
      window.history.replaceState({}, '', url.toString());

      // Hard reload so SSR picks up the new globalThis override
      window.location.reload();
    });

    app.onToggled(({ state }) => {
      currentPanel?.toggleAttribute('data-active', state);
    });
  },
} satisfies DevToolbarApp;
