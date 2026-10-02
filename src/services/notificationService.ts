import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const BREAK_CATEGORY = 'BREAK_REMINDER';
export const ACTION_START_BREAK = 'START_BREAK';
export const ACTION_SNOOZE = 'SNOOZE_5';

export const CHANNEL_BREAK = 'break-reminder-v1';
export const CHANNEL_GENERAL = 'general-v1';

export const NOTIF_TYPE = {
  breakAlarm: 'break-alarm',
  breakComplete: 'break-complete',
  sleep: 'sleep-reminder',
  exercise: 'exercise-reminder',
} as const;

export type PermissionState = 'granted' | 'denied' | 'undetermined';

export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/** ไฟล์เสียงที่ฝังในแอปผ่าน expo-notifications config plugin (ใช้ได้เฉพาะ Development/Release build) */
const sound = (file: string) => (isExpoGo ? 'default' : file);

export const BREAK_TITLE = 'ถึงเวลาพักแล้ว! 🌿';
export const BREAK_BODY =
  'คุณใช้โทรศัพท์ครบตามเวลาที่ตั้งไว้แล้ว ลุกขึ้นยืดเส้นและพักสายตากันเถอะ';

let configured = false;

/** เรียกครั้งเดียวตอนเริ่มแอป */
async function configure(): Promise<void> {
  if (configured) return;
  configured = true;

  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const type = notification.request.content.data?.type;
      // ถ้าผู้ใช้อยู่ในแอปตอนครบเวลา แอปจะเปลี่ยนเป็นหน้า "ถึงเวลาพักแล้ว!" และเล่นเสียงเอง
      // จึงไม่ต้องแสดง banner ซ้ำ
      const inAppHandled = type === NOTIF_TYPE.breakAlarm || type === NOTIF_TYPE.breakComplete;
      return {
        shouldShowBanner: !inAppHandled,
        shouldShowList: true,
        shouldPlaySound: !inAppHandled,
        shouldSetBadge: false,
      };
    },
  });

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_BREAK, {
        name: 'แจ้งเตือนพักจอ',
        description: 'เตือนเมื่อครบเวลาใช้โทรศัพท์ที่ตั้งไว้',
        importance: Notifications.AndroidImportance.MAX,
        sound: isExpoGo ? undefined : 'break_alarm.wav',
        vibrationPattern: [0, 500, 300, 500, 300, 800],
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        audioAttributes: {
          usage: Notifications.AndroidAudioUsage.ALARM,
          contentType: Notifications.AndroidAudioContentType.SONIFICATION,
        },
        enableVibrate: true,
      });
      await Notifications.setNotificationChannelAsync(CHANNEL_GENERAL, {
        name: 'แจ้งเตือนทั่วไป',
        description: 'เตือนเข้านอน กิจกรรมทางกาย และพักครบเวลา',
        importance: Notifications.AndroidImportance.HIGH,
        sound: isExpoGo ? undefined : 'break_soft.wav',
      });
    }

    await Notifications.setNotificationCategoryAsync(BREAK_CATEGORY, [
      {
        identifier: ACTION_START_BREAK,
        buttonTitle: 'เริ่มพัก',
        options: { opensAppToForeground: true },
      },
      {
        identifier: ACTION_SNOOZE,
        buttonTitle: 'เลื่อน 5 นาที',
        // เปิดแอปเพื่อให้ JS ตั้งการแจ้งเตือนใหม่ได้แน่นอน แม้แอปถูกปิดไปแล้ว
        options: { opensAppToForeground: true },
      },
    ]);
  } catch (e) {
    console.warn('[notificationService] configure failed', e);
  }
}

async function getPermissionStatus(): Promise<PermissionState> {
  try {
    const res = await Notifications.getPermissionsAsync();
    if (res.granted || res.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
      return 'granted';
    }
    return res.canAskAgain ? 'undetermined' : 'denied';
  } catch {
    return 'undetermined';
  }
}

async function requestPermission(): Promise<PermissionState> {
  try {
    const res = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: false },
    });
    if (res.granted) return 'granted';
    return res.canAskAgain ? 'undetermined' : 'denied';
  } catch {
    return 'denied';
  }
}

async function scheduleBreakReminder(at: number, sessionId: string): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: BREAK_TITLE,
      body: BREAK_BODY,
      sound: sound('break_alarm.wav'),
      categoryIdentifier: BREAK_CATEGORY,
      priority: Notifications.AndroidNotificationPriority.MAX,
      interruptionLevel: 'timeSensitive',
      data: { type: NOTIF_TYPE.breakAlarm, sessionId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(at),
      channelId: CHANNEL_BREAK,
    },
  });
}

async function scheduleBreakComplete(at: number, breakId: string): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'พักสำเร็จ! 🎉',
      body: 'ครบเวลาพักหน้าจอแล้ว แตะเพื่อดูสรุปการพักของคุณ',
      sound: sound('success.wav'),
      data: { type: NOTIF_TYPE.breakComplete, breakId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(at),
      channelId: CHANNEL_GENERAL,
    },
  });
}

async function scheduleDaily(
  title: string,
  body: string,
  hour: number,
  minute: number,
  type: string,
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: sound('break_soft.wav'), data: { type } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: CHANNEL_GENERAL,
    },
  });
}

/** weekdayJs: 0 = อาทิตย์ (แบบ Date.getDay) */
async function scheduleWeekly(
  title: string,
  body: string,
  weekdayJs: number,
  hour: number,
  minute: number,
  type: string,
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: sound('break_soft.wav'), data: { type } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: weekdayJs + 1, // expo: 1 = อาทิตย์
      hour,
      minute,
      channelId: CHANNEL_GENERAL,
    },
  });
}

async function cancel(id?: string | null): Promise<void> {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (e) {
    console.warn('[notificationService] cancel failed', e);
  }
}

async function cancelMany(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => cancel(id)));
}

/** ลบ notification ประเภทหนึ่งที่แสดงอยู่ใน Notification Center/ถาดแจ้งเตือน */
async function dismissPresented(type: string): Promise<void> {
  try {
    const presented = await Notifications.getPresentedNotificationsAsync();
    await Promise.all(
      presented
        .filter((n) => n.request.content.data?.type === type)
        .map((n) => Notifications.dismissNotificationAsync(n.request.identifier)),
    );
  } catch {
    // ไม่สำคัญถ้าลบไม่ได้
  }
}

export const notificationService = {
  configure,
  getPermissionStatus,
  requestPermission,
  scheduleBreakReminder,
  scheduleBreakComplete,
  scheduleDaily,
  scheduleWeekly,
  cancel,
  cancelMany,
  dismissPresented,
};
