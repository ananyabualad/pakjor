import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius } from '../utils/theme';
import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'ghost' | 'peach' | 'danger';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  size?: 'md' | 'lg' | 'sm';
  style?: ViewStyle;
  accessibilityHint?: string;
}

const palette: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.teal, fg: colors.white },
  secondary: { bg: colors.white, fg: colors.teal, border: colors.border },
  ghost: { bg: 'transparent', fg: colors.teal },
  peach: { bg: colors.peachDeep, fg: colors.white },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  size = 'md',
  style,
  accessibilityHint,
}: Props) {
  const p = palette[variant];
  const isDisabled = disabled || loading;
  const height = size === 'lg' ? 58 : size === 'sm' ? 40 : 50;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: p.bg,
          borderColor: p.border ?? 'transparent',
          minHeight: height,
          paddingHorizontal: size === 'sm' ? 16 : 22,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Ionicons name={icon} size={size === 'sm' ? 16 : 20} color={p.fg} /> : null}
          <AppText
            variant={size === 'sm' ? 'caption' : 'subheading'}
            weight="semibold"
            color={p.fg}
          >
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
