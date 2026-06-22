import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fonts, radius } from './theme';

const baseStyle = {
  width: '90%',
  borderRadius: radius.md,
  paddingVertical: 12,
  paddingHorizontal: 16,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  shadowColor: colors.gray[900],
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 12,
  elevation: 6,
};

function ToastContent({ borderColor, iconName, iconColor, text1, text2 }) {
  return (
    <View style={[styles.base, { borderLeftColor: borderColor }]}>
      <MaterialIcons name={iconName} size={20} color={iconColor} />
      <View style={styles.textWrap}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.subtitle}>{text2}</Text> : null}
      </View>
    </View>
  );
}

export const toastConfig = {
  taskflow_success: ({ text1, text2 }) => (
    <ToastContent
      borderColor={colors.success[400]}
      iconName="check-circle"
      iconColor={colors.success[400]}
      text1={text1}
      text2={text2}
    />
  ),
  taskflow_error: ({ text1, text2 }) => (
    <ToastContent
      borderColor={colors.danger[400]}
      iconName="warning-amber"
      iconColor={colors.danger[400]}
      text1={text1}
      text2={text2}
    />
  ),
  taskflow_info: ({ text1, text2 }) => (
    <ToastContent
      borderColor={colors.primary[500]}
      iconName="tips-and-updates"
      iconColor={colors.primary[500]}
      text1={text1}
      text2={text2}
    />
  ),
};

const styles = StyleSheet.create({
  base: {
    ...baseStyle,
    backgroundColor: colors.bg.card,
    borderLeftWidth: 4,
  },
  textWrap: { flex: 1 },
  title: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.gray[900],
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    marginTop: 2,
    lineHeight: 17,
  },
});
