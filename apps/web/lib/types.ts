import type { AvailableFormat, CrewRole, ExperienceLevel, LeaderboardRow, RoundStatus, TournamentStatus } from '@round9/shared';

/** Response shapes of the ROUND9 API (subset the web app reads). */

export interface PublicUser {
  id: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
}

export interface GolfProfile {
  handicapIndex: string | null;
  preferredFormat: AvailableFormat | null;
  experienceLevel: ExperienceLevel | null;
  homeCourseId: string | null;
  homeCourse: { id: string; name: string } | null;
}

export interface Me extends PublicUser {
  email: string | null;
  country: string | null;
  onboardingStep: number;
  onboardingCompleted: boolean;
  showHandicapToCrews: boolean;
  notifyInvitations: boolean;
  notifyScores: boolean;
  golfProfile: GolfProfile | null;
}

export interface Stats {
  roundsCompleted: number;
  bestGross18: number | null;
  averageStablefordPoints: number | null;
  tournaments: number;
  crews: number;
}

export interface CourseSummary {
  id: string;
  name: string;
  city: string | null;
  country: string;
  _count: { holes: number };
  tees: { id: string; name: string }[];
}

export interface Hole {
  holeNumber: number;
  par: number;
  strokeIndex: number;
}

export interface Tee {
  id: string;
  name: string;
  courseRating: string;
  slopeRating: number;
}

export interface Course extends Omit<CourseSummary, '_count' | 'tees'> {
  holes: Hole[];
  tees: Tee[];
}

export interface RoundSummary {
  id: string;
  title: string;
  scheduledAt: string;
  holesCount: 9 | 18;
  format: AvailableFormat | 'MATCH_PLAY';
  status: RoundStatus;
  course: { id: string; name: string; city: string | null };
  crew: { id: string; name: string } | null;
  _count: { participants: number };
  /** Caller's total strokes; only on round lists, null unless the card is complete. */
  myStrokes?: number | null;
}

export interface Participant {
  id: string;
  userId: string;
  playingHandicap: number | null;
  user: PublicUser;
  scores: { holeNumber: number; strokes: number | null }[];
}

export interface RoundDetail extends RoundSummary {
  creatorId: string;
  creator: PublicUser;
  tee: Tee | null;
  tournament: { id: string; name: string } | null;
  participants: Participant[];
  holes: Hole[];
  leaderboard: LeaderboardRow[];
  myParticipantId: string | null;
  canManage: boolean;
}

export interface Leaderboard {
  format: RoundSummary['format'];
  holes: Hole[];
  rows: LeaderboardRow[];
}

export interface TournamentSummary {
  id: string;
  name: string;
  description: string | null;
  status: TournamentStatus;
  maxParticipants: number;
  round: RoundSummary;
}

export interface TournamentDetail extends Omit<TournamentSummary, 'round'> {
  round: RoundDetail;
  canManage: boolean;
}

export interface CrewSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  myRole: CrewRole;
  _count: { members: number; rounds: number; tournaments: number };
}

export interface CrewMember {
  id: string;
  userId: string;
  role: CrewRole;
  joinedAt: string;
  handicapIndex: string | null;
  user: PublicUser;
}

export interface CrewDetail extends Omit<CrewSummary, '_count'> {
  members: CrewMember[];
  rounds: Omit<RoundSummary, 'crew'>[];
  tournaments: { id: string; name: string; status: TournamentStatus; round: { scheduledAt: string } }[];
}

export interface InvitationLink {
  token: string;
  url: string;
  expiresAt: string;
}

export interface InvitationPreview {
  type: 'crew' | 'round' | 'tournament';
  name: string;
  scheduledAt: string | null;
  invitedBy: string | null;
  expiresAt: string;
}
