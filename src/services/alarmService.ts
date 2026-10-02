import { Platform } from 'react-native';
import { BreakAlarm as NativeBreakAlarm } from '../../modules/break-alarm';
import { BreakAlarm, ScreenTimeSession } from '../types';
import { createId } from '../utils/id';
import {
  BREAK_BODY,
  BREAK_TITLE,
  NOTIF_TYPE,
  notificationService,
} from './notificationService';

export const SNOOZE_MINUTES = 5;

/** มี native module สำหรับ Full-Screen Intent หรือไม่ (Android dev/release build เท่านั้น) */
export const hasNativeFullScreenAlarm = Platform.OS === 'android' && NativeBreakAlarm != null;

export interface AlarmCapabilities {
  platform: string;
  nativeFullScreen: boolean;
  exactAlarm: boolean;
  fullScreenIntentAllowed: boolean;
}

function getCapabilities(): AlarmCapabilities {
  if (hasNativeFullScreenAlarm && NativeBreakAlarm) {
    let exact = false;
    let fsi = false;
    try {
      exact = NativeBreakAlarm.canScheduleExactAlarms();
      fsi = NativeBreakAlarm.canUseFullScreenIntent();
    } catch {
      // ignore
    }
    return { platform: 'android', nativeFullScreen: true, exactAlarm: exact, fullScreenIntentAllowed: fsi };
  }
  return {
    platform: Platform.OS,
    nativeFullScreen: false,
    exactAlarm: false,
    fullScreenIntentAllowed: false,
  };
}

async function scheduleAt(
  at: number,
  sessionId: string,
): Promise<Pick<BreakAlarm, 'channel' | 'notificationId' | 'exact'>> {
  // Android + Development Build → AlarmManager + Full-Screen Intent (native)
  if (hasNativeFullScreenAlarm && NativeBreakAlarm) {
    try {
      const exact = await NativeBreakAlarm.schedule(at, BREAK_TITLE, BREAK_BODY);
      return { channel: 'android-fullscreen', notificationId: null, exact };
    } catch (e) {
      console.warn('[alarmService] native schedule failed, fallback to expo-notifications', e);
    }
  }
  // iOS / Expo Go → Local Notification ของระบบ
  const permission = await notificationService.getPermissionStatus();
  if (permission === 'granted') {
    try {
      const id = await notificationService.scheduleBreakReminder(at, sessionId);
      return { channel: 'expo-notifications', notificationId: id };
    } catch (e) {
      console.warn('[alarmService] schedule notification failed', e);
    }
  }
  // ไม่มีสิทธิ์แจ้งเตือน → เตือนได้เฉพาะตอนอยู่ในแอป
  return { channel: 'in-app-only', notificationId: null };
}

async function schedule(session: ScreenTimeSession): Promise<BreakAlarm> {
  const scheduled = await scheduleAt(session.endTime, session.id);
  return {
    id: createId('alarm'),
    sessionId: session.id,
    startTime: session.startTime,
    endTime: session.endTime,
    duration: session.duration,
    status: 'scheduled',
    snoozeCount: 0,
    createdAt: Date.now(),
    ...scheduled,
  };
}

/** ยกเลิกปลุกที่ตั้งไว้ + ปิด notification ที่ยังแสดงอยู่ (หยุดเสียงปลุกของระบบ) */
async function cancel(alarm: BreakAlarm | null): Promise<void> {
  if (hasNativeFullScreenAlarm && NativeBreakAlarm) {
    try {
      NativeBreakAlarm.cancel();
    } catch {
      // ignore
    }
  }
  if (alarm?.notificationId) await notificationService.cancel(alarm.notificationId);
  await notificationService.dismissPresented(NOTIF_TYPE.breakAlarm);
}

async function snooze(alarm: BreakAlarm, minutes = SNOOZE_MINUTES): Promise<BreakAlarm> {
  await cancel(alarm);
  const at = Date.now() + minutes * 60 * 1000;
  const scheduled = await scheduleAt(at, alarm.sessionId);
  return {
    ...alarm,
    ...scheduled,
    endTime: at,
    status: 'snoozed',
    snoozeCount: alarm.snoozeCount + 1,
  };
}

function openExactAlarmSettings() {
  NativeBreakAlarm?.openExactAlarmSettings();
}

function openFullScreenIntentSettings() {
  NativeBreakAlarm?.openFullScreenIntentSettings();
}

export const alarmService = {
  getCapabilities,
  schedule,
  cancel,
  snooze,
  openExactAlarmSettings,
  openFullScreenIntentSettings,
};
