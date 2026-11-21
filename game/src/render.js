// Eagle Eye — render.js: everything drawn on the game canvas. One canvas
// holds both pictures side by side; this module draws the two panels, the
// red rings on the differences already found, the pulsing hint ring, and the
// fading X of a wrong click. Panel geometry lives here and nowhere else, so
// input maps clicks with the same numbers the renderer draws with.

import { PANEL_W, PANEL_H } from './scenes.js';

export const PANEL_GAP = 20;
export const PANEL_MARGIN = 10;
export const LEFT_PANEL_X = PANEL_MARGIN;
export const RIGHT_PANEL_X = PANEL_MARGIN + PANEL_W + PANEL_GAP;
export const PANEL_Y = PANEL_MARGIN;

// Which panel (0 = left picture A, 1 = right picture B) a canvas point is
// in, and the point translated into panel space. Null when the point is on
// the gap, the margin, or outside the canvas.
export function panelPointAt(canvasX, canvasY) {
  if (canvasY < PANEL_Y || canvasY > PANEL_Y + PANEL_H) return null;
  if (canvasX >= LEFT_PANEL_X && canvasX <= LEFT_PANEL_X + PANEL_W) {
    return { panel: 0, x: canvasX - LEFT_PANEL_X, y: canvasY - PANEL_Y };
  }
  if (canvasX >= RIGHT_PANEL_X && canvasX <= RIGHT_PANEL_X + PANEL_W) {
    return { panel: 1, x: canvasX - RIGHT_PANEL_X, y: canvasY - PANEL_Y };
  }
  return null;
}

// Draw the whole frame for the current level state.
export function renderGameFrame(ctx, levelState, nowMs) {
  const scene = levelState.scene;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  drawPanel(ctx, scene, 0, LEFT_PANEL_X);
  drawPanel(ctx, scene, 1, RIGHT_PANEL_X);
  drawPanelLabels(ctx);
  drawFoundMarkers(ctx, levelState);
  drawHintRing(ctx, levelState, nowMs);
  drawWrongMarks(ctx, levelState, nowMs);
}

// One picture panel: the scene in its variant, inside a rounded frame.
function drawPanel(ctx, scene, variant, panelX) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(panelX, PANEL_Y, PANEL_W, PANEL_H, 6);
  ctx.clip();
  ctx.translate(panelX, PANEL_Y);
  scene.draw(ctx, variant, PANEL_W, PANEL_H);
  ctx.restore();
  ctx.strokeStyle = '#123a5c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(panelX, PANEL_Y, PANEL_W, PANEL_H, 6);
  ctx.stroke();
}

// The "A" and "B" badges that tell the two pictures apart.
function drawPanelLabels(ctx) {
  for (const [panelX, letter] of [[LEFT_PANEL_X, 'A'], [RIGHT_PANEL_X, 'B']]) {
    ctx.fillStyle = '#123a5c';
    ctx.beginPath();
    ctx.roundRect(panelX + 8, PANEL_Y + 8, 30, 30, 8);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 19px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, panelX + 23, PANEL_Y + 24);
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// A red ring around every difference already found, on both pictures.
function drawFoundMarkers(ctx, levelState) {
  for (const diff of levelState.scene.differences) {
    if (!levelState.foundIds.has(diff.id)) continue;
    for (const panelX of [LEFT_PANEL_X, RIGHT_PANEL_X]) {
      const cx = panelX + diff.x;
      const cy = PANEL_Y + diff.y;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(cx, cy, diff.r + 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#e8232a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, diff.r + 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

// The hint: a pulsing amber ring around one unfound difference, both pictures.
function drawHintRing(ctx, levelState, nowMs) {
  if (!levelState.hintedId || nowMs > levelState.hintUntilMs) return;
  const diff = levelState.scene.differences.find((d) => d.id === levelState.hintedId);
  if (!diff) return;
  const pulse = 1 + 0.12 * Math.sin(nowMs / 130);
  const radius = (diff.r + 6) * pulse;
  for (const panelX of [LEFT_PANEL_X, RIGHT_PANEL_X]) {
    const cx = panelX + diff.x;
    const cy = PANEL_Y + diff.y;
    ctx.strokeStyle = '#ffc93c';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 7]);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

// The fading red X left by a wrong click, with its time penalty label.
function drawWrongMarks(ctx, levelState, nowMs) {
  levelState.wrongMarks = levelState.wrongMarks.filter((mark) => nowMs - mark.atMs < 900);
  for (const mark of levelState.wrongMarks) {
    const age = (nowMs - mark.atMs) / 900;
    ctx.globalAlpha = 1 - age;
    const cx = mark.panel === 0 ? LEFT_PANEL_X + mark.x : RIGHT_PANEL_X + mark.x;
    const cy = PANEL_Y + mark.y;
    ctx.strokeStyle = '#e8232a';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 11, cy - 11);
    ctx.lineTo(cx + 11, cy + 11);
    ctx.moveTo(cx + 11, cy - 11);
    ctx.lineTo(cx - 11, cy + 11);
    ctx.stroke();
    ctx.fillStyle = '#e8232a';
    ctx.font = '800 15px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('−5s', cx, cy - 18);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }
}
