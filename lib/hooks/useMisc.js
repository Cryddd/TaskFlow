import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNutrition, addMealItem, logFocusSession, fetchTemplateAdditions, markTemplateAdded, submitBugReport } from '../api/index';
import { useAuth } from '../AuthContext';
import { showToast } from '../toast';
import { handleSupabaseError } from '../api/utils';

export function useNutrition(date) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['nutrition', user?.id, date],
    queryFn: () => fetchNutrition(date),
    enabled: !!user,
  });
}

export function useAddMealItem() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: addMealItem,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['nutrition', user?.id, vars.date] });
    },
    onError: (e) => showToast.saveFailed(handleSupabaseError(e)),
  });
}

export function useLogFocusSession() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: logFocusSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', user?.id] }),
    onError: (e) => showToast.saveFailed(handleSupabaseError(e)),
  });
}

export function useTemplateAdditions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['templateAdditions', user?.id],
    queryFn: fetchTemplateAdditions,
    enabled: !!user,
  });
}

export function useMarkTemplateAdded() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: markTemplateAdded,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templateAdditions', user?.id] }),
    onError: (e) => showToast.saveFailed(handleSupabaseError(e)),
  });
}

export function useSubmitBugReport() {
  return useMutation({
    mutationFn: submitBugReport,
    onSuccess: () => showToast.reportSent(),
    onError: (e) => showToast.saveFailed(handleSupabaseError(e)),
  });
}
