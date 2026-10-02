import { Linking, Platform } from 'react-native';
import { useBreakFlow } from '../hooks/BreakFlowContext';
import { alarmService } from '../services/alarmService';
import { isExpoGo } from '../services/notificationService';
import { InlineNotice } from './States';

/** แจ้งสถานะสิทธิ์การแจ้งเตือน / ความสามารถของ OS ตามจริง */
export function PermissionBanner() {
  const { permission, requestPermission, capabilities } = useBreakFlow();

  if (permission === 'denied') {
    return (
      <InlineNotice
        tone="danger"
        title="การแจ้งเตือนถูกปิดอยู่"
        message="กรุณาเปิดการแจ้งเตือนในการตั้งค่าโทรศัพท์ ไม่เช่นนั้นแอปจะเตือนได้เฉพาะตอนเปิดแอปอยู่"
        actionLabel="เปิดการตั้งค่า"
        onAction={() => Linking.openSettings()}
      />
    );
  }
  if (permission === 'undetermined') {
    return (
      <InlineNotice
        tone="warning"
        title="อนุญาตการแจ้งเตือน"
        message="แอปต้องใช้การแจ้งเตือนเพื่อเตือนเมื่อถึงเวลาพักจากโทรศัพท์"
        actionLabel="อนุญาต"
        onAction={requestPermission}
      />
    );
  }
  if (Platform.OS === 'android' && capabilities.nativeFullScreen && !capabilities.fullScreenIntentAllowed) {
    return (
      <InlineNotice
        tone="warning"
        title="ยังไม่ได้อนุญาตการแจ้งเตือนแบบเต็มจอ"
        message="Android 14 ขึ้นไปต้องเปิดสิทธิ์นี้ เพื่อให้หน้าปลุกแสดงเต็มจอตอนหน้าจอล็อก (ถ้าไม่เปิด จะแสดงเป็นแบนเนอร์แทน)"
        actionLabel="เปิดสิทธิ์"
        onAction={alarmService.openFullScreenIntentSettings}
      />
    );
  }
  if (Platform.OS === 'android' && capabilities.nativeFullScreen && !capabilities.exactAlarm) {
    return (
      <InlineNotice
        tone="info"
        title="เปิด “การปลุกและการเตือน” เพื่อความตรงเวลา"
        message="ถ้าไม่เปิด Android อาจส่งการแจ้งเตือนช้ากว่ากำหนดเล็กน้อย"
        actionLabel="เปิดสิทธิ์"
        onAction={alarmService.openExactAlarmSettings}
      />
    );
  }
  if (isExpoGo) {
    return (
      <InlineNotice
        tone="info"
        title="กำลังทดลองใน Expo Go"
        message="แจ้งเตือนใช้เสียงมาตรฐานของระบบ ส่วนเสียงปลุกเฉพาะของแอปและหน้าปลุกเต็มจอ (Android) ต้องใช้ Development Build"
      />
    );
  }
  return null;
}
