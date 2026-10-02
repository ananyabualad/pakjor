import { ActivityLevel, NutritionPlan, Sex } from '../types';

export const ACTIVITY_LEVELS: { key: ActivityLevel; label: string; hint: string; factor: number }[] = [
  { key: 'sedentary', label: 'นั่งเป็นส่วนใหญ่', hint: 'แทบไม่ได้ออกกำลังกาย', factor: 1.2 },
  { key: 'light', label: 'เบา', hint: 'ออกกำลังกาย 1–3 วัน/สัปดาห์', factor: 1.375 },
  { key: 'moderate', label: 'ปานกลาง', hint: 'ออกกำลังกาย 3–5 วัน/สัปดาห์', factor: 1.55 },
  { key: 'active', label: 'มาก', hint: 'ออกกำลังกาย 6–7 วัน/สัปดาห์', factor: 1.725 },
  { key: 'veryActive', label: 'มากที่สุด', hint: 'ใช้แรงงานหนัก หรือฝึกวันละ 2 ครั้ง', factor: 1.9 },
];

export function calcBMI(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

/** เกณฑ์ BMI สำหรับผู้ใหญ่ชาวเอเชีย (ที่ใช้ในประเทศไทย) */
export function bmiCategory(bmi: number): { label: string; tone: 'blue' | 'mint' | 'warning' | 'danger' } {
  if (bmi < 18.5) return { label: 'น้ำหนักน้อยกว่าเกณฑ์', tone: 'blue' };
  if (bmi < 23) return { label: 'ปกติ', tone: 'mint' };
  if (bmi < 25) return { label: 'น้ำหนักเกิน', tone: 'warning' };
  if (bmi < 30) return { label: 'โรคอ้วนระดับ 1', tone: 'danger' };
  return { label: 'โรคอ้วนระดับ 2', tone: 'danger' };
}

/** Mifflin–St Jeor */
export function calcBMR(sex: Exclude<Sex, 'unspecified'>, weightKg: number, heightCm: number, age: number) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export function calcNutritionPlan(
  sex: Exclude<Sex, 'unspecified'>,
  weightKg: number,
  heightCm: number,
  age: number,
  level: ActivityLevel,
  goal: NutritionPlan['goal'],
): NutritionPlan {
  const bmr = calcBMR(sex, weightKg, heightCm, age);
  const factor = ACTIVITY_LEVELS.find((l) => l.key === level)?.factor ?? 1.2;
  const tdee = bmr * factor;
  let target = tdee;
  if (goal === 'lose') target = Math.max(tdee - 500, sex === 'male' ? 1500 : 1200);
  if (goal === 'gain') target = tdee + 300;

  const common = [
    'จัดจานแบบ 2:1:1 — ผัก 2 ส่วน ข้าว/แป้ง 1 ส่วน เนื้อสัตว์หรือโปรตีน 1 ส่วน',
    'เลือกข้าวกล้องหรือธัญพืชไม่ขัดสีบ่อย ๆ',
    'กินผักและผลไม้ให้หลากหลายสีทุกวัน',
    'ลดหวาน มัน เค็ม: น้ำตาลไม่เกิน 6 ช้อนชา น้ำมันไม่เกิน 6 ช้อนชา เกลือไม่เกิน 1 ช้อนชาต่อวัน',
    'ดื่มน้ำเปล่าระหว่างวันอย่างสม่ำเสมอ',
  ];
  const byGoal: Record<NutritionPlan['goal'], string[]> = {
    maintain: ['กินให้ตรงเวลา 3 มื้อ และเลือกอาหารว่างเป็นผลไม้หรือนมจืด'],
    lose: [
      'ลดเครื่องดื่มรสหวานและของทอด เป็นก้าวแรกที่ทำได้ง่าย',
      'ลดน้ำหนักอย่างค่อยเป็นค่อยไป ร่วมกับเพิ่มกิจกรรมทางกาย',
      'ไม่ควรอดอาหารหรือกินน้อยกว่าที่ร่างกายต้องการมาก ๆ',
    ],
    gain: [
      'เพิ่มมื้อว่างที่มีคุณค่า เช่น นม ไข่ ถั่ว กล้วย',
      'เพิ่มโปรตีนในแต่ละมื้อ ร่วมกับออกกำลังกายแบบมีแรงต้าน',
    ],
  };

  return {
    goal,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetKcal: Math.round(target / 10) * 10,
    guidance: [...byGoal[goal], ...common],
  };
}
