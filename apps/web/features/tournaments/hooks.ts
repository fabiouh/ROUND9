'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRoundInvalidation } from '@/features/rounds/hooks';
import { api } from '@/lib/api';
import type { TournamentDetail, TournamentSummary } from '@/lib/types';

export const useTournaments = () => useQuery({ queryKey: ['tournaments'], queryFn: () => api.get<TournamentSummary[]>('/tournaments') });

export const useTournament = (id: string) =>
  useQuery({
    queryKey: ['tournament', id],
    queryFn: () => api.get<TournamentDetail>(`/tournaments/${id}`),
    refetchInterval: (q) => (q.state.data?.status === 'LIVE' ? 15_000 : false),
  });

export function useUpdateTournament(id: string) {
  const invalidate = useRoundInvalidation();
  return useMutation({ mutationFn: (body: Record<string, unknown>) => api.patch(`/tournaments/${id}`, body), onSuccess: invalidate });
}
