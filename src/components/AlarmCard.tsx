import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { BreakAlarm } from '../types';
import { colors } from '../utils/theme';
import { formatClock } from '../utils/time';
import { AppText } from './AppText';
import { Card } from './Card';

const CHANNEL_LABEL: Record<BreakAlarm['channel'], string> = {
  'android-fullscreen': 'Android ปลุกแบบเต็มจอ (Full-Screen Intent)',
  'expo-notifications': 'การแจ้งเตือนของระบบ พร้อมเสียง',
  'in-app-only': 'เตือนได้เฉพาะเมื่อเปิดแอปอยู่ (การแจ้งเตือนถูกปิด)',
};

/** แสดงว่าปลุกพักจอถูกตั้งไว้เมื่อไร และผ่านช่องทางใด */
export function AlarmCard({ alarm }: { alarm: BreakAlarm }) {
  return (
    <Card tint={colors.peach} style={styles.card}>
      <View style={styles.icon}>
        <Ionicons name="alarm" size={24} color={colors.peachDeep} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="caption" weight="semibold">
          ปลุกพักเวลา {formatClock(new Date(alarm.endTime))} น.
          {alarm.snoozeCount > 0 ? ` (เลื่อนแล้ว ${alarm.snoozeCount} ครั้ง)` : ''}
        </AppText>
        <AppText variant="label" weight="regular" color={colors.textSoft}>
          {CHANNEL_LABEL[alarm.channel]}
          {alarm.channel === 'android-fullscreen' && alarm.exact === false ? ' · เวลาอาจคลาดเคลื่อนเล็กน้อย' : ''}
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
});
