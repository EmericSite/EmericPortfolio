// Emericfolio — created by Tomi-Tom, 2026
// How far a carousel card sits from the centred one, counted the short way round

// Shared by the 3D carousel and by the DOM overlays drawn above it: it lives
// here so the overlays do not have to pull three in to compute a rank.

/** Rank of a card relative to the centered one, wrapped the short way round.
 * Only the integer rank wraps: wrapping the continuous value skips a card
 * mid-drag. */
export function wrappedRank(
  index: number,
  scrollIndex: number,
  total: number,
): number {
  let base = index - scrollIndex;
  if (base > total / 2) base -= total;
  if (base < -total / 2) base += total;
  return base;
}
