import { StyleSheet, View } from 'react-native';
import { formatCountdown } from '../utils/time';
import { colors } from '../utils/theme';
import { AppText } from './AppText';
import { ProgressCircle } from './ProgressCircle';

interface Props {
  remainingSec: number;
  progress: number;
  label?: string;
  size?: number;
  color?: string;
  trackColor?: string;
}

/** แสดงเวลานับถอยหลัง (ค่าที่ส่งเข้ามาคำนวณจาก timestamp แล้ว) */
export function Timer({ remainingSec, progress, label, size = 240, color, trackColor }: Props) {
  return (
    <ProgressCircle size={size} progress={progress} color={color} trackColor={trackColor}>
      <View style={styles.inner}>
        <AppText
          variant="display"
          weight="bold"
          style={{ fontSize: size > 200 ? 48 : 34, lineHeight: size > 200 ? 62 : 46 }}
          accessibilityLabel={`เหลือเวลา ${formatCountdown(remainingSec)}`}
        >
          {formatCountdown(remainingSec)}
        </AppText>
        {label ? (
          <AppText variant="caption" color={colors.textSoft} center>
            {label}
          </AppText>
        ) : null}
      </View>
    </ProgressCircle>
  );
}

const styles = StyleSheet.create({ inner: { alignItems: 'center', paddingHorizontal: 16 } });
