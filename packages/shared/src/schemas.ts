import { z } from 'zod';
import { AVAILABLE_FORMATS, EXPERIENCE_LEVELS, HANDICAP_MAX, HANDICAP_MIN, USERNAME_PATTERN } from './enums.js';
import { FREE_PLAN } from './pricing.js';

// Error messages are i18n keys under `validation.*`.
export const profileSchema = z.object({
  displayName: z.string().trim().min(1, 'required').max(60, 'tooLong'),
  username: z.string().trim().toLowerCase().regex(USERNAME_PATTERN, 'username'),
  country: z.string().length(2, 'country'),
  avatarUrl: z.union([z.url('url').max(500), z.literal('')]).optional(),
});

export const golfProfileSchema = z.object({
  handicapIndex: z
    .union([z.literal(''), z.coerce.number('number').min(HANDICAP_MIN, 'handicapRange').max(HANDICAP_MAX, 'handicapRange')])
    .optional(),
  preferredFormat: z.union([z.enum(AVAILABLE_FORMATS), z.literal('')]).optional(),
  homeCourseId: z.string().optional(),
  experienceLevel: z.union([z.enum(EXPERIENCE_LEVELS), z.literal('')]).optional(),
});

export const crewSchema = z.object({
  name: z.string().trim().min(2, 'tooShort').max(60, 'tooLong'),
  description: z.string().trim().max(500, 'tooLong').optional(),
  avatarUrl: z.union([z.url('url').max(500), z.literal('')]).optional(),
});

export const roundSchema = z.object({
  title: z.string().trim().min(2, 'tooShort').max(80, 'tooLong'),
  courseId: z.string().min(1, 'required'),
  teeId: z.string().optional(),
  scheduledAt: z.string().min(1, 'required'),
  holesCount: z.coerce.number().pipe(z.union([z.literal(9), z.literal(18)])),
  format: z.enum(AVAILABLE_FORMATS),
  crewId: z.string().optional(),
});

export const tournamentSchema = roundSchema.omit({ title: true }).extend({
  name: z.string().trim().min(2, 'tooShort').max(80, 'tooLong'),
  description: z.string().trim().max(1000, 'tooLong').optional(),
  maxParticipants: z.coerce.number().int().min(2, 'participantsMin').max(FREE_PLAN.limits.maxTournamentPlayers, 'participantsMax'),
});

export const courseSchema = z.object({
  name: z.string().trim().min(2, 'tooShort').max(120, 'tooLong'),
  country: z.string().length(2, 'country'),
  city: z.string().trim().max(80, 'tooLong').optional(),
  holes: z
    .array(z.object({ par: z.coerce.number().int().min(3).max(6), strokeIndex: z.coerce.number().int().min(1).max(18) }))
    .refine((h) => h.length === 9 || h.length === 18, 'holesCount')
    .refine((h) => new Set(h.map((x) => x.strokeIndex)).size === h.length && h.every((x) => x.strokeIndex <= h.length), 'strokeIndexUnique'),
  tees: z
    .array(
      z.object({
        name: z.string().trim().min(1, 'required').max(40, 'tooLong'),
        courseRating: z.coerce.number().min(20).max(85),
        slopeRating: z.coerce.number().int().min(55).max(155),
      }),
    )
    .max(8),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type GolfProfileInput = z.infer<typeof golfProfileSchema>;
export type CrewInput = z.infer<typeof crewSchema>;
export type RoundInput = z.infer<typeof roundSchema>;
export type TournamentInput = z.infer<typeof tournamentSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
