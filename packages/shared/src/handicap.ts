import type { HolesCount, RoundFormat } from './enums.js';

export interface TeeRating {
  courseRating: number;
  slopeRating: number;
  /** Par of the full 18-hole course. */
  par: number;
}

/** WHS recommended handicap allowances for individual formats. */
const ALLOWANCE: Record<RoundFormat, number> = {
  STROKE_PLAY: 0.95,
  STABLEFORD: 0.95,
  MATCH_PLAY: 1,
};

/**
 * WHS course handicap: HI × (Slope / 113) + (CR − Par).
 * shortcut: 9-hole rounds derive CR/par by halving 18-hole tee values; store dedicated 9-hole ratings when courses provide them.
 */
export function courseHandicap(handicapIndex: number, tee: TeeRating, holes: HolesCount, playedPar: number): number {
  const hi = holes === 9 ? handicapIndex / 2 : handicapIndex;
  const cr = holes === 9 ? tee.courseRating / 2 : tee.courseRating;
  return Math.round(hi * (tee.slopeRating / 113) + (cr - playedPar));
}

export function playingHandicap(courseHcp: number, format: RoundFormat): number {
  return Math.round(courseHcp * ALLOWANCE[format]);
}

/**
 * Strokes received on a hole, given its stroke-index rank within the played holes (1 = hardest).
 * Plus handicaps (negative) give strokes back starting at the easiest hole.
 */
export function strokesReceived(playingHcp: number, rank: number, holeCount: number): number {
  const n = Math.abs(playingHcp);
  const base = Math.floor(n / holeCount);
  const extra = n % holeCount;
  if (playingHcp >= 0) return base + (rank <= extra ? 1 : 0);
  return 0 - (base + (rank > holeCount - extra ? 1 : 0)) || 0;
}

/** Rank holes by stroke index so 9-hole rounds allocate strokes 1..9. */
export function strokeIndexRanks(strokeIndexes: number[]): number[] {
  const order = strokeIndexes.map((si, i) => ({ si, i })).sort((a, b) => a.si - b.si);
  const ranks = new Array<number>(strokeIndexes.length);
  order.forEach(({ i }, pos) => (ranks[i] = pos + 1));
  return ranks;
}
