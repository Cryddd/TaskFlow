import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  Easing,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useProfile, useUpdateProfile, useUploadAvatar } from '../lib/hooks/useProfile';
import { useMotion } from '../lib/useMotion';
import { colors, brand, fonts, spacing, radius, shadows } from '../lib/theme';
import { showToast } from '../lib/toast';
import ScreenHeader from '../components/layout/ScreenHeader';
import InputField from '../components/ui/InputField';
import { FormSkeleton } from '../components/ui/SkeletonLoader';

// ease-out-expo — enter/settle grammar (motion skill §3)
const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export default function EditProfileScreen() {
  const router = useRouter();
  const { focus } = useLocalSearchParams();
  const { data: profile, isLoading } = useProfile();
  const updateProfileMut = useUpdateProfile();
  const uploadAvatarMut = useUploadAvatar();
  const { animate } = useMotion();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUri, setAvatarUri] = useState(null);
  const [pendingAvatarUri, setPendingAvatarUri] = useState(null);
  const [pendingRemoval, setPendingRemoval] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName ?? '');
      setEmail(profile.email ?? '');
      setUsername(profile.username ?? '');
      setAvatarUri(profile.avatarUri ?? null);
    }
  }, [profile]);

  // ── Validation ────────────────────────────────────────
  const nameValid = fullName.trim().length > 0;
  const emailValid = EMAIL_RE.test(email.trim());
  const usernameValid = !username.trim() || USERNAME_RE.test(username.trim().toLowerCase());
  const isValid = nameValid && emailValid && usernameValid;

  const nameError = attempted && !nameValid ? 'Name is required' : undefined;
  const emailError = email.trim() && !emailValid
    ? 'Enter a valid email address'
    : attempted && !email.trim() ? 'Email is required' : undefined;
  const usernameError = username.trim() && !usernameValid
    ? '3–20 characters: a–z, 0–9, underscore' : undefined;

  const changed =
    fullName !== (profile?.fullName ?? '') ||
    email !== (profile?.email ?? '') ||
    username !== (profile?.username ?? '') ||
    pendingAvatarUri !== null ||
    pendingRemoval;

  const canSave = changed && isValid && !saving && !saved;

  // ── Motion: content entrance (crossfade+lift, reduce = instant) ──
  const intro = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!animate) { intro.setValue(1); return; }
    Animated.timing(intro, {
      toValue: 1, duration: 320, delay: 40, easing: EASE_OUT, useNativeDriver: true,
    }).start();
  }, [animate]);
  const introStyle = {
    opacity: intro,
    transform: [{ translateY: animate ? intro.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) : 0 }],
  };

  // ── Motion: avatar press micro-interaction ──────────────
  const avatarScale = useRef(new Animated.Value(1)).current;
  const pressAvatar = (to) =>
    Animated.timing(avatarScale, {
      toValue: to, duration: to < 1 ? 90 : 150, easing: EASE_OUT, useNativeDriver: true,
    }).start();

  // ── Avatar actions ─────────────────────────────────────
  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Photo access needed',
        'Allow photo library access in Settings to choose a profile picture.',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPendingAvatarUri(result.assets[0].uri);
      setPendingRemoval(false);
      setAvatarUri(result.assets[0].uri);
      setSaved(false);
    }
  };

  const removePhoto = () => {
    setPendingAvatarUri(null);
    setPendingRemoval(true);
    setAvatarUri(null);
    setSaved(false);
  };

  const onAvatarPress = () => {
    const options = [{ text: 'Choose from library', onPress: pickImage }];
    if (avatarUri) options.push({ text: 'Remove photo', style: 'destructive', onPress: removePhoto });
    options.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Profile photo', undefined, options);
  };

  // ── Save ───────────────────────────────────────────────
  const handleSave = async () => {
    setAttempted(true);
    if (!changed || !isValid || saving || saved) return;
    setSaving(true);
    try {
      if (pendingAvatarUri) {
        await uploadAvatarMut.mutateAsync(pendingAvatarUri);
      } else if (pendingRemoval) {
        await updateProfileMut.mutateAsync({ avatarUrl: null });
      }
      await updateProfileMut.mutateAsync({
        fullName: fullName.trim(),
        email: email.trim(),
        username: username.trim().toLowerCase(),
      });
      setPendingAvatarUri(null);
      setPendingRemoval(false);
      setSaved(true);
      showToast.profileUpdated();
      setTimeout(() => router.back(), 600);
    } catch {
      // toast handled by the mutation's onError
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Edit profile" />
        <FormSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Edit profile"
        rightLabel="Save"
        onRightPress={handleSave}
        rightDisabled={!canSave}
      />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View style={introStyle}>
            {/* Avatar hero */}
            <View style={styles.avatarSection}>
              <Pressable
                onPress={onAvatarPress}
                onPressIn={() => pressAvatar(0.96)}
                onPressOut={() => pressAvatar(1)}
                accessibilityRole="button"
                accessibilityLabel="Change profile photo"
              >
                <Animated.View style={[styles.avatarRing, { transform: [{ scale: avatarScale }] }]}>
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Text style={styles.initials}>{profile?.initials ?? '?'}</Text>
                    </View>
                  )}
                  <View style={styles.cameraBadge}>
                    <MaterialIcons name="photo-camera" size={16} color={brand.canvas} />
                  </View>
                  {saving && (pendingAvatarUri || pendingRemoval) && (
                    <View style={styles.avatarOverlay}>
                      <ActivityIndicator color={brand.canvas} />
                    </View>
                  )}
                </Animated.View>
              </Pressable>

              <View style={styles.avatarActions}>
                <TouchableOpacity onPress={pickImage} hitSlop={8}>
                  <Text style={styles.changePhoto}>{avatarUri ? 'Change photo' : 'Add a photo'}</Text>
                </TouchableOpacity>
                {avatarUri && (
                  <>
                    <View style={styles.dot} />
                    <TouchableOpacity onPress={removePhoto} hitSlop={8}>
                      <Text style={styles.removePhoto}>Remove</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            {/* Fields */}
            <View style={styles.form}>
              <InputField
                label="Full name"
                value={fullName}
                onChangeText={(t) => { setFullName(t); setSaved(false); }}
                placeholder="Your full name"
                error={nameError}
                autoFocus={focus === 'name'}
                returnKeyType="next"
              />
              <InputField
                label="Email"
                value={email}
                onChangeText={(t) => { setEmail(t); setSaved(false); }}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={emailError}
                autoFocus={focus === 'email'}
                returnKeyType="next"
              />
              <InputField
                label="Username"
                value={username}
                onChangeText={(t) => { setUsername(t); setSaved(false); }}
                placeholder="@username"
                autoCapitalize="none"
                autoCorrect={false}
                error={usernameError}
                autoFocus={focus === 'username'}
                returnKeyType="done"
              />
              <Text style={styles.helper}>Your username is how others find you in Community.</Text>
            </View>

            {/* Save */}
            <TouchableOpacity
              style={[
                styles.saveBtn,
                saved && styles.saveBtnDone,
                !canSave && !saved && styles.saveBtnDisabled,
              ]}
              activeOpacity={0.9}
              disabled={!canSave && !saved}
              onPress={handleSave}
            >
              {saving ? (
                <ActivityIndicator color={brand.canvas} />
              ) : saved ? (
                <>
                  <MaterialIcons name="check" size={18} color={brand.canvas} />
                  <Text style={styles.saveText}>Saved</Text>
                </>
              ) : (
                <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>Save changes</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const AVATAR = 108;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.app },
  flex: { flex: 1 },
  scroll: { padding: spacing.screenH, paddingBottom: 48 },

  // Avatar
  avatarSection: { alignItems: 'center', marginTop: 12, marginBottom: 28 },
  avatarRing: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    borderWidth: 2,
    borderColor: 'rgba(175,210,250,0.7)',
    padding: 3,
    ...shadows.card,
    backgroundColor: colors.bg.card,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR / 2,
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    backgroundColor: colors.accent.powder50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontSize: 34, fontFamily: fonts.bold, color: brand.ink },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: brand.ink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.bg.app,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: AVATAR / 2,
    backgroundColor: 'rgba(24,35,80,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  changePhoto: { fontSize: 14, fontFamily: fonts.semibold, color: colors.primary[500] },
  removePhoto: { fontSize: 14, fontFamily: fonts.semibold, color: colors.danger[400] },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.gray[200] },

  // Form — standalone bordered inputs on canvas (no nested cards)
  form: { gap: 18 },
  helper: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 17,
    marginTop: -8,
    paddingHorizontal: 2,
  },

  // Save button (idle / saving / saved states)
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    marginTop: 28,
    backgroundColor: brand.ink,
    borderRadius: radius.pill,
  },
  saveBtnDisabled: { backgroundColor: colors.gray[200] },
  saveBtnDone: { backgroundColor: colors.success[400] },
  saveText: { fontSize: 16, fontFamily: fonts.semibold, color: brand.canvas, letterSpacing: 0.1 },
  saveTextDisabled: { color: colors.gray[400] },
});
