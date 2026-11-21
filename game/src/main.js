// Eagle Eye — main.js: the game itself. This module owns the screens
// (menu, playing, level complete, game over, victory), the clock, the score,
// the hints, and the wiring between the canvas, the HUD and the buttons.
// Drawing lives in render.js and scenes.js; sounds in audio.js; clicks in
// input.js. A `?shot=` URL parameter pre-sets a mid-game state so the
// screenshots show the game as it is really played.

import { SCENES, PANEL_W, PANEL_H } from './scenes.js';
import { findDifferenceAt, nextHintDifference } from './differences.js';
import { renderGameFrame } from './render.js';
import { wireInput } from './input.js';
import { SoundBank } from './audio.js';
import {
  GAME_PHASES,
  POINTS_PER_FIND,
  TIME_BONUS_PER_SECOND,
  WRONG_CLICK_TIME_PENALTY,
  WRONG_CLICK_SCORE_PENALTY,
  HINTS_PER_LEVEL,
  HINT_REVEAL_MS,
  createLevelState,
  remainingCount,
  levelIsComplete,
  rankForScore,
} from './state.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const el = (id) => document.getElementById(id);
const hud = {
  level: el('levelLabel'),
  scene: el('sceneLabel'),
  timer: el('timerLabel'),
  score: el('scoreLabel'),
  remaining: el('remainingLabel'),
  hints: el('hintsLabel'),
  timerPill: el('timerPill'),
  message: el('messageLine'),
  hintBtn: el('hintBtn'),
  hintCount: el('hintCount'),
  soundBtn: el('soundBtn'),
};

const overlays = {
  menu: el('menuOverlay'),
  levelComplete: el('levelCompleteOverlay'),
  gameOver: el('gameOverOverlay'),
  victory: el('victoryOverlay'),
};

const soundBank = new SoundBank();

const game = {
  phase: GAME_PHASES.MENU,
  levelState: null,
  totalScore: 0,
  selectedLevel: 0,
  lastFrameMs: null,
};

function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

function showOnlyOverlay(name) {
  for (const [key, node] of Object.entries(overlays)) {
    node.classList.toggle('hidden', key !== name);
  }
}

function updateHud() {
  const levelState = game.levelState;
  if (!levelState) return;
  hud.level.textContent = `${levelState.sceneIndex + 1} / ${SCENES.length}`;
  hud.scene.textContent = levelState.scene.name;
  hud.timer.textContent = formatTime(levelState.timeLeftSeconds);
  hud.timerPill.classList.toggle('low', levelState.timeLeftSeconds <= 30);
  // While a level is being played its points are still unbanked, so the HUD
  // shows banked total + this level's points. Once the level is complete
  // (or the whole game is won) those points are already inside totalScore,
  // so adding them again would double-count.
  const levelPointsUnbanked =
    game.phase !== GAME_PHASES.LEVEL_COMPLETE && game.phase !== GAME_PHASES.VICTORY;
  hud.score.textContent = String(game.totalScore + (levelPointsUnbanked ? levelState.levelScore : 0));
  hud.remaining.textContent = String(remainingCount(levelState));
  hud.hints.textContent = String(levelState.hintsLeft);
  hud.hintCount.textContent = String(levelState.hintsLeft);
  hud.hintBtn.disabled = levelState.hintsLeft <= 0 || game.phase !== GAME_PHASES.PLAYING;
}

function setMessage(text) {
  hud.message.textContent = text;
}

function startLevel(sceneIndex) {
  const scene = SCENES[sceneIndex];
  game.levelState = createLevelState(sceneIndex, scene);
  game.phase = GAME_PHASES.PLAYING;
  game.lastFrameMs = null;
  showOnlyOverlay(null);
  setMessage('Click a difference on either picture.');
  updateHud();
  renderGameFrame(ctx, game.levelState, performance.now());
}

function previewLevel(sceneIndex) {
  game.selectedLevel = sceneIndex;
  const scene = SCENES[sceneIndex];
  game.levelState = createLevelState(sceneIndex, scene);
  game.phase = GAME_PHASES.MENU;
  updateHud();
  renderGameFrame(ctx, game.levelState, performance.now());
  document.querySelectorAll('.level-card').forEach((card) => {
    card.classList.toggle('selected', Number(card.dataset.level) === sceneIndex);
  });
  el('startBtn').textContent = `Start Level ${sceneIndex + 1}`;
}

function handleSpotClick(panel, x, y) {
  if (game.phase !== GAME_PHASES.PLAYING || !game.levelState) return;
  soundBank.ensureContext();
  const levelState = game.levelState;
  const diff = findDifferenceAt(levelState.scene.differences, levelState.foundIds, x, y);
  if (diff) {
    levelState.foundIds.add(diff.id);
    levelState.levelScore += POINTS_PER_FIND;
    soundBank.playFound();
    setMessage(`Found: ${diff.label}! +${POINTS_PER_FIND}`);
    updateHud();
    renderGameFrame(ctx, levelState, performance.now());
    if (levelIsComplete(levelState)) finishLevel();
    return;
  }
  levelState.timeLeftSeconds = Math.max(0, levelState.timeLeftSeconds - WRONG_CLICK_TIME_PENALTY);
  levelState.levelScore = Math.max(0, levelState.levelScore - WRONG_CLICK_SCORE_PENALTY);
  levelState.wrongMarks.push({ panel, x, y, atMs: performance.now() });
  soundBank.playWrong();
  setMessage(`Not a difference — ${WRONG_CLICK_TIME_PENALTY} seconds lost.`);
  updateHud();
  renderGameFrame(ctx, levelState, performance.now());
  if (levelState.timeLeftSeconds <= 0) showGameOver();
}

function useHint() {
  if (game.phase !== GAME_PHASES.PLAYING || !game.levelState) return;
  const levelState = game.levelState;
  if (levelState.hintsLeft <= 0) return;
  soundBank.ensureContext();
  const diff = nextHintDifference(levelState.scene.differences, levelState.foundIds, levelState.hintedId);
  if (!diff) return;
  levelState.hintedId = diff.id;
  levelState.hintUntilMs = performance.now() + HINT_REVEAL_MS;
  levelState.hintsLeft -= 1;
  soundBank.playHint();
  setMessage(`Hint: look near the ${diff.label.toLowerCase()}…`);
  updateHud();
}

function finishLevel() {
  const levelState = game.levelState;
  const timeBonus = Math.ceil(levelState.timeLeftSeconds) * TIME_BONUS_PER_SECOND;
  const levelTotal = levelState.levelScore + timeBonus;
  game.totalScore += levelTotal;
  const isLastLevel = levelState.sceneIndex === SCENES.length - 1;
  if (isLastLevel) {
    soundBank.playVictory();
    el('finalScore').textContent = String(game.totalScore);
    el('finalRank').textContent = rankForScore(game.totalScore);
    game.phase = GAME_PHASES.VICTORY;
    showOnlyOverlay('victory');
  } else {
    soundBank.playLevelComplete();
    el('levelCompleteTitle').textContent = 'Level Complete!';
    el('levelCompleteScene').textContent = `${levelState.scene.name} — all ${levelState.scene.differences.length} differences found`;
    el('levelScore').textContent = String(levelState.levelScore);
    el('timeBonus').textContent = String(timeBonus);
    el('totalScoreAfterLevel').textContent = String(game.totalScore);
    el('nextLevelBtn').textContent = `Next Level: ${SCENES[levelState.sceneIndex + 1].name}`;
    game.phase = GAME_PHASES.LEVEL_COMPLETE;
    showOnlyOverlay('levelComplete');
  }
  updateHud();
}

function showGameOver() {
  const levelState = game.levelState;
  game.phase = GAME_PHASES.GAME_OVER;
  soundBank.playGameOver();
  el('gameOverScene').textContent =
    `You found ${levelState.foundIds.size} of ${levelState.scene.differences.length} differences in ${levelState.scene.name}.`;
  showOnlyOverlay('gameOver');
  updateHud();
}

function goToMenu() {
  game.phase = GAME_PHASES.MENU;
  previewLevel(game.selectedLevel);
  showOnlyOverlay('menu');
  setMessage('Pick a level, then press Start.');
}

function advance() {
  soundBank.ensureContext();
  if (game.phase === GAME_PHASES.MENU) startLevel(game.selectedLevel);
  else if (game.phase === GAME_PHASES.LEVEL_COMPLETE) startLevel(game.levelState.sceneIndex + 1);
  else if (game.phase === GAME_PHASES.GAME_OVER) startLevel(game.levelState.sceneIndex);
  else if (game.phase === GAME_PHASES.VICTORY) {
    game.totalScore = 0;
    startLevel(0);
  }
}

// --- the game clock and the render loop -------------------------------------

function gameLoop(nowMs) {
  requestAnimationFrame(gameLoop);
  if (game.lastFrameMs === null) game.lastFrameMs = nowMs;
  const dtSeconds = Math.min(0.25, (nowMs - game.lastFrameMs) / 1000);
  game.lastFrameMs = nowMs;
  if (game.phase === GAME_PHASES.PLAYING && game.levelState) {
    const levelState = game.levelState;
    levelState.timeLeftSeconds -= dtSeconds;
    const whole = Math.ceil(levelState.timeLeftSeconds);
    if (whole !== levelState.lastWholeSecond) {
      levelState.lastWholeSecond = whole;
      if (whole <= 10 && whole > 0) soundBank.playTick();
      updateHud();
    }
    if (levelState.timeLeftSeconds <= 0) {
      levelState.timeLeftSeconds = 0;
      showGameOver();
    }
  }
  if (game.levelState) renderGameFrame(ctx, game.levelState, nowMs);
}

// --- buttons -----------------------------------------------------------------

function wireButtons() {
  el('startBtn').addEventListener('click', () => {
    soundBank.ensureContext();
    soundBank.playClick();
    startLevel(game.selectedLevel);
  });
  document.querySelectorAll('.level-card').forEach((card) => {
    card.addEventListener('click', () => {
      soundBank.ensureContext();
      soundBank.playClick();
      previewLevel(Number(card.dataset.level));
    });
  });
  el('nextLevelBtn').addEventListener('click', () => {
    soundBank.playClick();
    startLevel(game.levelState.sceneIndex + 1);
  });
  el('replayLevelBtn').addEventListener('click', () => {
    soundBank.playClick();
    startLevel(game.levelState.sceneIndex);
  });
  el('retryBtn').addEventListener('click', () => {
    soundBank.playClick();
    startLevel(game.levelState.sceneIndex);
  });
  el('gameOverMenuBtn').addEventListener('click', () => {
    soundBank.playClick();
    goToMenu();
  });
  el('playAgainBtn').addEventListener('click', () => {
    soundBank.playClick();
    game.totalScore = 0;
    startLevel(0);
  });
  el('victoryMenuBtn').addEventListener('click', () => {
    soundBank.playClick();
    game.totalScore = 0;
    goToMenu();
  });
  hud.hintBtn.addEventListener('click', useHint);
  hud.soundBtn.addEventListener('click', () => {
    soundBank.ensureContext();
    soundBank.setMuted(!soundBank.muted);
    hud.soundBtn.textContent = soundBank.muted ? '🔇 Sound: Off' : '🔊 Sound: On';
    if (!soundBank.muted) soundBank.playClick();
  });
  el('restartBtn').addEventListener('click', () => {
    soundBank.playClick();
    startLevel(game.levelState ? game.levelState.sceneIndex : 0);
  });
  el('menuBtn').addEventListener('click', () => {
    soundBank.playClick();
    goToMenu();
  });
}

// --- screenshot setup: ?shot= pre-sets a real mid-game state -----------------
// cover   — Park, 4 of 8 found, 2:30 left (the cover shot).
// kitchen — Kitchen, 3 of 8 found, 2:30 left.
// beach   — Beach, 4 of 8 found, 2:15 left.
// win     — Park, all 8 found, level-complete card on top of the pictures.

const SHOT_PRESETS = {
  cover: { sceneIndex: 0, foundIds: ['sun-face', 'high-cloud', 'flower-colour', 'pond-duck'], timeLeftSeconds: 150 },
  kitchen: { sceneIndex: 1, foundIds: ['clock-hands', 'sleeping-cat', 'pot-lid'], timeLeftSeconds: 150 },
  beach: { sceneIndex: 2, foundIds: ['sun-glasses', 'middle-cloud', 'crab', 'beach-ball'], timeLeftSeconds: 135 },
  win: { sceneIndex: 0, foundIds: null, timeLeftSeconds: 96 },
};

function applyShotPreset() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot || !(shot in SHOT_PRESETS)) return false;
  const preset = SHOT_PRESETS[shot];
  startLevel(preset.sceneIndex);
  const levelState = game.levelState;
  const ids = preset.foundIds ?? levelState.scene.differences.map((diff) => diff.id);
  for (const id of ids) levelState.foundIds.add(id);
  levelState.levelScore = ids.length * POINTS_PER_FIND;
  levelState.timeLeftSeconds = preset.timeLeftSeconds;
  levelState.lastWholeSecond = Math.ceil(preset.timeLeftSeconds);
  updateHud();
  renderGameFrame(ctx, levelState, performance.now());
  if (shot === 'win') finishLevel();
  return true;
}

// --- boot --------------------------------------------------------------------

wireInput(canvas, {
  onSpotClick: handleSpotClick,
  onHint: useHint,
  onToggleMute: () => hud.soundBtn.click(),
  onRestart: () => el('restartBtn').click(),
  onAdvance: advance,
});
wireButtons();
if (!applyShotPreset()) {
  previewLevel(0);
  showOnlyOverlay('menu');
}
requestAnimationFrame(gameLoop);

// Small hook for automated play-testing (Playwright): read the live state
// and click a spot through the same path a real pointer takes.
window.__eagleEye = {
  game,
  remaining: () => (game.levelState ? remainingCount(game.levelState) : 0),
  foundIds: () => (game.levelState ? [...game.levelState.foundIds] : []),
};
