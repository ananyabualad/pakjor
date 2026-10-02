import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Easing, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Cloud, Leaf } from '../components/Decorations';
import { Screen } from '../components/Screen';
import { EmptyState } from '../components/States';
import { useBreakFlow } from '../hooks/BreakFlowContext';
import { useNow } from '../hooks/useNow';
import { goToMain } from '../navigation/navigationRef';
import { SNOOZE_MINUTES } from '../services/alarmService';
import { soundService } from '../services/soundService';
import { colors, fonts } from '../utils/theme';
import { formatClock, formatDurationThai } from '../utils/time';

/** หน้าจอ "ถึงเวลาพักแล้ว!" — แสดงเมื่อครบเวลา (ภายในแอป / เปิดจาก notification / Full-Screen Intent) */
export function AlarmScreen() {
  const { flow, snooze, startBreakFlow, settings, updateSettings } = useBreakFlow();
  const now = useNow(1000);
  const pulse = useRef(new Animated.Value(0)).current;
  const [busy, setBusy] = useState<'start' | 'snooze' | null>(null);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // ปิดปุ่ม back ของ Android — ผู้ใช้ต้องเลือก "เริ่มพัก" หรือ "เลื่อน"
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, []),
  );

  const session = flow.session;
  if (!session || session.status !== 'ringing') {
    return (
      <Screen background={colors.peach} edges={['top', 'bottom']}>
        <EmptyState
          title="ไม่มีการปลุกที่กำลังทำงาน"
          message="การปลุกรอบนี้อาจถูกจัดการไปแล้ว"
          actionLabel="กลับหน้าหลัก"
          onAction={() => goToMain('Home')}
        />
      </Screen>
    );
  }

  const toggleMute = async () => {
    const next = !settings.soundMuted;
    await updateSettings({ soundMuted: next });
    if (!next) soundService.playAlarm();
  };

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const iconRotate = pulse.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: ['0deg', '-8deg', '0deg', '8deg', '0deg'] });

  return (
    <Screen background={colors.peach} scroll={false} edges={['top', 'bottom']} contentStyle={styles.content}>
      <View style={styles.topRow}>
        <Pressable
          onPress={toggleMute}
          accessibilityRole="button"
          accessibilityLabel={settings.soundMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
          style={styles.muteBtn}
          hitSlop={8}
        >
          <Ionicons name={settings.soundMuted ? 'volume-mute' : 'volume-high'} size={22} color={colors.tealDark} />
        </Pressable>
      </View>

      <View style={styles.cloudLeft}>
        <Cloud width={110} />
      </View>
      <View style={styles.cloudRight}>
        <Cloud width={74} />
      </View>

      <AppText style={styles.clock} accessibilityLabel={`เวลา ${formatClock(new Date(now))}`}>
        {formatClock(new Date(now))}
      </AppText>

      <Animated.View style={[styles.ring, { transform: [{ scale: ringScale }] }]}>
        <View style={styles.inner}>
          <Animated.View style={{ transform: [{ rotate: iconRotate }] }}>
            <Ionicons name="alarm" size={74} color={colors.peachDeep} />
          </Animated.View>
        </View>
      </Animated.View>

      <View style={{ gap: 6, alignItems: 'center' }}>
        <AppText variant="display" center>
          🌿 ถึงเวลาพักแล้ว!
        </AppText>
        <AppText variant="body" center color={colors.textSoft}>
          ใช้โทรศัพท์ครบ {formatDurationThai(session.duration)}แล้ว{'\n'}ลุกขึ้นยืดเส้นและพักสายตากันเถอะ
        </AppText>
      </View>

      <Button
        title={`เลื่อน ${SNOOZE_MINUTES} นาที`}
        icon="time-outline"
        variant="secondary"
        onPress={async () => {
          setBusy('snooze');
          await snooze();
          setBusy(null);
        }}
        loading={busy === 'snooze'}
        disabled={busy !== null}
        style={{ alignSelf: 'center', minWidth: 200 }}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="เริ่มพัก"
        disabled={busy !== null}
        onPress={async () => {
          setBusy('start');
          await startBreakFlow();
          setBusy(null);
        }}
        style={({ pressed }) => [styles.bigBtn, pressed && { transform: [{ scale: 0.96 }] }]}
      >
        <AppText style={styles.bigBtnText}>เริ่มพัก</AppText>
      </Pressable>

      <View style={styles.leaf}>
        <Leaf size={34} rotate={-15} />
      </View>
      {flow.alarm && flow.alarm.snoozeCount > 0 ? (
        <AppText variant="label" color={colors.textSoft} center>
          เลื่อนมาแล้ว {flow.alarm.snoozeCount} ครั้ง
        </AppText>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', justifyContent: 'space-evenly', paddingVertical: 12 },
  topRow: { alignSelf: 'stretch', alignItems: 'flex-end' },
  muteBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  cloudLeft: { position: 'absolute', left: 16, top: 90 },
  cloudRight: { position: 'absolute', right: 20, top: 150 },
  clock: { fontFamily: fonts.bold, fontSize: 76, lineHeight: 96, color: colors.tealDark, includeFontPadding: false },
  ring: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 14,
    borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: { width: 150, height: 150, borderRadius: 75, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  bigBtn: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.peachDeep,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.peachDeep,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  bigBtnText: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 44, color: colors.white },
  leaf: { position: 'absolute', left: 30, bottom: 120 },
});
