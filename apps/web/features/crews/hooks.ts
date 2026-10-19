'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CrewDetail, CrewSummary } from '@/lib/types';

export const useCrews = () => useQuery({ queryKey: ['crews'], queryFn: () => api.get<CrewSummary[]>('/crews') });
export const useCrew = (id: string | null | undefined) =>
  useQuery({ queryKey: ['crew', id], queryFn: () => api.get<CrewDetail>(`/crews/${id}`), enabled: !!id });

export function useCrewMutations(id: string) {
  const qc = useQueryClient();
  const done = () => Promise.all([qc.invalidateQueries({ queryKey: ['crew', id] }), qc.invalidateQueries({ queryKey: ['crews'] })]);
  return {
    update: useMutation({ mutationFn: (body: Record<string, unknown>) => api.patch(`/crews/${id}`, body), onSuccess: done }),
    setRole: useMutation({
      mutationFn: ({ memberId, role }: { memberId: string; role: 'ADMIN' | 'MEMBER' }) => api.patch(`/crews/${id}/members/${memberId}`, { role }),
      onSuccess: done,
    }),
    removeMember: useMutation({ mutationFn: (memberId: string) => api.delete(`/crews/${id}/members/${memberId}`), onSuccess: done }),
    remove: useMutation({ mutationFn: () => api.delete(`/crews/${id}`), onSuccess: done }),
  };
}
