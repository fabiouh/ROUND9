export const ROUND_FORMATS = ['STROKE_PLAY', 'STABLEFORD', 'MATCH_PLAY'] as const;
export type RoundFormat = (typeof ROUND_FORMATS)[number];

/** Formats with a tested scoring implementation. Others are shown as "upcoming". */
export const AVAILABLE_FORMATS = ['STROKE_PLAY', 'STABLEFORD'] as const satisfies readonly RoundFormat[];
export type AvailableFormat = (typeof AVAILABLE_FORMATS)[number];

export const ROUND_STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
export type RoundStatus = (typeof ROUND_STATUSES)[number];

export const TOURNAMENT_STATUSES = ['UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED'] as const;
export type TournamentStatus = (typeof TOURNAMENT_STATUSES)[number];

export const CREW_ROLES = ['OWNER', 'ADMIN', 'MEMBER'] as const;
export type CrewRole = (typeof CREW_ROLES)[number];

export const EXPERIENCE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const HOLES_COUNTS = [9, 18] as const;
export type HolesCount = (typeof HOLES_COUNTS)[number];

export const HANDICAP_MIN = -10;
export const HANDICAP_MAX = 54;
export const USERNAME_PATTERN = /^[a-z0-9_]{3,24}$/;
