import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { HeroIllustration } from '../assets/illustrations/HeroIllustration';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Cloud, Leaf } from '../components/Decorations';
import { Screen } from '../components/Screen';
import { InlineNotice } from '../components/States';
import { useBreakFlow } from '../hooks/BreakFlowContext';
import { goToMain } from '../navigation/navigationRef';
import { colors } from '../utils/theme';

export function OnboardingScreen() {
  const { permission, requestPermission, updateSettings } = useBreakFlow();
  const [asking, setAsking] = useState(false);
  const [denied, setDenied] = useState(false);

  const finish = async () => {
    await updateSettings({ onboarded: true });
    goToMain('Home');
  };

  const ask = async () => {
    setAsking(true);
    try {
      const p = await requestPermission();
      if (p === 'granted') await finish();
      else setDenied(true);
    } finally {
      setAsking(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']} background={colors.cream}>
      <View style={styles.deco}>
        <Cloud width={90} />
        <Leaf size={30} rotate={30} />
      </View>
      <View style={styles.hero}>
        <HeroIllustration size={220} />
        <AppText variant="display" center>
          พักจอ พักกาย{'\n'}ใส่ใจสุขภาพ
        </AppText>
        <AppText variant="body" color={colors.textSoft} center>
          สุขภาพดี...เริ่มได้จากการดูแลตัวเองในทุกวัน
        </AppText>
      </View>

      <Card style={{ gap: 10 }}>
        <View style={styles.row}>
          <View style={styles.icon}>
            <Ionicons name="notifications" size={22} color={colors.teal} />
          </View>
          <AppText variant="heading" style={{ flex: 1 }}>
            อนุญาตการแจ้งเตือน
          </AppText>
        </View>
        <AppText variant="body" color={colors.textSoft}>
          แอปต้องใช้การแจ้งเตือนเพื่อเตือนเมื่อถึงเวลาพักจากโทรศัพท์
        </AppText>
      </Card>

      {denied || permission === 'denied' ? (
        <InlineNotice
          tone="danger"
          title="การแจ้งเตือนถูกปิดอยู่"
          message="กรุณาเปิดการแจ้งเตือนในการตั้งค่าโทรศัพท์"
          actionLabel="เปิดการตั้งค่า"
          onAction={() => Linking.openSettings()}
        />
      ) : null}

      {permission === 'granted' ? (
        <Button title="เริ่มใช้งาน" icon="arrow-forward" size="lg" onPress={finish} />
      ) : (
        <Button title="อนุญาตการแจ้งเตือน" icon="notifications-outline" size="lg" loading={asking} onPress={ask} />
      )}
      {permission !== 'granted' ? <Button title="ไว้ทีหลัง" variant="ghost" onPress={finish} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  deco: { flexDirection: 'row', justifyContent: 'space-between' },
  hero: { alignItems: 'center', gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
});
