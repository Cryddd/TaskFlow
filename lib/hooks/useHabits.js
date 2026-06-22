import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchHabits,
  fetchHabitCompletions,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabit,
} from '../api/index';
import { useAuth } from '../AuthContext';
import { showToast } from '../toast';
import { handleSupabaseError } from '../api/utils';

export function useHabits() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['habits', user?.id],
    queryFn: fetchHabits,
    enabled: !!user,
  });
}

export function useHabitCompletions(habitId, days = 84) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['habitCompletions', user?.id, habitId, days],
    queryFn: () => fetchHabitCompletions(habitId, days),
    enabled: !!user && !!habitId,
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: createHabit,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits', user?.id] }),
    onError: (e) => showToast.saveFailed(handleSupabaseError(e)),
  });
}

export function useUpdateHabit() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, updates }) => updateHabit(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits', user?.id] }),
    onError: (e) => showToast.saveFailed(handleSupabaseError(e)),
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: deleteHabit,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits', user?.id] }),
    onError: (e) => showToast.saveFailed(handleSupabaseError(e)),
  });
}

export function useToggleHabit() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: toggleHabit,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['habits', user?.id] });
      const prev = qc.getQueryData(['habits', user?.id]);
      qc.setQueryData(['habits', user?.id], (old) =>
        old?.map((h) =>
          h.id === id ? { ...h, completedToday: !h.completedToday } : h
        )
      );
      return { prev };
    },
    onError: (e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['habits', user?.id], ctx.prev);
      showToast.saveFailed(handleSupabaseError(e));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['habits', user?.id] }),
  });
}
