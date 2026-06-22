import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useProfile, useUpdateProfile, useUploadAvatar } from '../lib/hooks/useProfile';
import { colors, fonts, spacing, radius } from '../lib/theme';
import { showToast } from '../lib/toast';
import ScreenHeader from '../components/layout/ScreenHeader';
import InputField from '../components/ui/InputField';
import PrimaryButton from '../components/ui/PrimaryButton';
import { FormSkeleton } from '../components/ui/SkeletonLoader';

export default function EditProfileScreen() {
  const router = useRouter();
  const { focus } = useLocalSearchParams();
  const { data: profile, isLoading } = useProfile();
  const updateProfileMut = useUpdateProfile();
  const uploadAvatarMut = useUploadAvatar();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUri, setAvatarUri] = useState(null);
  const [pendingAvatarUri, setPendingAvatarUri] = useState(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName ?? '');
      setEmail(profile.email ?? '');
      setUsername(profile.username ?? '');
      setAvatarUri(profile.avatarUri ?? null);
    }
  }, [profile]);

  const changed =
    fullName !== (profile?.fullName ?? '') ||
    email !== (profile?.email ?? '') ||
    username !== (profile?.username ?? '') ||
    pendingAvatarUri !== null;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPendingAvatarUri(result.assets[0].uri);
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      if (pendingAvatarUri) {
        await uploadAvatarMut.mutateAsync(pendingAvatarUri);
        setPendingAvatarUri(null);
      }
      await updateProfileMut.mutateAsync({ fullName, email, username });
      showToast.profileUpdated();
      router.back();
    } catch {
      // toast handled by mutation
    }
  };

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Edit Profile" />
        <FormSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Edit Profile"
        rightLabel="Save"
        onRightPress={handleSave}
        rightDisabled={!changed}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.avatarSection}>
            <View style={styles.avatarRing}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.initials}>{profile?.initials ?? '?'}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={pickImage}>
              <Text style={styles.changePhoto}>Change photo</Text>
            </TouchableOpacity>
          </View>

          <InputField label="Full Name" value={fullName} onChangeText={setFullName} placeholder="Your full name" autoFocus={focus === 'name'} />
          <InputField label="Email" value={email} onChangeText={setEmail} placeholder="your@email.com" keyboardType="email-address" autoCapitalize="none" autoFocus={focus === 'email'} />
          <InputField label="Username" value={username} onChangeText={setUsername} placeholder="@username" autoCapitalize="none" autoFocus={focus === 'username'} />
          <Text style={styles.helper}>This is how others find you in Community</Text>

          <PrimaryButton title="Save Changes" onPress={handleSave} disabled={!changed} style={styles.saveBtn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.app },
  flex: { flex: 1 },
  scroll: { padding: spacing.screenH, gap: 16, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', gap: 10, marginBottom: 8 },
  avatarRing: {
    borderWidth: 3,
    borderColor: colors.primary[400],
    borderRadius: 47,
    padding: 2,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: { fontSize: 28, fontFamily: fonts.bold, color: colors.primary[800] },
  changePhoto: { fontSize: 13, fontFamily: fonts.medium, color: colors.primary[500] },
  helper: { fontSize: 11, fontFamily: fonts.regular, color: colors.gray[400], marginTop: -8 },
  saveBtn: { marginTop: 8 },
});
