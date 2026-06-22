import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProfile,
  fetchProfileStats,
  updateProfile,
  uploadAvatar,
  fetchSettings,
  updateNotificationSettings,
  updatePrivacySettings,
  changePassword,
  deleteAccount,
} from '../api/index';
import { useAuth } from '../AuthContext';
import { showToast } from '../toast';
import { handleSupabaseError } from '../api/utils';

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: fetchProfile,
    enabled: !!user,
  });
}

export function useProfileStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['profileStats', user?.id],
    queryFn: fetchProfileStats,
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile', user?.id] }),
    onError: (e) => showToast.saveFailed(handleSupabaseError(e)),
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile', user?.id] }),
    onError: (e) => showToast.saveFailed(handleSupabaseError(e)),
  });
}

export function useSettings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['settings', user?.id],
    queryFn: fetchSettings,
    enabled: !!user,
  });
}

export function useUpdateNotificationSettings() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings', user?.id] }),
    onError: (e) => showToast.saveFailed(handleSupabaseError(e)),
  });
}

export function useUpdatePrivacySettings() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: updatePrivacySettings,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings', user?.id] }),
    onError: (e) => showToast.saveFailed(handleSupabaseError(e)),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ current, newPassword }) => changePassword(current, newPassword),
    onSuccess: () => showToast.passwordUpdated(),
    onError: (e) => showToast.saveFailed(handleSupabaseError(e)),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  const { signOut } = useAuth();
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      qc.clear();
      await signOut();
    },
    onError: (e) => showToast.saveFailed(handleSupabaseError(e)),
  });
}
