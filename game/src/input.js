// Eagle Eye — input.js: mouse and keyboard. A canvas click is translated
// into panel space with the same geometry render.js draws with, then handed
// to the game as "player clicked this spot". Keyboard shortcuts (H hint,
// M mute, R restart, Enter advance) are handled here too, so main.js only
// ever sees named actions, never raw events.

import { panelPointAt } from './render.js';

// Wire the canvas click and the keyboard. Callbacks:
//   onSpotClick(panel, x, y) — a click inside a picture panel.
//   onHint(), onToggleMute(), onRestart(), onAdvance() — keyboard actions.
export function wireInput(canvas, callbacks) {
  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;
    const point = panelPointAt(canvasX, canvasY);
    if (!point) return;
    callbacks.onSpotClick(point.panel, point.x, point.y);
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'h') callbacks.onHint();
    else if (key === 'm') callbacks.onToggleMute();
    else if (key === 'r') callbacks.onRestart();
    else if (key === 'enter') callbacks.onAdvance();
  });
}

// Simulate a click at panel coordinates, for automated play-testing and for
// the screenshot setup. Same path a real pointer click takes.
export function simulateSpotClick(canvas, panel, x, y) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = rect.width / canvas.width;
  const scaleY = rect.height / canvas.height;
  const panelX = panel === 0 ? 10 : 10 + 600 + 20;
  const clientX = rect.left + (panelX + x) * scaleX;
  const clientY = rect.top + (10 + y) * scaleY;
  canvas.dispatchEvent(new PointerEvent('pointerdown', {
    clientX, clientY, bubbles: true, cancelable: true, pointerId: 1,
  }));
}
