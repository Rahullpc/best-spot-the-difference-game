// Eagle Eye — state.js: the single game-state object and the small helpers
// that move it between screens. Rendering and input read this state; they
// never keep their own copy of it.

export const GAME_PHASES = {
  MENU: 'menu',
  PLAYING: 'playing',
  LEVEL_COMPLETE: 'levelComplete',
  GAME_OVER: 'gameOver',
  VICTORY: 'victory',
};

export const POINTS_PER_FIND = 100;
export const TIME_BONUS_PER_SECOND = 5;
export const WRONG_CLICK_TIME_PENALTY = 5;
export const WRONG_CLICK_SCORE_PENALTY = 10;
export const HINTS_PER_LEVEL = 3;
export const HINT_REVEAL_MS = 3000;

// Build a fresh state for one level of one scene.
export function createLevelState(sceneIndex, scene) {
  return {
    phase: GAME_PHASES.PLAYING,
    sceneIndex,
    scene,
    foundIds: new Set(),
    timeLeftSeconds: scene.timeLimitSeconds,
    hintsLeft: HINTS_PER_LEVEL,
    hintedId: null,
    hintUntilMs: 0,
    wrongMarks: [],
    levelScore: 0,
    lastWholeSecond: scene.timeLimitSeconds,
  };
}

// How many differences of this level are still unfound.
export function remainingCount(levelState) {
  return levelState.scene.differences.length - levelState.foundIds.size;
}

export function levelIsComplete(levelState) {
  return remainingCount(levelState) === 0;
}

// Rank text for the victory screen, from the final total score.
export function rankForScore(totalScore) {
  if (totalScore >= 3400) return 'Rank: Eagle-Eyed Legend';
  if (totalScore >= 2900) return 'Rank: Sharp-Eyed Detective';
  if (totalScore >= 2400) return 'Rank: Keen Observer';
  return 'Rank: Rising Spotter';
}
