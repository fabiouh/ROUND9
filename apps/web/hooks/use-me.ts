'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { GolfProfile, Me } from '@/lib/types';

export const useMe = () => useQuery({ queryKey: ['me'], queryFn: () => api.get<Me>('/users/me') });

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Me>) => api.patch<Me>('/users/me', body),
    onSuccess: (me) => qc.setQueryData(['me'], me),
  });
}

export function useUpdateGolfProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.put<GolfProfile>('/profiles/me/golf', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}
