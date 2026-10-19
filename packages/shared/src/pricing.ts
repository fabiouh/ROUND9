/**
 * Proposed plans. Not validated commercial offers: billing, entitlements, tax handling
 * and subscription management are not implemented, so only FREE is `available`.
 */
export interface Plan {
  id: 'FREE' | 'PLUS' | 'CREW';
  priceCents: number;
  currency: 'EUR';
  interval: 'month' | 'year' | null;
  perCrew?: boolean;
  available: boolean;
  /** i18n keys under `pricing.features`. */
  features: string[];
  limits: { maxTournamentPlayers: number; maxCrewMembers: number };
}

export const PLANS: readonly Plan[] = [
  {
    id: 'FREE',
    priceCents: 0,
    currency: 'EUR',
    interval: null,
    available: true,
    features: ['unlimitedRounds', 'friendsCrews', 'liveScorecards', 'tournaments8', 'basicLeaderboards'],
    limits: { maxTournamentPlayers: 8, maxCrewMembers: 30 },
  },
  {
    id: 'PLUS',
    priceCents: 399,
    currency: 'EUR',
    interval: 'month',
    available: false,
    features: ['everythingFree', 'advancedStats', 'expandedTournaments', 'seasonLeaderboards', 'customChallenges'],
    limits: { maxTournamentPlayers: 8, maxCrewMembers: 30 },
  },
  {
    id: 'CREW',
    priceCents: 2999,
    currency: 'EUR',
    interval: 'year',
    perCrew: true,
    available: false,
    features: ['crew30', 'sharedStandings', 'tournamentOrganization', 'flightManagement', 'freeParticipation'],
    limits: { maxTournamentPlayers: 30, maxCrewMembers: 30 },
  },
];

export const FREE_PLAN = PLANS[0]!;
