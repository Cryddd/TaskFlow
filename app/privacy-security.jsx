import { View, Text, ScrollView, Switch, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { MaterialIcons } from '@expo/vector-icons';
import { useSettings, useUpdatePrivacySettings } from '../lib/hooks/useProfile';
import { colors, fonts, spacing, radius, shadows } from '../lib/theme';
import ScreenHeader from '../components/layout/ScreenHeader';
import SettingsRow from '../components/layout/SettingsRow';
import { SettingsListSkeleton } from '../components/ui/SkeletonLoader';

const LEGAL_URLS = {
  terms: 'https://taskflow.app/terms',
  privacy: 'https://taskflow.app/privacy',
  licenses: 'https://taskflow.app/licenses',
};

const DEFAULTS = { appLock: false, analytics: true };

export default function PrivacySecurityScreen() {
  const { data: settings, isLoading } = useSettings();
  const updateMut = useUpdatePrivacySettings();
  const privacySettings = settings?.privacySettings ?? DEFAULTS;

  const openUrl = (url) => WebBrowser.openBrowserAsync(url);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Privacy & Security" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {isLoading ? (
          <SettingsListSkeleton count={6} />
        ) : (
        <>
        <Text style={styles.sectionLabel}>SECURITY</Text>
        <View style={[styles.card, shadows.card]}>
          <View style={styles.toggleRow}>
            <SettingsRow
              icon="fingerprint"
              iconBg={colors.primary[50]}
              iconColor={colors.primary[500]}
              title="App Lock"
              subtitle="Require Face ID / fingerprint to open"
              showChevron={false}
              rightElement={
                <Switch
                  value={privacySettings.appLock}
                  onValueChange={(v) => updateMut.mutate({ ...privacySettings, appLock: v })}
                  trackColor={{ false: colors.gray[200], true: colors.primary[400] }}
                  thumbColor={privacySettings.appLock ? colors.primary[500] : colors.gray[0]}
                />
              }
            />
          </View>
          <View style={styles.divider} />
          <SettingsRow
            icon="verified-user"
            iconBg={colors.gray[50]}
            iconColor={colors.gray[400]}
            title="Two-Factor Authentication"
            subtitle="Coming soon"
            showChevron={false}
            rightElement={<View style={styles.soonBadge}><Text style={styles.soonText}>Soon</Text></View>}
          />
        </View>

        <Text style={styles.sectionLabel}>PRIVACY</Text>
        <View style={[styles.card, shadows.card]}>
          <View style={styles.toggleRow}>
            <SettingsRow
              icon="bar-chart"
              iconBg={colors.gray[50]}
              iconColor={colors.gray[600]}
              title="Usage Analytics"
              subtitle="Help improve TaskFlow by sharing anonymous usage data"
              showChevron={false}
              rightElement={
                <Switch
                  value={privacySettings.analytics}
                  onValueChange={(v) => updateMut.mutate({ ...privacySettings, analytics: v })}
                  trackColor={{ false: colors.gray[200], true: colors.primary[400] }}
                  thumbColor={privacySettings.analytics ? colors.primary[500] : colors.gray[0]}
                />
              }
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>LEGAL</Text>
        <View style={[styles.card, shadows.card]}>
          <SettingsRow title="Terms of Service" onPress={() => openUrl(LEGAL_URLS.terms)} rightElement={<MaterialIcons name="open-in-new" size={18} color={colors.gray[400]} />} showChevron={false} />
          <View style={styles.divider} />
          <SettingsRow title="Privacy Policy" onPress={() => openUrl(LEGAL_URLS.privacy)} rightElement={<MaterialIcons name="open-in-new" size={18} color={colors.gray[400]} />} showChevron={false} />
          <View style={styles.divider} />
          <SettingsRow title="Licenses" onPress={() => openUrl(LEGAL_URLS.licenses)} rightElement={<MaterialIcons name="open-in-new" size={18} color={colors.gray[400]} />} showChevron={false} />
        </View>

        <Text style={styles.version}>TaskFlow v1.0.0</Text>
        <Text style={styles.copyright}>© 2026 TaskFlow</Text>
        </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.app },
  scroll: { padding: spacing.screenH, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.gray[400],
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 8,
    paddingLeft: 4,
  },
  card: { backgroundColor: colors.bg.card, borderRadius: radius.md, overflow: 'hidden', marginBottom: 8 },
  toggleRow: { paddingRight: 16 },
  divider: { height: 1, backgroundColor: colors.gray[100], marginLeft: 16 },
  soonBadge: { backgroundColor: colors.gray[50], borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  soonText: { fontSize: 11, fontFamily: fonts.medium, color: colors.gray[400] },
  version: { textAlign: 'center', fontSize: 12, fontFamily: fonts.regular, color: colors.gray[400], marginTop: 24 },
  copyright: { textAlign: 'center', fontSize: 11, fontFamily: fonts.regular, color: colors.gray[200], marginTop: 4 },
});
