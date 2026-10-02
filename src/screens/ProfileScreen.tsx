import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Heart } from '../components/Decorations';
import { FormField } from '../components/FormField';
import { Screen, ScreenHeader, SectionTitle } from '../components/Screen';
import { ErrorState, InlineNotice, LoadingState } from '../components/States';
import { DEFAULT_USER } from '../data/defaults';
import { useBreakFlow } from '../hooks/BreakFlowContext';
import { useStoredValue } from '../hooks/useStoredValue';
import { STORAGE_KEYS } from '../storage/keys';
import { storageService } from '../storage/storageService';
import { HealthGoal, Sex, User } from '../types';
import { colors } from '../utils/theme';

const SEXES: { key: Sex; label: string }[] = [
  { key: 'female', label: 'หญิง' },
  { key: 'male', label: 'ชาย' },
  { key: 'unspecified', label: 'ไม่ระบุ' },
];
const GOALS: { key: HealthGoal; label: string }[] = [
  { key: 'screen', label: 'ลดเวลาหน้าจอ' },
  { key: 'sleep', label: 'นอนให้ดีขึ้น' },
  { key: 'fitness', label: 'แข็งแรงขึ้น' },
  { key: 'maintain', label: 'รักษาน้ำหนัก' },
  { key: 'lose', label: 'ลดน้ำหนัก' },
  { key: 'gain', label: 'เพิ่มน้ำหนัก' },
];

const toNum = (s: string) => (s.trim() === '' ? null : Number(s.replace(',', '.')));

export function ProfileScreen() {
  const { updateSettings } = useBreakFlow();
  const user = useStoredValue<User>(STORAGE_KEYS.user, DEFAULT_USER);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [sex, setSex] = useState<Sex>('unspecified');
  const [goal, setGoal] = useState<HealthGoal>('screen');
  const [limit, setLimit] = useState('60');
  const [loaded, setLoaded] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);

  useEffect(() => {
    if (user.loading || loaded) return;
    const u = user.data;
    setName(u.name);
    setAge(u.age ? String(u.age) : '');
    setHeight(u.heightCm ? String(u.heightCm) : '');
    setWeight(u.weightKg ? String(u.weightKg) : '');
    setSex(u.sex);
    setGoal(u.goal);
    setLimit(String(u.dailyScreenLimitMin));
    setLoaded(true);
  }, [user.loading, user.data, loaded]);

  const save = async () => {
    const a = toNum(age);
    const h = toNum(height);
    const w = toNum(weight);
    const l = Number(limit);
    if (a !== null && !(a >= 5 && a <= 120)) return setMsg({ tone: 'danger', text: 'อายุไม่ถูกต้อง' });
    if (h !== null && !(h >= 50 && h <= 250)) return setMsg({ tone: 'danger', text: 'ส่วนสูงไม่ถูกต้อง' });
    if (w !== null && !(w >= 10 && w <= 300)) return setMsg({ tone: 'danger', text: 'น้ำหนักไม่ถูกต้อง' });
    if (!(l >= 10 && l <= 720)) return setMsg({ tone: 'danger', text: 'เป้าหมายเวลาใช้โทรศัพท์ 10–720 นาที' });
    const next: User = {
      name: name.trim(),
      age: a,
      heightCm: h,
      weightKg: w,
      sex,
      goal,
      dailyScreenLimitMin: Math.round(l),
      updatedAt: new Date().toISOString(),
    };
    const ok = await user.save(next);
    setMsg(ok ? { tone: 'success', text: 'บันทึกโปรไฟล์แล้ว (เก็บในเครื่องนี้เท่านั้น)' } : { tone: 'danger', text: 'บันทึกไม่สำเร็จ' });
  };

  const resetAll = () =>
    Alert.alert('ล้างข้อมูลทั้งหมด', 'ข้อมูลโปรไฟล์ สถิติ และบันทึกทั้งหมดในเครื่องจะถูกลบ', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ล้างข้อมูล',
        style: 'destructive',
        onPress: async () => {
          try {
            await storageService.clearAll();
            await updateSettings({ onboarded: true });
            setLoaded(false);
            await user.reload();
            setMsg({ tone: 'success', text: 'ล้างข้อมูลแล้ว' });
          } catch {
            setMsg({ tone: 'danger', text: 'ล้างข้อมูลไม่สำเร็จ' });
          }
        },
      },
    ]);

  if (user.loading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader back title="โปรไฟล์" subtitle="ข้อมูลเก็บไว้ในเครื่องของคุณเท่านั้น" />
      {user.error ? <ErrorState message={user.error} onRetry={user.reload} /> : null}

      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <AppText variant="display" color={colors.teal}>
            {name.trim() ? name.trim().charAt(0) : '🙂'}
          </AppText>
        </View>
        <Heart size={24} />
      </View>

      <Card style={{ gap: 12 }}>
        <FormField label="ชื่อ" value={name} onChangeText={setName} placeholder="ชื่อเล่นของคุณ" />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <FormField label="อายุ" suffix="ปี" keyboardType="number-pad" value={age} onChangeText={setAge} />
          </View>
          <View style={{ flex: 1 }}>
            <FormField label="ส่วนสูง" suffix="ซม." keyboardType="decimal-pad" value={height} onChangeText={setHeight} />
          </View>
        </View>
        <FormField label="น้ำหนัก" suffix="กก." keyboardType="decimal-pad" value={weight} onChangeText={setWeight} />
        <AppText variant="label" color={colors.textSoft}>
          เพศ
        </AppText>
        <View style={styles.wrap}>
          {SEXES.map((s) => (
            <Chip key={s.key} label={s.label} selected={sex === s.key} onPress={() => setSex(s.key)} />
          ))}
        </View>
        <AppText variant="label" color={colors.textSoft}>
          เป้าหมายสุขภาพ
        </AppText>
        <View style={styles.wrap}>
          {GOALS.map((g) => (
            <Chip key={g.key} label={g.label} selected={goal === g.key} onPress={() => setGoal(g.key)} color={colors.peachDeep} />
          ))}
        </View>
        <FormField
          label="เป้าหมายเวลาใช้โทรศัพท์ต่อวัน (ตาม Timer)"
          suffix="นาที"
          keyboardType="number-pad"
          value={limit}
          onChangeText={setLimit}
        />
        {msg ? <InlineNotice tone={msg.tone} title={msg.text} /> : null}
        <Button title="บันทึกโปรไฟล์" icon="save-outline" onPress={save} />
      </Card>

      <SectionTitle>ข้อมูลในเครื่อง</SectionTitle>
      <Button title="ล้างข้อมูลทั้งหมด" variant="danger" icon="trash-outline" onPress={resetAll} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarWrap: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 12 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
