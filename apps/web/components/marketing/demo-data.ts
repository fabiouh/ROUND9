import { computeLeaderboard, type ScoringPlayer } from '@round9/shared';
import type { Hole } from '@/lib/types';

// Fictional players and a fictional course used only for marketing previews.
const PARS = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 4, 5];
const SI = [7, 11, 15, 1, 9, 3, 17, 13, 5, 8, 16, 2, 6, 12, 10, 18, 4, 14];
export const DEMO_HOLES: Hole[] = PARS.map((par, i) => ({ holeNumber: i + 1, par, strokeIndex: SI[i]! }));

const OFFSETS: Record<string, number[]> = {
  Lena: [0, 1, 0, -1, 0, 1, 0, 0, 0, 1, 0, 0, -1, 1, 0, 0, 1, 0],
  Jonas: [1, 0, 1, 0, 2, 0, 0, 1, 0, 1, 1, 0, 0, 2, 0, 1, 0, 1],
  Mira: [0, 2, 1, 1, 0, 1, 1, 0, 1, 2, 0, 1, 1, 0, 1, 1, 2, 0],
  Tobias: [2, 1, 1, 2, 1, 0, 2, 1, 1, 1, 2, 1, 0, 1, 2, 1, 1, 2],
  Elif: [1, 2, 0, 1, 2, 1, 1, 2, 1, 0, 1, 2, 2, 1, 1, 0, 2, 1],
  Sam: [2, 2, 1, 1, 2, 2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 1, 2],
};
const HCP: Record<string, number> = { Lena: 6, Jonas: 14, Mira: 18, Tobias: 22, Elif: 20, Sam: 28 };

export const DEMO_PLAYERS: ScoringPlayer[] = Object.entries(OFFSETS).map(([name, off]) => ({
  participantId: name,
  name,
  playingHandicap: HCP[name]!,
  strokes: Object.fromEntries(DEMO_HOLES.map((h, i) => [h.holeNumber, h.par + off[i]!])),
}));

export const DEMO_LEADERBOARD = computeLeaderboard(DEMO_HOLES, DEMO_PLAYERS, 'STABLEFORD');
