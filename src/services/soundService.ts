import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';

/**
 * เสียงภายในแอป (ตอนผู้ใช้อยู่ในแอป)
 * เสียงตอนแอปอยู่เบื้องหลังเป็นหน้าที่ของ OS Notification (ดู notificationService / native module)
 */
const SOURCES = {
  alarm: require('../../assets/sounds/break_alarm.wav'),
  soft: require('../../assets/sounds/break_soft.wav'),
  success: require('../../assets/sounds/success.wav'),
};

let alarmPlayer: AudioPlayer | null = null;
let muted = false;
let modeSet = false;

async function ensureMode() {
  if (modeSet) return;
  modeSet = true;
  try {
    await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers' });
  } catch (e) {
    console.warn('[soundService] setAudioMode failed', e);
  }
}

async function playAlarm(): Promise<void> {
  if (muted || alarmPlayer) return;
  await ensureMode();
  try {
    alarmPlayer = createAudioPlayer(SOURCES.alarm);
    alarmPlayer.loop = true;
    alarmPlayer.play();
  } catch (e) {
    console.warn('[soundService] playAlarm failed', e);
    alarmPlayer = null;
  }
}

function stopAlarm(): void {
  if (!alarmPlayer) return;
  try {
    alarmPlayer.pause();
    alarmPlayer.remove();
  } catch {
    // ignore
  }
  alarmPlayer = null;
}

async function playEffect(name: 'soft' | 'success'): Promise<void> {
  if (muted) return;
  await ensureMode();
  try {
    const p = createAudioPlayer(SOURCES[name]);
    p.play();
    setTimeout(() => {
      try {
        p.remove();
      } catch {
        // ignore
      }
    }, 5000);
  } catch (e) {
    console.warn('[soundService] playEffect failed', e);
  }
}

function setMuted(value: boolean) {
  muted = value;
  if (value) stopAlarm();
}

export const soundService = {
  playAlarm,
  stopAlarm,
  playEffect,
  setMuted,
  isMuted: () => muted,
  isAlarmPlaying: () => alarmPlayer != null,
};
