import { describe, expect, it } from 'vitest';
import { courseHandicap, playingHandicap, strokeIndexRanks, strokesReceived } from './handicap.js';
import { computeLeaderboard, stablefordPoints, type ScoringHole } from './scoring.js';

const holes18: ScoringHole[] = Array.from({ length: 18 }, (_, i) => ({ holeNumber: i + 1, par: 4, strokeIndex: i + 1 }));

describe('handicap', () => {
  it('computes WHS course handicap', () => {
    // 12.4 × 128/113 + (71.2 − 72) = 13.25 → 13
    expect(courseHandicap(12.4, { courseRating: 71.2, slopeRating: 128, par: 72 }, 18, 72)).toBe(13);
  });

  it('applies 95% allowance', () => {
    expect(playingHandicap(20, 'STABLEFORD')).toBe(19);
  });

  it('allocates strokes by stroke index', () => {
    expect(strokesReceived(20, 1, 18)).toBe(2);
    expect(strokesReceived(20, 2, 18)).toBe(2);
    expect(strokesReceived(20, 3, 18)).toBe(1);
    expect(strokesReceived(0, 1, 18)).toBe(0);
  });

  it('gives back strokes for plus handicaps on easiest holes', () => {
    expect(strokesReceived(-2, 18, 18)).toBe(-1);
    expect(strokesReceived(-2, 17, 18)).toBe(-1);
    expect(strokesReceived(-2, 16, 18)).toBe(0);
  });

  it('ranks 9-hole stroke indexes', () => {
    expect(strokeIndexRanks([7, 1, 15, 3])).toEqual([3, 1, 4, 2]);
  });
});

describe('stableford', () => {
  it('scores points', () => {
    expect(stablefordPoints(4, 4, 0)).toBe(2);
    expect(stablefordPoints(4, 5, 1)).toBe(2);
    expect(stablefordPoints(4, 3, 0)).toBe(3);
    expect(stablefordPoints(4, 8, 0)).toBe(0);
    expect(stablefordPoints(4, null, 1)).toBe(0);
  });
});

describe('leaderboard', () => {
  const all = (n: number) => Object.fromEntries(holes18.map((h) => [h.holeNumber, n]));

  it('ranks stroke play by net to par with shared ties', () => {
    const rows = computeLeaderboard(
      holes18,
      [
        { participantId: 'a', name: 'Ana', playingHandicap: 18, strokes: all(5) },
        { participantId: 'b', name: 'Ben', playingHandicap: 0, strokes: all(4) },
        { participantId: 'c', name: 'Cy', playingHandicap: 0, strokes: all(5) },
      ],
      'STROKE_PLAY',
    );
    expect(rows.map((r) => [r.participantId, r.position, r.netToPar])).toEqual([
      ['a', 1, 0],
      ['b', 1, 0],
      ['c', 3, 18],
    ]);
    expect(rows[0]!.gross).toBe(90);
  });

  it('ranks stableford by points and handles pick-ups', () => {
    const picked = { ...all(4), 1: null };
    const rows = computeLeaderboard(
      holes18,
      [
        { participantId: 'a', name: 'Ana', playingHandicap: 0, strokes: picked },
        { participantId: 'b', name: 'Ben', playingHandicap: 0, strokes: all(4) },
      ],
      'STABLEFORD',
    );
    expect(rows.map((r) => [r.participantId, r.points])).toEqual([
      ['b', 36],
      ['a', 34],
    ]);
    expect(rows[1]!.gross).toBeNull();
  });

  it('tracks thru for partial rounds and sorts unplayed last', () => {
    const rows = computeLeaderboard(
      holes18,
      [
        { participantId: 'a', name: 'Ana', playingHandicap: null, strokes: {} },
        { participantId: 'b', name: 'Ben', playingHandicap: null, strokes: { 1: 3, 2: 4 } },
      ],
      'STROKE_PLAY',
    );
    expect(rows[0]).toMatchObject({ participantId: 'b', thru: 2, grossToPar: -1, complete: false });
    expect(rows[1]).toMatchObject({ participantId: 'a', thru: 0, position: 2, gross: null });
  });
});
