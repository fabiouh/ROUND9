'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { InvitationLink, Leaderboard, RoundDetail, RoundSummary } from '@/lib/types';

export const useRounds = (scope: 'upcoming' | 'completed') =>
  useQuery({ queryKey: ['rounds', scope], queryFn: () => api.get<RoundSummary[]>(`/rounds?scope=${scope}`) });

export const useRound = (id: string) =>
  useQuery({
    queryKey: ['round', id],
    queryFn: () => api.get<RoundDetail>(`/rounds/${id}`),
    // Live rounds refresh so the leaderboard follows the group.
    refetchInterval: (q) => (q.state.data?.status === 'IN_PROGRESS' ? 15_000 : false),
  });

/** Invalidates everything a round change can affect (round, its tournament, lists). */
export function useRoundInvalidation() {
  const qc = useQueryClient();
  return () =>
    Promise.all(['round', 'rounds', 'tournament', 'tournaments'].map((k) => qc.invalidateQueries({ queryKey: [k] })));
}

export function usePutScores(roundId: string) {
  const invalidate = useRoundInvalidation();
  return useMutation({
    mutationFn: (body: { participantId: string; scores: { holeNumber: number; strokes: number | null }[] }) =>
      api.put<Leaderboard>(`/rounds/${roundId}/scores`, body),
    onSuccess: invalidate,
  });
}

/** `base` is `/rounds/:id`, `/tournaments/:id` or `/crews/:id`. */
export const useCreateInvite = (base: string) =>
  useMutation({ mutationFn: (invitedEmail?: string) => api.post<InvitationLink>(`${base}/invitations`, invitedEmail ? { invitedEmail } : {}) });

export function useAddParticipant(base: string) {
  const invalidate = useRoundInvalidation();
  return useMutation({ mutationFn: (userId: string) => api.post(`${base}/participants`, { userId }), onSuccess: invalidate });
}

export function useRemoveParticipant(roundId: string) {
  const invalidate = useRoundInvalidation();
  return useMutation({ mutationFn: (participantId: string) => api.delete(`/rounds/${roundId}/participants/${participantId}`), onSuccess: invalidate });
}

export function useUpdateRound(roundId: string) {
  const invalidate = useRoundInvalidation();
  return useMutation({ mutationFn: (body: Record<string, unknown>) => api.patch(`/rounds/${roundId}`, body), onSuccess: invalidate });
}
