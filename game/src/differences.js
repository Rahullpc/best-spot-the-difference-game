// Eagle Eye — differences.js: the difference model. A difference is a data
// record (id, label, x, y, click radius, kind) from scenes.js. This module
// answers the only two questions gameplay asks: "did this click land on an
// unfound difference?" and "which difference is still hiding?" — so the
// drawing code and the input code never duplicate the geometry.

// Find the first unfound difference within its click radius of (x, y).
// Coordinates are in panel space (0..PANEL_W, 0..PANEL_H). A click counts if
// it lands inside the circle; the radius is generous on purpose, because a
// spot-the-difference click should reward finding the thing, not pixel aim.
export function findDifferenceAt(differences, foundIds, x, y) {
  for (const diff of differences) {
    if (foundIds.has(diff.id)) continue;
    const dx = x - diff.x;
    const dy = y - diff.y;
    if (dx * dx + dy * dy <= diff.r * diff.r) return diff;
  }
  return null;
}

// The differences a hint may reveal: the ones still unfound, in scene order.
export function unfoundDifferences(differences, foundIds) {
  return differences.filter((diff) => !foundIds.has(diff.id));
}

// Pick the next difference a hint reveals. The hint walks the scene in
// order, so a player who uses all three hints sees three different spots.
export function nextHintDifference(differences, foundIds, hintedId) {
  const unfound = unfoundDifferences(differences, foundIds);
  if (unfound.length === 0) return null;
  if (!hintedId) return unfound[0];
  const at = unfound.findIndex((diff) => diff.id === hintedId);
  if (at === -1) return unfound[0];
  return unfound[(at + 1) % unfound.length];
}
