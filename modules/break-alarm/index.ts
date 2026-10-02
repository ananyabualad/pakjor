import { requireOptionalNativeModule } from 'expo';

/**
 * Native Android module (Kotlin) สำหรับ "Break Alarm" แบบ Full-Screen Intent
 *
 * - มีเฉพาะใน Android Development Build / Release Build
 * - ใน Expo Go และบน iOS โมดูลนี้จะเป็น null → แอปจะใช้ expo-notifications แทน
 */
export interface BreakAlarmNativeModule {
  /** ตั้งปลุกด้วย AlarmManager; คืนค่า true ถ้าเป็นแบบ exact (setAlarmClock) */
  schedule(triggerAtMs: number, title: string, body: string): Promise<boolean>;
  /** ยกเลิกปลุกที่ตั้งไว้ และลบ notification ที่แสดงอยู่ */
  cancel(): void;
  canScheduleExactAlarms(): boolean;
  canUseFullScreenIntent(): boolean;
  openExactAlarmSettings(): void;
  openFullScreenIntentSettings(): void;
}

export const BreakAlarm = requireOptionalNativeModule<BreakAlarmNativeModule>('BreakAlarm');
