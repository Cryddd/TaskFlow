import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGoals, createGoal, updateGoal, deleteGoal } from '../api/index';
import { useAuth } from '../AuthContext';
import { showToast } from '../toast';
import { handleSupabaseError } from '../api/utils';

export function useGoals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['goals', user?.id],
    queryFn: fetchGoals,
    enabled: !!user,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: createGoal,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals', user?.id] }),
    onError: (e) => showToast.saveFailed(handleSupabaseError(e)),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, updates }) => updateGoal(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals', user?.id] }),
    onError: (e) => showToast.saveFailed(handleSupabaseError(e)),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals', user?.id] }),
    onError: (e) => showToast.saveFailed(handleSupabaseError(e)),
  });
}
