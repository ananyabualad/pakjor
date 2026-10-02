import { ReactNode } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, shadow } from '../utils/theme';

interface Props {
  children: ReactNode;
  tint?: string;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  padded?: boolean;
  accessibilityLabel?: string;
}

export function Card({ children, tint, onPress, style, padded = true, accessibilityLabel }: Props) {
  const content = [styles.card, { backgroundColor: tint ?? colors.white }, padded && styles.padded, style];
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [...content, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={content}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  padded: { padding: 18 },
});
