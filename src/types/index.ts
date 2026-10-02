/* ===================== Core data model ===================== */

export type Sex = 'male' | 'female' | 'unspecified';
export type HealthGoal = 'maintain' | 'lose' | 'gain' | 'fitness' | 'sleep' | 'screen';

export interface User {
  name: string;
  age: number | null;
  sex: Sex;
  heightCm: number | null;
  weightKg: number | null;
  goal: HealthGoal;
  /** เป้าหมายเวลาใช้โทรศัพท์ต่อวัน (นาที) ที่ผู้ใช้ตั้งเอง */
  dailyScreenLimitMin: number;
  updatedAt: string;
}

/** ช่วงเวลาที่ผู้ใช้ตั้ง timer เอง — ไม่ใช่ Screen Time จริงของทั้งเครื่อง */
export type ScreenTimeStatus = 'running' | 'ringing' | 'snoozed' | 'completed' | 'cancelled';

export interface ScreenTimeSession {
  id: string;
  /** epoch ms */
  startTime: number;
  /** epoch ms — เวลาที่ตั้งไว้ว่าจะครบ */
  endTime: number;
  /** ระยะเวลาที่ตั้ง (วินาที) */
  duration: number;
  status: ScreenTimeStatus;
  completed: boolean;
  /** เวลาที่ผู้ใช้หยุดใช้จริง (กดเริ่มพัก/ยกเลิก) */
  stoppedAt?: number;
}

export type AlarmStatus = 'scheduled' | 'ringing' | 'snoozed' | 'dismissed' | 'cancelled';

export interface BreakAlarm {
  id: string;
  sessionId: string;
  startTime: number;
  /** เวลาที่ปลุกจะดังครั้งถัดไป (เลื่อนเมื่อ snooze) */
  endTime: number;
  /** วินาที */
  duration: number;
  status: AlarmStatus;
  snoozeCount: number;
  createdAt: number;
  /** id ของ notification จาก expo-notifications (ถ้ามี) */
  notificationId?: string | null;
  /** ช่องทางที่ใช้ปลุก */
  channel: 'android-fullscreen' | 'expo-notifications' | 'in-app-only';
  /** Android: ตั้งแบบ exact หรือไม่ */
  exact?: boolean;
}

export type ActivityCategory = 'stretching' | 'walking' | 'breathing' | 'hydration';
export type IllustrationKey = 'neck' | 'arms' | 'ankle' | 'walk' | 'breath' | 'water';

export interface Activity {
  id: string;
  name: string;
  description: string;
  steps: string[];
  /** วินาที */
  duration: number;
  category: ActivityCategory;
  illustration: IllustrationKey;
  difficulty: 'easy' | 'medium';
}

export interface ActivitySession {
  id: string;
  activityId: string;
  category: ActivityCategory;
  startedAt: number;
  completedAt: number | null;
  duration: number;
  completed: boolean;
  /** อยู่ใน flow พักจอหรือเริ่มเองจากหน้าหลัก */
  source: 'break-flow' | 'standalone';
}

export type BreakStatus = 'running' | 'completed' | 'cancelled';

export interface BreakSession {
  id: string;
  screenSessionId: string | null;
  startTime: number;
  endTime: number;
  /** วินาทีที่ตั้งไว้ */
  plannedDuration: number;
  /** วินาทีที่พักจริง */
  actualDuration: number;
  status: BreakStatus;
  completedAt: number | null;
  notificationId?: string | null;
}

export type SleepStatus = 'onPlan' | 'late' | 'notRecorded';

export interface SleepRecord {
  id: string;
  /** YYYY-MM-DD — วันที่ "คืนนั้น" เริ่ม */
  date: string;
  plannedBedtime: string; // HH:mm
  actualBedtime: string | null; // HH:mm
  wakeTime: string | null; // HH:mm
  status: SleepStatus;
}

export interface SleepPlan {
  bedtime: string; // HH:mm
  wakeTime: string; // HH:mm
  reminderOffsets: number[]; // นาทีก่อนเข้านอน
  reminderIds: string[];
}

export type MenstrualSymptom = 'cramps' | 'headache' | 'fatigue' | 'mood' | 'abnormalBleeding';

export interface MenstrualRecord {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string | null;
  symptoms: MenstrualSymptom[];
  note: string;
  createdAt: number;
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';

export interface HealthRecord {
  id: string;
  date: string;
  age: number;
  sex: Exclude<Sex, 'unspecified'>;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  bmi: number;
  tdee: number;
}

export interface NutritionPlan {
  goal: 'maintain' | 'lose' | 'gain';
  targetKcal: number;
  tdee: number;
  bmr: number;
  guidance: string[];
}

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = อาทิตย์

export interface ExercisePlan {
  id: string;
  goal: string;
  type: string;
  days: Weekday[];
  time: string; // HH:mm
  durationMin: number;
  /** YYYY-MM-DD ที่ทำสำเร็จ */
  completions: string[];
  reminderIds: string[];
  createdAt: number;
}

export interface AppSettings {
  onboarded: boolean;
  soundMuted: boolean;
  dailyBreakGoal: number;
}

/** state ของ flow พักจอที่กำลังดำเนินอยู่ (เก็บใน storage เพื่อกู้คืนเมื่อเปิดแอปใหม่) */
export interface ActiveFlow {
  session: ScreenTimeSession | null;
  alarm: BreakAlarm | null;
  breakSession: BreakSession | null;
}
