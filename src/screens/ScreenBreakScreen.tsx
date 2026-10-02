import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Platform, StyleSheet, View } from 'react-native';
import { AlarmCard } from '../components/AlarmCard';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Cloud, Leaf } from '../components/Decorations';
import { PermissionBanner } from '../components/PermissionBanner';
import { Screen, ScreenHeader, SectionTitle } from '../components/Screen';
import { InlineNotice } from '../components/States';
import { Timer } from '../components/Timer';
import { useBreakFlow } from '../hooks/BreakFlowContext';
import { useNow } from '../hooks/useNow';
import { RootStackParamList } from '../navigation/types';
import { timerService } from '../services/timerService';
import { colors } from '../utils/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FLOW_STEPS = [
  { icon: 'timer-outline' as const, text: 'ตั้งเวลาใช้โทรศัพท์' },
  { icon: 'apps-outline' as const, text: 'ออกไปใช้แอปอื่นได้ตามปกติ' },
  { icon: 'alarm-outline' as const, text: 'ครบเวลา มีการแจ้งเตือนพร้อมเสียง' },
  { icon: 'body-outline' as const, text: 'ขยับร่างกาย 1 นาที' },
  { icon: 'eye-outline' as const, text: 'พักหน้าจอ 10–20 นาที' },
];

export function ScreenBreakScreen() {
  const navigation = useNavigation<Nav>();
  const { activeSession, flow, actionError, clearActionError } = useBreakFlow();
  const now = useNow(1000);
  const breakRunning = flow.breakSession?.status === 'running';

  return (
    <Screen>
      <View style={styles.cloud}>
        <Cloud width={90} color={colors.softBlue} />
      </View>
      <ScreenHeader title="พักจอ" subtitle="ใช้โทรศัพท์อย่างพอดี แล้วพักให้ร่างกายได้ขยับ" />
      <PermissionBanner />
      {actionError ? (
        <InlineNotice tone="danger" title={actionError} actionLabel="ปิด" onAction={clearActionError} />
      ) : null}

      {activeSession && flow.alarm ? (
        <Card style={{ alignItems: 'center', gap: 14 }}>
          <AppText variant="subheading">
            {activeSession.status === 'ringing' ? 'ถึงเวลาพักแล้ว!' : 'กำลังจับเวลาใช้โทรศัพท์'}
          </AppText>
          <Timer
            size={190}
            remainingSec={timerService.getRemainingSec(flow.alarm.endTime, now)}
            progress={timerService.getProgress(flow.alarm.startTime, flow.alarm.endTime, now)}
            label={activeSession.status === 'snoozed' ? 'เลื่อนเวลาแล้ว' : 'เหลือเวลา'}
          />
          <AlarmCard alarm={flow.alarm} />
          <Button
            title={activeSession.status === 'ringing' ? 'ไปหน้าพัก' : 'ดูตัวจับเวลา'}
            onPress={() => navigation.navigate(activeSession.status === 'ringing' ? 'Alarm' : 'Timer')}
            style={{ alignSelf: 'stretch' }}
          />
        </Card>
      ) : breakRunning ? (
        <Card tint={colors.mint} style={{ gap: 10 }}>
          <AppText variant="subheading">กำลังพักหน้าจออยู่</AppText>
          <Button title="กลับไปหน้าพักหน้าจอ" onPress={() => navigation.navigate('BreakMode')} />
        </Card>
      ) : (
        <Card tint={colors.cream} style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Leaf size={30} />
            <AppText variant="heading" style={{ flex: 1 }}>
              พร้อมเริ่มรอบใหม่ไหม?
            </AppText>
          </View>
          <AppText variant="caption" color={colors.textSoft}>
            ตั้งเวลาที่จะใช้โทรศัพท์ เมื่อครบเวลาแอปจะเตือนให้ลุกขึ้นยืดเส้นและพักสายตา
          </AppText>
          <Button title="ตั้งเวลาใช้โทรศัพท์" icon="timer-outline" size="lg" onPress={() => navigation.navigate('SetScreenTime')} />
        </Card>
      )}

      <SectionTitle>ขั้นตอนพักจอ</SectionTitle>
      <Card>
        {FLOW_STEPS.map((s, i) => (
          <View key={s.text} style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name={s.icon} size={18} color={colors.teal} />
            </View>
            <AppText variant="caption" style={{ flex: 1 }}>
              {i + 1}. {s.text}
            </AppText>
          </View>
        ))}
      </Card>

      <SectionTitle>การแจ้งเตือนบนเครื่องนี้</SectionTitle>
      <Card tint={colors.softBlue}>
        <AppText variant="caption" color={colors.textSoft}>
          {Platform.OS === 'ios'
            ? 'iPhone: เมื่อครบเวลาจะมีการแจ้งเตือนพร้อมเสียงบนหน้าจอล็อกและแบนเนอร์ กดแจ้งเตือนเพื่อเปิดหน้า “ถึงเวลาพักแล้ว!” หรือกดค้างเพื่อเลือก “เริ่มพัก” / “เลื่อน 5 นาที” — iOS ไม่อนุญาตให้แอปทั่วไปแสดงหน้าเต็มจอทับแอปอื่น'
            : 'Android: เมื่อครบเวลาจะมีการแจ้งเตือนแบบนาฬิกาปลุก (เมื่อใช้ Development Build) ถ้าหน้าจอล็อกอยู่จะเปิดหน้าปลุกเต็มจอ ถ้ากำลังใช้แอปอื่นจะแสดงเป็นแบนเนอร์ด้านบนพร้อมปุ่ม “เริ่มพัก” / “เลื่อน 5 นาที”'}
        </AppText>
        <AppText variant="label" weight="regular" color={colors.textMuted} style={{ marginTop: 8 }}>
          แอปไม่สามารถล็อกโทรศัพท์หรือบังคับปิดแอปอื่นได้ — การพักขึ้นอยู่กับการตัดสินใจของคุณ
        </AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cloud: { position: 'absolute', right: 10, top: 6 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  stepIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
});
