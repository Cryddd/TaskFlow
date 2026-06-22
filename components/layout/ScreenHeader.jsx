import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '../../lib/theme';

export default function ScreenHeader({
  title,
  titleStyle,
  onBack,
  rightLabel,
  onRightPress,
  rightDisabled,
  rightElement,
  showBack = true,
}) {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.bar}>
        {showBack ? (
          <TouchableOpacity
            style={styles.side}
            onPress={onBack ?? (() => router.back())}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.gray[900]} />
          </TouchableOpacity>
        ) : (
          <View style={styles.side} />
        )}

        <Text style={[styles.title, titleStyle]} numberOfLines={1}>{title}</Text>

        {rightElement ?? (
          rightLabel ? (
            <TouchableOpacity
              style={styles.side}
              onPress={onRightPress}
              disabled={rightDisabled}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.rightLabel, rightDisabled && styles.rightDisabled]}>
                {rightLabel}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.side} />
          )
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.bg.elevated },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenH,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    backgroundColor: colors.bg.elevated,
  },
  side: {
    width: 64,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.gray[900],
    lineHeight: 28,
  },
  rightLabel: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.primary[500],
    textAlign: 'right',
    width: '100%',
  },
  rightDisabled: {
    color: colors.gray[200],
  },
});
