import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../../lib/theme';
import PrimaryButton from './PrimaryButton';

export default function EmptyState({ icon, title, subtitle, ctaLabel, onCta }) {
  return (
    <View style={styles.container}>
      <MaterialIcons name={icon} size={48} color={colors.gray[200]} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {ctaLabel && onCta ? (
        <PrimaryButton title={ctaLabel} onPress={onCta} style={styles.cta} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontFamily: fonts.semibold,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    textAlign: 'center',
    lineHeight: 22,
  },
  cta: {
    marginTop: 12,
    minWidth: 160,
  },
});
