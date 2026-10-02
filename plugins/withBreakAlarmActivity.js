/**
 * Config plugin: ทำให้ MainActivity แสดงทับหน้าจอล็อกและเปิดหน้าจอได้
 * เมื่อถูกเรียกจาก Android Full-Screen Intent (หน้าจอปลุก "ถึงเวลาพักแล้ว!")
 *
 * - android:showWhenLocked="true"
 * - android:turnScreenOn="true"
 *
 * Permission ต่าง ๆ (USE_FULL_SCREEN_INTENT, SCHEDULE_EXACT_ALARM ฯลฯ) และ
 * BroadcastReceiver ถูกประกาศไว้ใน modules/break-alarm/android/src/main/AndroidManifest.xml
 * ซึ่งจะถูก merge เข้ากับ manifest ของแอปอัตโนมัติตอน build
 */
const { withAndroidManifest, AndroidConfig } = require('expo/config-plugins');

module.exports = function withBreakAlarmActivity(config) {
  return withAndroidManifest(config, (cfg) => {
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(cfg.modResults);
    mainActivity.$['android:showWhenLocked'] = 'true';
    mainActivity.$['android:turnScreenOn'] = 'true';
    return cfg;
  });
};
