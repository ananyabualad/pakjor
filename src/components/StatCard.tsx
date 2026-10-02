import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../utils/theme';
import { AppText } from './AppText';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  tint?: string;
  iconColor?: string;
}

export function StatCard({ icon, label, value, tint = colors.mint, iconColor = colors.teal }: Props) {
  return (
    <View style={[styles.card, { backgroundColor: tint }]} accessible accessibilityLabel={`${label} ${value}`}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <AppText variant="heading" style={{ marginTop: 6 }}>
        {value}
      </AppText>
      <AppText variant="label" color={colors.textSoft}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: radius.lg, padding: 16, minWidth: '45%' },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
