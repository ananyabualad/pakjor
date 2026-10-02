import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Cloud, Leaf } from '../components/Decorations';
import { Screen, ScreenHeader } from '../components/Screen';
import { InlineNotice } from '../components/States';
import { Timer } from '../components/Timer';
import { useBreakFlow } from '../hooks/BreakFlowContext';
import { useNow } from '../hooks/useNow';
import { goToMain } from '../navigation/navigationRef';
import { timerService } from '../services/timerService';
import { colors, radius } from '../utils/theme';

const OPTIONS = [
  { label: '10 นาที', sec: 600 },
  { label: '15 นาที', sec: 900 },
  { label: '20 นาที', sec: 1200 },
];

const MESSAGES = [
  'พักสายตา\nมองออกไปไกล ๆ\nและหายใจช้า ๆ',
  'กะพริบตาช้า ๆ 10 ครั้ง\nให้ดวงตาชุ่มชื้น',
  'กฎ 20-20-20\nมองไกล 20 ฟุต นาน 20 วินาที',
  'ผ่อนคลายไหล่\nปล่อยมือวางสบาย ๆ',
  'จิบน้ำสักแก้ว\nร่างกายจะสดชื่นขึ้น',
];

export function BreakModeScreen() {
  const { flow, beginBreak, finishBreak, settings, updateSettings, actionError } = useBreakFlow();
  const [selected, setSelected] = useState(600);
  const [starting, setStarting] = useState(false);
  const now = useNow(500);
  const breath = useRef(new Animated.Value(0)).current;

  const b = flow.breakSession?.status === 'running' ? flow.breakSession : null;

  useEffect(() => {
    if (!b) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [b, breath]);

  const start = async (sec: number) => {
    setStarting(true);
    try {
      await beginBreak(sec);
    } finally {
      setStarting(false);
    }
  };

  if (!b) {
    return (
      <Screen edges={['top', 'bottom']}>
        <ScreenHeader title="พักหน้าจอ" subtitle="เลือกเวลาพัก 10–20 นาที" />
        <Card tint={colors.softBlue} style={styles.hero}>
          <Cloud width={70} />
          <AppText variant="heading" center>
            วางโทรศัพท์ลงสักพัก
          </AppText>
          <AppText variant="caption" color={colors.textSoft} center>
            ระหว่างพัก แอปจะนับเวลาให้ และแจ้งเตือนเมื่อครบเวลา{'\n'}(แอปไม่สามารถล็อกโทรศัพท์หรือปิดแอปอื่นได้)
          </AppText>
        </Card>
        <View style={styles.chips}>
          {OPTIONS.map((o) => (
            <Chip key={o.sec} label={o.label} selected={selected === o.sec} onPress={() => setSelected(o.sec)} />
          ))}
          <Chip label="ทดสอบ 20 วินาที" selected={selected === 20} onPress={() => setSelected(20)} color={colors.lavenderDeep} />
        </View>
        {actionError ? <InlineNotice tone="danger" title={actionError} /> : null}
        <Button title="เริ่มพักหน้าจอ" icon="leaf-outline" size="lg" loading={starting} onPress={() => start(selected)} />
        <Button title="ข้ามการพัก กลับหน้าพักจอ" variant="ghost" onPress={() => goToMain('ScreenBreak')} />
      </Screen>
    );
  }

  const remaining = timerService.getRemainingSec(b.endTime, now);
  const progress = timerService.getProgress(b.startTime, b.endTime, now);
  const msg = MESSAGES[Math.floor((now - b.startTime) / 20000) % MESSAGES.length];
  const scale = breath.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.12] });

  return (
    <Screen edges={['top', 'bottom']} background={colors.softBlue}>
      <View style={styles.topRow}>
        <AppText variant="title">พักหน้าจอ</AppText>
        <Pressable
          onPress={() => updateSettings({ soundMuted: !settings.soundMuted })}
          style={styles.mute}
          accessibilityRole="button"
          accessibilityLabel={settings.soundMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
        >
          <Ionicons name={settings.soundMuted ? 'volume-mute' : 'volume-high'} size={22} color={colors.teal} />
        </Pressable>
      </View>

      <View style={styles.center}>
        <Animated.View style={[styles.breath, { transform: [{ scale }] }]} />
        <Timer remainingSec={remaining} progress={progress} label="เหลือเวลาพัก" size={230} />
      </View>

      <Card style={styles.msgCard}>
        <Leaf size={26} />
        <AppText variant="heading" center>
          {msg}
        </AppText>
        <AppText variant="caption" color={colors.textSoft} center>
          หายใจเข้าเมื่อวงกลมขยาย หายใจออกเมื่อวงกลมหด
        </AppText>
      </Card>

      <InlineNotice
        tone="info"
        icon="notifications-outline"
        title="ปิดหน้าจอได้เลย"
        message="เวลาคำนวณจาก timestamp จริง เมื่อครบเวลาจะมีการแจ้งเตือน (ถ้าอนุญาตไว้)"
      />
      <Button title="จบการพักก่อนเวลา" variant="secondary" onPress={() => finishBreak(true)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mute: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  breath: { position: 'absolute', width: 270, height: 270, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.55)' },
  msgCard: { alignItems: 'center', gap: 8 },
});
