import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/**
 * คืนค่า Date.now() ที่อัปเดตทุก intervalMs — ใช้สำหรับ "วาดหน้าจอใหม่" เท่านั้น
 * เวลาที่แสดงคำนวณจาก timestamp เสมอ จึงไม่คลาดเคลื่อนแม้ interval จะหยุดตอนแอปอยู่เบื้องหลัง
 */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') setNow(Date.now());
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [intervalMs]);
  return now;
}
