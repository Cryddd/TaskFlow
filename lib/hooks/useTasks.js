import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
  toggleSubtask,
  getSuggestedTasks,
  getDailyStats,
  getOverdueCount,
} from '../api/tasks';
import { useAuth } from '../AuthContext';
import { showToast } from '../toast';
import { handleSupabaseError } from '../api/utils';

export function useTasks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: fetchTasks,
    enabled: !!user,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', user?.id] }),
    onError: (e) => showToast.saveFailed(handleSupabaseError(e)),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, updates }) => updateTask(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', user?.id] }),
    onError: (e) => showToast.saveFailed(handleSupabaseError(e)),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', user?.id] }),
    onError: (e) => showToast.saveFailed(handleSupabaseError(e)),
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: toggleTask,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['tasks', user?.id] });
      const prev = qc.getQueryData(['tasks', user?.id]);
      qc.setQueryData(['tasks', user?.id], (old) =>
        old?.map((t) =>
          t.id === id
            ? { ...t, completed: !t.completed, status: !t.completed ? 'completed' : 'pending' }
            : t
        )
      );
      return { prev };
    },
    onError: (e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['tasks', user?.id], ctx.prev);
      showToast.saveFailed(handleSupabaseError(e));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks', user?.id] }),
  });
}

export function useToggleSubtask() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ taskId, subtaskId }) => toggleSubtask(taskId, subtaskId),
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks', user?.id] }),
    onError: (e) => showToast.saveFailed(handleSupabaseError(e)),
  });
}

export { getSuggestedTasks, getDailyStats, getOverdueCount };
