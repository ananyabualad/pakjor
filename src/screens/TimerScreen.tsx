import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { AlarmCard } from '../components/AlarmCard';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Cloud, Leaf } from '../components/Decorations';
import { PermissionBanner } from '../components/PermissionBanner';
import { Screen, ScreenHeader } from '../components/Screen';
import { EmptyState } from '../components/States';
import { Timer } from '../components/Timer';
import { useBreakFlow } from '../hooks/BreakFlowContext';
import { useNow } from '../hooks/useNow';
import { RootStackParamList } from '../navigation/types';
import { timerService } from '../services/timerService';
import { colors } from '../utils/theme';
import { formatClock, formatDurationThai } from '../utils/time';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function TimerScreen() {
  const navigation = useNavigation<Nav>();
  const { activeSession, flow, cancelSession, startBreakFlow } = useBreakFlow();
  const now = useNow(500);
  const [busy, setBusy] = useState(false);

  if (!activeSession || !flow.alarm) {
    return (
      <Screen edges={['top', 'bottom']}>
        <ScreenHeader back title="ตัวจับเวลา" />
        <EmptyState
          title="ไม่พบตัวจับเวลาที่กำลังทำงาน"
          message="อาจหมดเวลาหรือถูกยกเลิกไปแล้ว เริ่มรอบใหม่ได้เลย"
          actionLabel="ตั้งเวลาใช้โทรศัพท์"
          onAction={() => navigation.replace('SetScreenTime')}
        />
      </Screen>
    );
  }

  const alarm = flow.alarm;
  const remaining = timerService.getRemainingSec(alarm.endTime, now);

  const confirmCancel = () =>
    Alert.alert('ยกเลิกตัวจับเวลา?', 'การแจ้งเตือนพักจอรอบนี้จะถูกยกเลิก', [
      { text: 'ไม่ยกเลิก', style: 'cancel' },
      {
        text: 'ยกเลิกตัวจับเวลา',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          await cancelSession();
        },
      },
    ]);

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.cloud}>
        <Cloud width={100} color={colors.softBlue} />
      </View>
      <ScreenHeader back title="กำลังจับเวลา" subtitle={`ตั้งไว้ ${formatDurationThai(activeSession.duration)}`} />
      <View style={styles.center}>
        <Timer
          remainingSec={remaining}
          progress={timerService.getProgress(alarm.startTime, alarm.endTime, now)}
          label={activeSession.status === 'snoozed' ? 'เลื่อนแล้ว เหลือเวลา' : 'เหลือเวลาใช้โทรศัพท์'}
          size={250}
        />
        <AppText variant="caption" color={colors.textSoft} center>
          เริ่ม {formatClock(new Date(activeSession.startTime))} น. · พัก {formatClock(new Date(alarm.endTime))} น.
        </AppText>
      </View>
      <AlarmCard alarm={alarm} />
      <PermissionBanner />
      <Card tint={colors.cream} style={styles.tip}>
        <Leaf size={26} />
        <AppText variant="caption" color={colors.textSoft} style={{ flex: 1 }}>
          ออกจากแอปไปใช้แอปอื่นได้ตามปกติ เวลาจะนับต่อจากเวลาจริง แม้ปิดแอป เมื่อครบเวลาจะมีการแจ้งเตือนพร้อมเสียง
        </AppText>
      </Card>
      <Button title="พักตอนนี้เลย" icon="leaf-outline" variant="peach" onPress={startBreakFlow} disabled={busy} />
      <Button title="ยกเลิกตัวจับเวลา" variant="ghost" onPress={confirmCancel} loading={busy} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cloud: { position: 'absolute', left: 140, top: 16, opacity: 0.8 },
  center: { alignItems: 'center', gap: 10, marginVertical: 8 },
  tip: { flexDirection: 'row', gap: 10, alignItems: 'center' },
});
