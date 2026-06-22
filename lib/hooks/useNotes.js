import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotes, fetchNoteById, createNote, updateNote, deleteNote } from '../api/index';
import { useAuth } from '../AuthContext';
import { showToast } from '../toast';
import { handleSupabaseError } from '../api/utils';

export function useNotes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['notes', user?.id],
    queryFn: fetchNotes,
    enabled: !!user,
  });
}

export function useNote(id) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['note', user?.id, id],
    queryFn: () => fetchNoteById(id),
    enabled: !!user && !!id && id !== 'new',
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: createNote,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes', user?.id] }),
    onError: (e) => showToast.saveFailed(handleSupabaseError(e)),
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, updates }) => updateNote(id, updates),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['notes', user?.id] });
      qc.setQueryData(['note', user?.id, data.id], data);
    },
    onError: (e) => showToast.saveFailed(handleSupabaseError(e)),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes', user?.id] }),
    onError: (e) => showToast.saveFailed(handleSupabaseError(e)),
  });
}
