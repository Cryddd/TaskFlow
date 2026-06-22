import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../../lib/theme';

export default function SettingsRow({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  value,
  onPress,
  showChevron = true,
  danger,
  rightElement,
  style,
}) {
  const content = (
    <View style={[styles.row, style]}>
      {icon && (
        <View style={[styles.iconCircle, { backgroundColor: iconBg ?? colors.gray[50] }]}>
          <MaterialIcons name={icon} size={18} color={iconColor ?? colors.gray[600]} />
        </View>
      )}
      <View style={styles.texts}>
        <Text style={[styles.title, danger && styles.dangerText]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {rightElement ?? (
        <View style={styles.right}>
          {value ? <Text style={styles.value} numberOfLines={1}>{value}</Text> : null}
          {showChevron && onPress && (
            <MaterialIcons name="chevron-right" size={18} color={colors.gray[200]} />
          )}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    minHeight: 52,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1, gap: 2 },
  title: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.gray[900],
    lineHeight: 22,
  },
  dangerText: { color: colors.danger[400] },
  subtitle: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 17,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '40%',
  },
  value: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.gray[600],
    lineHeight: 22,
  },
});
