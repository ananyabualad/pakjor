import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { FormField } from '../components/FormField';
import { Screen, ScreenHeader, SectionTitle } from '../components/Screen';
import { EmptyState, ErrorState, InlineNotice, LoadingState } from '../components/States';
import { DEFAULT_USER } from '../data/defaults';
import { useStoredValue } from '../hooks/useStoredValue';
import { ACTIVITY_LEVELS, bmiCategory, calcBMI, calcNutritionPlan } from '../services/healthService';
import { STORAGE_KEYS } from '../storage/keys';
import { ActivityLevel, HealthRecord, NutritionPlan, User } from '../types';
import { createId } from '../utils/id';
import { colors } from '../utils/theme';
import { formatThaiDate, toDateKey } from '../utils/time';

type Sex2 = 'male' | 'female';
const GOALS: { key: NutritionPlan['goal']; label: string }[] = [
  { key: 'maintain', label: 'รักษาน้ำหนัก' },
  { key: 'lose', label: 'ลดน้ำหนัก' },
  { key: 'gain', label: 'เพิ่มน้ำหนัก' },
];
const TONE = {
  blue: { bg: colors.softBlue, fg: colors.softBlueDeep },
  mint: { bg: colors.mint, fg: colors.teal },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
};

const num = (s: string) => {
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
};

export function BMIScreen() {
  const user = useStoredValue<User>(STORAGE_KEYS.user, DEFAULT_USER);
  const history = useStoredValue<HealthRecord[]>(STORAGE_KEYS.healthRecords, []);
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<Sex2>('female');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [level, setLevel] = useState<ActivityLevel>('light');
  const [goal, setGoal] = useState<NutritionPlan['goal']>('maintain');
  const [submitted, setSubmitted] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // เติมค่าจากโปรไฟล์ครั้งแรก
  useEffect(() => {
    if (prefilled || user.loading) return;
    const u = user.data;
    if (u.age) setAge(String(u.age));
    if (u.weightKg) setWeight(String(u.weightKg));
    if (u.heightCm) setHeight(String(u.heightCm));
    if (u.sex !== 'unspecified') setSex(u.sex);
    if (u.goal === 'lose' || u.goal === 'gain' || u.goal === 'maintain') setGoal(u.goal);
    setPrefilled(true);
  }, [user.loading, user.data, prefilled]);

  const errors = {
    age: !(num(age) >= 15 && num(age) <= 100) ? 'อายุ 15–100 ปี' : null,
    weight: !(num(weight) >= 20 && num(weight) <= 300) ? 'น้ำหนัก 20–300 กก.' : null,
    height: !(num(height) >= 100 && num(height) <= 250) ? 'ส่วนสูง 100–250 ซม.' : null,
  };
  const valid = !errors.age && !errors.weight && !errors.height;

  const result = useMemo(() => {
    if (!valid) return null;
    const w = num(weight);
    const h = num(height);
    const bmi = calcBMI(w, h);
    return { bmi, cat: bmiCategory(bmi), plan: calcNutritionPlan(sex, w, h, num(age), level, goal) };
  }, [valid, weight, height, age, sex, level, goal]);

  const saveRecord = async () => {
    if (!result) return;
    const rec: HealthRecord = {
      id: createId('health'),
      date: toDateKey(new Date()),
      age: num(age),
      sex,
      weightKg: num(weight),
      heightCm: num(height),
      activityLevel: level,
      bmi: Math.round(result.bmi * 10) / 10,
      tdee: result.plan.tdee,
    };
    const ok = await history.save([rec, ...history.data].slice(0, 50));
    if (ok) setSavedMsg('บันทึกผลแล้ว');
  };

  if (user.loading || history.loading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  const show = submitted && result;

  return (
    <Screen>
      <ScreenHeader back title="BMI & พลังงาน" subtitle="คำนวณดัชนีมวลกายและพลังงานโดยประมาณ" />
      {user.error || history.error ? <ErrorState message={(user.error || history.error)!} /> : null}

      <Card style={{ gap: 12 }}>
        <View style={styles.row}>
          <Chip label="หญิง" selected={sex === 'female'} onPress={() => setSex('female')} />
          <Chip label="ชาย" selected={sex === 'male'} onPress={() => setSex('male')} />
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <FormField label="อายุ" suffix="ปี" keyboardType="number-pad" value={age} onChangeText={setAge} error={submitted ? errors.age : null} />
          </View>
          <View style={{ flex: 1 }}>
            <FormField label="น้ำหนัก" suffix="กก." keyboardType="decimal-pad" value={weight} onChangeText={setWeight} error={submitted ? errors.weight : null} />
          </View>
        </View>
        <FormField label="ส่วนสูง" suffix="ซม." keyboardType="decimal-pad" value={height} onChangeText={setHeight} error={submitted ? errors.height : null} />
        <AppText variant="label" color={colors.textSoft}>
          ระดับกิจกรรมทางกาย
        </AppText>
        <View style={styles.wrap}>
          {ACTIVITY_LEVELS.map((l) => (
            <Chip key={l.key} label={l.label} selected={level === l.key} onPress={() => setLevel(l.key)} color={colors.softBlueDeep} />
          ))}
        </View>
        <AppText variant="label" color={colors.textMuted}>
          {ACTIVITY_LEVELS.find((l) => l.key === level)?.hint}
        </AppText>
        <AppText variant="label" color={colors.textSoft}>
          เป้าหมาย
        </AppText>
        <View style={styles.wrap}>
          {GOALS.map((g) => (
            <Chip key={g.key} label={g.label} selected={goal === g.key} onPress={() => setGoal(g.key)} color={colors.peachDeep} />
          ))}
        </View>
        <Button title="คำนวณ" icon="calculator-outline" onPress={() => { setSubmitted(true); setSavedMsg(null); }} />
      </Card>

      {submitted && !valid ? <InlineNotice tone="warning" title="กรุณากรอกข้อมูลให้ถูกต้อง" /> : null}

      {show ? (
        <>
          <Card tint={TONE[result.cat.tone].bg} style={styles.bmiCard}>
            <AppText variant="label" color={colors.textSoft}>
              BMI ของคุณ
            </AppText>
            <AppText variant="display" color={TONE[result.cat.tone].fg} style={{ fontSize: 44, lineHeight: 58 }}>
              {result.bmi.toFixed(1)}
            </AppText>
            <AppText variant="subheading">{result.cat.label}</AppText>
            <AppText variant="label" color={colors.textMuted} center>
              เกณฑ์สำหรับผู้ใหญ่ชาวเอเชีย: ปกติ 18.5–22.9
            </AppText>
          </Card>
          <View style={styles.row}>
            <Card tint={colors.cream} style={styles.kcal}>
              <AppText variant="label" color={colors.textSoft}>
                พลังงานที่ใช้ต่อวัน (TDEE)
              </AppText>
              <AppText variant="heading">{result.plan.tdee.toLocaleString()} kcal</AppText>
            </Card>
            <Card tint={colors.mint} style={styles.kcal}>
              <AppText variant="label" color={colors.textSoft}>
                แนะนำตามเป้าหมาย
              </AppText>
              <AppText variant="heading">{result.plan.targetKcal.toLocaleString()} kcal</AppText>
            </Card>
          </View>
          <Card style={{ gap: 8 }}>
            <AppText variant="subheading">แนวทางอาหารเบื้องต้น 🥗</AppText>
            {result.plan.guidance.map((g) => (
              <AppText key={g} variant="caption">
                • {g}
              </AppText>
            ))}
          </Card>
          <InlineNotice
            tone="info"
            title="ข้อควรทราบ"
            message="ตัวเลขเป็นการประมาณจากสูตร Mifflin–St Jeor สำหรับความรู้ทั่วไป ไม่ใช่คำแนะนำทางการแพทย์เฉพาะบุคคล ผู้ที่ตั้งครรภ์ มีโรคประจำตัว หรือเป็นนักกีฬาควรปรึกษาแพทย์หรือนักกำหนดอาหาร"
          />
          {savedMsg ? <InlineNotice tone="success" title={savedMsg} /> : null}
          <Button title="บันทึกผลนี้" icon="bookmark-outline" variant="secondary" onPress={saveRecord} />
        </>
      ) : null}

      <SectionTitle>ประวัติการคำนวณ</SectionTitle>
      {history.data.length === 0 ? (
        <EmptyState title="ยังไม่มีประวัติ" message="กดบันทึกผลหลังคำนวณเพื่อติดตามการเปลี่ยนแปลง" />
      ) : (
        history.data.slice(0, 8).map((h) => (
          <Card key={h.id} style={styles.histRow}>
            <AppText variant="caption" style={{ flex: 1 }}>
              {formatThaiDate(h.date)}
            </AppText>
            <AppText variant="caption">{h.weightKg} กก.</AppText>
            <AppText variant="caption" weight="bold" color={colors.teal}>
              BMI {h.bmi}
            </AppText>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bmiCard: { alignItems: 'center', gap: 2 },
  kcal: { flex: 1, gap: 4 },
  histRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
});
