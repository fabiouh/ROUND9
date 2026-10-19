import type { AvailableFormat } from './enums.js';
import { strokeIndexRanks, strokesReceived } from './handicap.js';

export interface ScoringHole {
  holeNumber: number;
  par: number;
  strokeIndex: number;
}

export interface ScoringPlayer {
  participantId: string;
  name: string;
  playingHandicap: number | null;
  /** Strokes keyed by hole number. Missing = not yet played; 0 or null = picked up / no score. */
  strokes: Record<number, number | null | undefined>;
}

export interface LeaderboardRow {
  participantId: string;
  name: string;
  position: number;
  thru: number;
  gross: number | null;
  /** Gross minus par over completed holes. */
  grossToPar: number | null;
  /** Net to par over completed holes, using strokes received per hole. */
  netToPar: number | null;
  points: number | null;
  complete: boolean;
}

export function stablefordPoints(par: number, strokes: number | null | undefined, received: number): number {
  if (!strokes) return 0;
  return Math.max(0, 2 + par + received - strokes);
}

export function computeLeaderboard(holes: ScoringHole[], players: ScoringPlayer[], format: AvailableFormat): LeaderboardRow[] {
  const ranks = strokeIndexRanks(holes.map((h) => h.strokeIndex));

  const rows = players.map((p) => {
    const hcp = p.playingHandicap ?? 0;
    let thru = 0;
    let gross = 0;
    let par = 0;
    let received = 0;
    let points = 0;
    let pickedUp = false;

    holes.forEach((hole, i) => {
      const s = p.strokes[hole.holeNumber];
      if (s === undefined) return;
      const r = strokesReceived(hcp, ranks[i]!, holes.length);
      thru++;
      points += stablefordPoints(hole.par, s, r);
      if (!s) {
        pickedUp = true;
        return;
      }
      gross += s;
      par += hole.par;
      received += r;
    });

    const strokeValid = thru > 0 && !pickedUp;
    return {
      participantId: p.participantId,
      name: p.name,
      position: 0,
      thru,
      gross: strokeValid ? gross : null,
      grossToPar: strokeValid ? gross - par : null,
      netToPar: strokeValid ? gross - par - received : null,
      points: format === 'STABLEFORD' && thru > 0 ? points : null,
      complete: thru === holes.length,
    };
  });

  // Players without a valid score sort last; ties share a position.
  const key = (r: LeaderboardRow) =>
    format === 'STABLEFORD' ? (r.points === null ? Infinity : -r.points) : (r.netToPar ?? Infinity);
  rows.sort((a, b) => key(a) - key(b) || b.thru - a.thru || a.name.localeCompare(b.name));
  rows.forEach((r, i) => {
    const prev = rows[i - 1];
    r.position = prev && key(prev) === key(r) && key(r) !== Infinity ? prev.position : i + 1;
  });
  return rows;
}
