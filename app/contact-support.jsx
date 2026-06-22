import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, shadows } from '../lib/theme';
import { useScreenLoading } from '../lib/useScreenLoading';
import ScreenHeader from '../components/layout/ScreenHeader';
import { SettingsListSkeleton } from '../components/ui/SkeletonLoader';

function ContactCard({ icon, iconBg, iconColor, title, subtitle, rightIcon, onPress }) {
  return (
    <TouchableOpacity style={[styles.card, shadows.card]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        <MaterialIcons name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.cardTexts}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSub}>{subtitle}</Text>
      </View>
      <MaterialIcons name={rightIcon} size={20} color={colors.gray[200]} />
    </TouchableOpacity>
  );
}

export default function ContactSupportScreen() {
  const router = useRouter();
  const loading = useScreenLoading();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Contact Support" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <SettingsListSkeleton count={3} />
        ) : (
        <>
        <View style={styles.hero}>
          <MaterialIcons name="headset-mic" size={48} color={colors.primary[500]} />
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroSub}>We typically respond within 24 hours.</Text>
        </View>

        <ContactCard
          icon="mail-outline"
          iconBg={colors.primary[50]}
          iconColor={colors.primary[500]}
          title="Email Us"
          subtitle="support@taskflow.app"
          rightIcon="chevron-right"
          onPress={() => Linking.openURL('mailto:support@taskflow.app')}
        />
        <ContactCard
          icon="help-outline"
          iconBg={colors.primary[50]}
          iconColor={colors.primary[500]}
          title="Help Center"
          subtitle="Browse common questions"
          rightIcon="open-in-new"
          onPress={() => WebBrowser.openBrowserAsync('https://taskflow.app/help')}
        />
        <ContactCard
          icon="bug-report"
          iconBg={colors.warning[50]}
          iconColor={colors.warning[400]}
          title="Report a Bug"
          subtitle="Describe what went wrong"
          rightIcon="chevron-right"
          onPress={() => router.push('/bug-report')}
        />
        </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.app },
  scroll: { padding: spacing.screenH, paddingBottom: 40, gap: 12 },
  hero: { alignItems: 'center', marginTop: 24, marginBottom: 16, gap: 8 },
  heroTitle: { fontSize: 20, fontFamily: fonts.bold, color: colors.gray[900], marginTop: 12 },
  heroSub: { fontSize: 13, fontFamily: fonts.regular, color: colors.gray[400] },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    padding: 16,
    gap: 14,
  },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardTexts: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 15, fontFamily: fonts.semibold, color: colors.gray[900] },
  cardSub: { fontSize: 13, fontFamily: fonts.regular, color: colors.primary[500] },
});
