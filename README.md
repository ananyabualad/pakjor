# พักจอ พักกาย ใส่ใจสุขภาพ 🌿
**Digital Wellness & Healthy Lifestyle App — Functional Prototype**

React Native + Expo SDK 57 + TypeScript · React Navigation 7 · AsyncStorage · expo-notifications · expo-audio
และ Native Module (Kotlin) สำหรับ Android Full-Screen Intent

> สถานะการตรวจสอบก่อนส่ง (ทำใน sandbox)
> - ✅ `tsc --noEmit` ผ่าน (strict, noUnusedLocals)
> - ✅ `expo export` bundle ได้ทั้ง Android และ iOS (import ครบ ไม่มี package ขาด)
> - ✅ ทดสอบ logic ล้วน (timer timestamp, สถานะการนอน, รอบเดือน, BMI/พลังงาน) ด้วย Node
> - ⚠️ **Kotlin native module ยังไม่ได้ compile จริง** เพราะ sandbox ไม่มี Android SDK — ต้อง build ครั้งแรกบนเครื่องคุณ (`npx expo run:android`) ถ้า compile ไม่ผ่าน build จะล้ม ให้แก้ตาม error หรือย้ายโฟลเดอร์ `modules/break-alarm` ออกชั่วคราว แอปจะ fallback ไปใช้ expo-notifications อัตโนมัติ
> - ⚠️ ยังไม่ได้ทดสอบบนอุปกรณ์จริง — ขั้นตอนทดสอบอยู่ในหัวข้อ 9

---

## 1. Project Structure

```
pakjor/
├── App.tsx                     # ฟอนต์, Splash, SafeArea, BreakFlowProvider, NavigationContainer
├── index.ts                    # registerRootComponent
├── app.json                    # Expo config (scheme pakjor://, permissions, plugins, sounds)
├── eas.json                    # โปรไฟล์ EAS Build (development / preview / production)
├── assets/
│   ├── images/                 # icon, adaptive-icon, splash-icon, notification-icon
│   └── sounds/                 # break_alarm.wav, break_soft.wav, success.wav (สังเคราะห์เอง ไม่มีลิขสิทธิ์)
├── modules/break-alarm/        # Local Expo Module (autolink) — Android Full-Screen Intent
│   ├── index.ts                # JS API (คืนค่า null บน iOS / Expo Go)
│   └── android/…/breakalarm/   # BreakAlarmModule.kt, BreakAlarmScheduler.kt, BreakAlarmReceiver.kt
├── plugins/withBreakAlarmActivity.js   # Config plugin: MainActivity showWhenLocked + turnScreenOn
└── src/
    ├── assets/illustrations/   # ภาพประกอบ SVG (2D soft cartoon)
    ├── components/             # Button, Card, Timer, ProgressCircle, ActivityCard, SleepCard,
    │                           # HealthCard, StatCard, AlarmCard, BarChart, MonthCalendar,
    │                           # PickerField, FormField, Chip, States, PermissionBanner, Decorations…
    ├── data/                   # activities (6 กิจกรรม), sexualHealth (6 หัวข้อ), defaults
    ├── hooks/                  # BreakFlowContext (state machine ของ flow พักจอ), useNow, useStoredValue
    ├── navigation/             # RootNavigator (Stack + Bottom Tabs 5 เมนู), navigationRef, types
    ├── screens/                # 18 หน้าจอ (ดูหัวข้อด้านล่าง)
    ├── services/               # timerService, notificationService, alarmService, soundService,
    │                           # statsService, activityService, sleepService, menstrualService,
    │                           # exerciseService, healthService
    ├── storage/                # storageService (AsyncStorage + StorageError), keys
    ├── types/                  # TypeScript interfaces ทั้งหมด (User, ScreenTimeSession, BreakAlarm…)
    └── utils/                  # theme, time, id
```

**หน้าจอ:** Onboarding · Home · ScreenBreak · SetScreenTime · Timer · Alarm · Activity · BreakMode · BreakComplete · Sleep · Health · Menstrual · SexualHealth · BMI · Exercise · Stats · Profile

**แยก logic ออกจาก UI:** timer/notification/alarm/storage อยู่ใน `src/services` ทั้งหมด หน้าจอเรียกผ่าน `useBreakFlow()` เท่านั้น

## 2. Installation

ต้องมี Node.js 20+ (แนะนำ 22 LTS)

```bash
unzip พักจอ-พักกาย-App.zip
cd pakjor
npm install
npx expo install --check     # ให้ Expo ตรวจ/ปรับเวอร์ชันให้ตรง SDK
npm run typecheck
```

## 3. Dependencies

| Package | ใช้ทำอะไร |
|---|---|
| expo ~57, react-native 0.86, react 19.2 | แกนหลัก |
| @react-navigation/native, native-stack, bottom-tabs (v7) + react-native-screens, safe-area-context | Navigation |
| @react-native-async-storage/async-storage | Local storage |
| expo-notifications | Local notification, category/actions, channels |
| expo-audio | เสียงปลุกในแอป / เสียงสำเร็จ |
| expo-linking | Deep link `pakjor://alarm?...` จาก Full-Screen Intent |
| @react-native-community/datetimepicker | Time/Date picker |
| react-native-svg | Illustration, ProgressCircle |
| @expo-google-fonts/noto-sans-thai, expo-font | ฟอนต์ Noto Sans Thai |
| expo-dev-client, expo-build-properties, expo-constants, expo-device, expo-splash-screen, expo-status-bar | Dev build / ระบบ |

## 4. Run Expo (Expo Go — ทดสอบ UI และ flow ภายในแอป)

```bash
npm run start:go
```
สแกน QR ด้วย Expo Go — ใช้ได้: ทุกหน้าจอ, timer, flow พักจอ, สถิติ, storage
ข้อจำกัด: **Android Expo Go รองรับ local notification แต่ไม่มี native module Full-Screen Intent** และเสียง notification เป็นเสียงระบบ (ไฟล์เสียง custom ใช้ได้เฉพาะ dev build) — ดูตารางหัวข้อ 13

## 5. Run Development Build (แนะนำ — ได้ฟีเจอร์ครบ)

```bash
# Android (ต้องมี Android Studio + SDK + JDK 17)
npx expo run:android

# iOS (ต้องมี macOS + Xcode)
npx expo run:ios

# หรือ build บน cloud
npm i -g eas-cli
eas build --profile development --platform android
eas build --profile development --platform ios
# จากนั้น
npm run start:dev
```

## 6. Android Setup

- `app.json` ประกาศ: `POST_NOTIFICATIONS`, `USE_FULL_SCREEN_INTENT`, `SCHEDULE_EXACT_ALARM`, `VIBRATE`, `WAKE_LOCK`
- `modules/break-alarm` ถูก autolink อัตโนมัติ (มี `expo-module.config.json`)
- Plugin `withBreakAlarmActivity` ตั้ง `showWhenLocked` / `turnScreenOn` ให้ MainActivity เพื่อแสดงหน้าปลุกบนหน้าจอล็อก
- เสียง `break_alarm.wav` ถูกคัดลอกไปที่ `res/raw` โดย plugin ของ expo-notifications (ชื่อไฟล์ใช้ `_` เพราะ Android ไม่อนุญาต `-` ในชื่อ resource)
- Android 12+: ถ้าไม่ได้สิทธิ์ exact alarm แอปจะ fallback เป็น `setAndAllowWhileIdle` (อาจช้ากว่าเวลาจริงเล็กน้อย) และแสดงปุ่มพาไปตั้งค่า
- Android 14+: สิทธิ์ `USE_FULL_SCREEN_INTENT` อาจถูกปิดสำหรับแอปที่ไม่ใช่นาฬิกาปลุก/โทรศัพท์ → แอปแสดงแบนเนอร์ให้กด "เปิดสิทธิ์"

## 7. iOS Setup

- ใช้ `expo-notifications` (UNUserNotificationCenter) — Local Notification + เสียง custom + category `BREAK_REMINDER`
- ตั้ง `interruptionLevel: 'timeSensitive'` ไว้แล้ว แต่ **จะมีผลจริงเมื่อเพิ่ม capability "Time Sensitive Notifications"** (`com.apple.developer.usernotifications.time-sensitive`) ใน Apple Developer/Xcode ซึ่งยังไม่ได้ใส่ใน prototype เพราะต้องใช้บัญชีที่เปิด capability ได้ ถ้าไม่มี iOS จะแสดงเป็นระดับปกติ
- **Critical Alerts** (ดังแม้ปิดเสียง/โหมดโฟกัส) ต้องขอ entitlement `com.apple.developer.usernotifications.critical-alerts` จาก Apple เป็นกรณีพิเศษ (ปกติให้เฉพาะแอปการแพทย์/ความปลอดภัย) — **ไม่ได้ implement**
- เสียง notification บน iOS ต้องยาวไม่เกิน 30 วินาที (`break_alarm.wav` ≈ 9.5 วินาที)

## 8. Notification Permission

- ครั้งแรกที่เปิดแอป หน้า Onboarding แสดง **"อนุญาตการแจ้งเตือน"** — *"แอปต้องใช้การแจ้งเตือนเพื่อเตือนเมื่อถึงเวลาพักจากโทรศัพท์"*
- ถ้าปฏิเสธ: แสดง **"การแจ้งเตือนถูกปิดอยู่ กรุณาเปิดการแจ้งเตือนในการตั้งค่าโทรศัพท์"** + ปุ่มเปิด Settings
- ระหว่างใช้งาน `PermissionBanner` จะตรวจสถานะทุกครั้งที่แอปกลับมา foreground
- ถ้าไม่มีสิทธิ์ timer ยังทำงาน แต่ alarm จะเป็นช่องทาง `in-app-only` (เตือนเฉพาะตอนเปิดแอปอยู่) และแจ้งผู้ใช้ตามจริง

## 9. Alarm Testing

ในหน้า "ตั้งเวลาใช้โทรศัพท์" มี **โหมดทดสอบ 30 วินาที** และหน้าพักหน้าจอมี **ทดสอบ 20 วินาที**

| # | ขั้นตอน | ผลที่คาดหวัง |
|---|---|---|
| 1 | พักจอ → ตั้งเวลา → โหมดทดสอบ 30 วินาที → เริ่ม | ไปหน้า Timer, เวลาลดลงจาก timestamp |
| 2–4 | กด Home ออกจากแอป เปิด YouTube/เกม รอ 30 วินาที | — |
| 5–6 | ถึงเวลา | Android dev build: Full-Screen/heads-up + เสียงวนจนกด / iOS: banner + เสียง (lock screen แสดงใน notification) |
| 7 | กด "เริ่มพัก" | เปิดแอป → หน้ากิจกรรม (สุ่ม) |
| 8–9 | ทดสอบอีกรอบ แล้วกด "เลื่อน 5 นาที" | ตั้งปลุกใหม่ +5 นาที, หน้า Timer แสดงรอบเลื่อน, notification ใหม่ดังหลัง 5 นาที |
| 10 | ทำกิจกรรม 1 นาที → พักหน้าจอ (ทดสอบ 20 วินาที) | ขึ้น "ทำกิจกรรมสำเร็จ! 🎉" → "พักสำเร็จ! 🎉" |
| 11 | แท็บสถิติ | จำนวนรอบพัก/กิจกรรม/เวลาพักเพิ่มขึ้น |
| 12–14 | ปิดแอป (swipe ทิ้ง) แล้วเปิดใหม่ | ข้อมูลสถิติ/โปรไฟล์/บันทึกยังอยู่ และ timer ที่ค้างอยู่คำนวณเวลาต่อได้ถูกต้อง |

**ทดสอบตอนอยู่ในแอป:** ตั้ง 30 วินาทีแล้วรอในแอป → เปลี่ยนเป็นหน้า "ถึงเวลาพักแล้ว!" อัตโนมัติ + เล่นเสียงในแอป (กดปุ่มลำโพงเพื่อปิดเสียงได้)

**ทดสอบตอนจอล็อก (Android):** ตั้ง 30 วินาที → ล็อกจอ → รอ → หน้าปลุกเต็มจอควรขึ้นบนหน้าจอล็อก (ถ้าได้สิทธิ์ FSI)

## 10. Full-Screen Intent (Android)

```
Timer เริ่ม → AlarmManager.setAlarmClock(endTime)          [native, ทำงานแม้แอปถูกปิด]
→ BreakAlarmReceiver → Notification (channel USAGE_ALARM, CATEGORY_ALARM, FLAG_INSISTENT)
   + setFullScreenIntent(pakjor://alarm?source=fullscreen)
   + actions: "เริ่มพัก" (pakjor://alarm?action=start), "เลื่อน 5 นาที" (pakjor://alarm?action=snooze)
→ หน้าจอล็อก/ปิดอยู่: Android เปิด Activity เต็มจอ → หน้า Alarm
→ ผู้ใช้อยู่ในแอปอื่น: Android แสดงเป็น heads-up notification (พฤติกรรมของ OS) แตะเพื่อเปิดหน้า Alarm
```
หมายเหตุ: ปุ่ม "เลื่อน 5 นาที" จาก notification บน Android จะ **เปิดแอปขึ้นมาแล้วเลื่อนให้** (deep link → JS) ไม่ได้ทำงานเงียบ ๆ เบื้องหลัง

## 11. iOS Limitation

- iOS **ไม่อนุญาต** ให้แอปทั่วไปแสดงหน้าจอเต็มทับแอปอื่น หรือทับหน้าจอล็อก (ไม่มีเทียบเท่า Full-Screen Intent)
- ใช้ได้: Notification + เสียง + Banner + Lock Screen + Notification Center + Actions "เริ่มพัก"/"เลื่อน 5 นาที" (ทั้งสอง action เปิดแอป แล้วทำงานต่อใน JS)
- แตะ notification → เปิดหน้า "ถึงเวลาพักแล้ว!" ในแอป
- เสียงเล่นครั้งเดียวตามไฟล์ (≤30 วินาที) ไม่วนเหมือนนาฬิกาปลุกระบบ; ถ้าเครื่องอยู่โหมดเงียบ/Focus อาจไม่มีเสียง (ยกเว้นมี Critical Alerts entitlement)
- AlarmKit (iOS 26+) เป็น API ใหม่สำหรับปลุกระดับระบบ — **ยังไม่ได้ implement** ต้องเขียน native module เพิ่ม

## 12. Android Limitation

- Full-Screen Intent จะ "เต็มจอ" เฉพาะตอนจอปิด/ล็อก ถ้าผู้ใช้กำลังใช้แอปอื่น OS จะแสดงเป็น heads-up (ไม่ทับแอปนั้นโดยบังคับ)
- Android 14+ อาจไม่ให้สิทธิ์ FSI อัตโนมัติ; Google Play จำกัดการใช้ FSI สำหรับแอปที่ไม่ใช่ alarm/calling
- Alarm ที่ตั้งด้วย AlarmManager **หายเมื่อรีสตาร์ทเครื่อง** (ยังไม่มี BOOT_COMPLETED receiver) — เปิดแอปอีกครั้งจะคำนวณจาก timestamp และแสดงหน้าปลุกให้
- ผู้ผลิตบางราย (Xiaomi, Oppo, Vivo, Huawei) มี battery optimization ที่อาจหน่วงหรือบล็อก alarm
- ไม่มีการปิดแอปอื่น/ล็อกเครื่อง/บังคับผู้ใช้ — แอปทำได้แค่เตือน

## 13. Prototype Limitation & Capability Table

| Feature | iOS | Android | Expo Go | Development Build |
|---|---|---|---|---|
| UI ทุกหน้า + Bottom Tabs 5 เมนู | ✅ | ✅ | ✅ | ✅ |
| Timestamp timer (คำนวณใหม่เมื่อกลับเข้าแอป/เปิดใหม่) | ✅ | ✅ | ✅ | ✅ |
| เปลี่ยนเป็นหน้า Alarm อัตโนมัติ + เสียงเมื่ออยู่ในแอป | ✅ | ✅ | ✅ | ✅ |
| Local notification เมื่ออยู่นอกแอป | ✅ (Expo Go iOS รองรับ local notification) | ✅ | ✅ local เท่านั้น | ✅ |
| เสียง notification แบบ custom (`break_alarm.wav`) | ✅ dev build | ✅ dev build | ❌ ใช้เสียงระบบ | ✅ |
| Notification actions เริ่มพัก / เลื่อน 5 นาที | ✅ | ✅ | ⚠️ ขึ้นกับเวอร์ชัน Expo Go | ✅ |
| Android Full-Screen Intent + AlarmManager exact | ❌ OS ไม่รองรับ | ✅ dev build (ต้อง compile Kotlin) | ❌ | ✅ Android เท่านั้น |
| เสียงวนจนกดปิด (FLAG_INSISTENT) นอกแอป | ❌ | ✅ dev build | ❌ | ✅ Android |
| Time-Sensitive notification | ⚠️ ต้องเพิ่ม capability เอง | — | ❌ | ⚠️ |
| Critical Alerts | ❌ ต้องได้ entitlement จาก Apple (ไม่ได้ทำ) | — | ❌ | ❌ |
| แสดงหน้าเต็มจอทับแอปอื่นขณะใช้งาน | ❌ | ❌ (heads-up แทน) | ❌ | ❌ |
| ล็อกเครื่อง / ปิดแอปอื่น | ❌ | ❌ | ❌ | ❌ |
| Screen Time จริงทั้งเครื่อง | ❌ ไม่ได้ทำ | ❌ ไม่ได้ทำ | ❌ | ❌ |
| เตือนก่อนนอน / เตือนออกกำลังกาย (daily/weekly) | ✅ | ✅ | ✅ | ✅ |
| Local storage (AsyncStorage) | ✅ | ✅ | ✅ | ✅ |

ข้อจำกัดอื่นของ prototype:
- "เวลาการใช้โทรศัพท์" = เวลาตาม **Timer ที่ผู้ใช้ตั้งเอง** เท่านั้น ไม่ใช่ Screen Time จริง (แสดงข้อความนี้ในแอป)
- ข้อมูลเก็บในเครื่องเดียว ไม่มีบัญชี/ซิงก์/สำรองข้อมูล
- เนื้อหาสุขภาพเป็นสุขศึกษาทั่วไป ไม่ใช่การวินิจฉัยหรือคำแนะนำทางการแพทย์เฉพาะบุคคล
- ยังไม่มี automated test (unit/E2E)

## 14. Production Requirements

- Compile/ทดสอบ native module บนอุปกรณ์หลายรุ่น (Android 10–15), เพิ่ม `BOOT_COMPLETED` receiver เพื่อกู้ alarm หลังรีสตาร์ท
- ขอ/อธิบายการใช้ `USE_FULL_SCREEN_INTENT` และ `SCHEDULE_EXACT_ALARM` ใน Google Play Console (Declaration form)
- iOS: เปิด Time Sensitive capability, พิจารณา AlarmKit (iOS 26+), ขอ Critical Alerts เฉพาะถ้ามี use case ที่ Apple ยอมรับ
- ความเป็นส่วนตัว: ข้อมูลประจำเดือน/สุขภาพเป็นข้อมูลอ่อนไหว → เข้ารหัสข้อมูล (เช่น expo-secure-store + SQLCipher), นโยบายความเป็นส่วนตัว, สอดคล้อง PDPA
- เพิ่ม automated tests (Jest + React Native Testing Library, Maestro/Detox) และ crash reporting
- ทบทวนเนื้อหาสุขศึกษาโดยผู้เชี่ยวชาญ

## 15. Native APIs ที่ต้องใช้

| Platform | API | ใช้ใน prototype |
|---|---|---|
| Android | `AlarmManager.setAlarmClock` / `setAndAllowWhileIdle`, `canScheduleExactAlarms` | ✅ (Kotlin) |
| Android | `NotificationCompat.setFullScreenIntent`, `CATEGORY_ALARM`, `FLAG_INSISTENT`, `NotificationManager.canUseFullScreenIntent` | ✅ (Kotlin) |
| Android | NotificationChannel `USAGE_ALARM` + `res/raw` sound | ✅ |
| Android | `Activity.setShowWhenLocked/setTurnScreenOn` | ✅ (config plugin, manifest attrs) |
| iOS | `UNUserNotificationCenter`, `UNNotificationCategory/Action`, custom sound | ✅ (ผ่าน expo-notifications) |
| iOS | `UNNotificationInterruptionLevel.timeSensitive` | ⚠️ ตั้งค่าแล้ว แต่ต้องเพิ่ม entitlement |
| iOS | Critical Alerts entitlement, AlarmKit | ❌ |

## 16. Screen Time จริงต้องใช้ API ใด

**iOS** — Screen Time API (iOS 15/16+):
- `FamilyControls` — ขอสิทธิ์ `AuthorizationCenter.requestAuthorization(for: .individual)` และต้องได้ entitlement **Family Controls (Distribution)** จาก Apple
- `DeviceActivity` — `DeviceActivityMonitor` extension ตั้ง threshold เช่น "ใช้ครบ 30 นาที" แล้ว callback; `DeviceActivityReport` extension สำหรับแสดงรายงาน (ข้อมูลอยู่ใน sandbox ของ extension แอปหลักอ่านค่าดิบไม่ได้)
- `ManagedSettings` — ใส่ Shield บังคับพักแอปที่ผู้ใช้เลือกเองได้ (นี่คือวิธีเดียวบน iOS ที่ "บล็อก" แอปอื่นได้อย่างถูกต้อง โดยผู้ใช้ยินยอม)
- ต้องเขียน native Swift extensions + config plugin, ทดสอบบนเครื่องจริงเท่านั้น

**Android**:
- `UsageStatsManager.queryUsageStats / queryEvents` — ต้องให้ผู้ใช้เปิด **Usage Access** (`PACKAGE_USAGE_STATS`, เปิดผ่าน `Settings.ACTION_USAGE_ACCESS_SETTINGS`)
- เวลาใช้แบบ real-time ต้องใช้ Foreground Service หรือ WorkManager ตรวจเป็นระยะ
- Google Play มีนโยบายจำกัดการใช้ `PACKAGE_USAGE_STATS` ต้องอธิบาย use case
- Digital Wellbeing ของระบบไม่มี public API ให้แอปอื่นอ่าน

---

### Data model
ดู `src/types/index.ts`: `User`, `ScreenTimeSession`, `Activity`, `ActivitySession`, `BreakSession`, `BreakAlarm`, `SleepRecord`, `SleepPlan`, `MenstrualRecord`, `HealthRecord`, `NutritionPlan`, `ExercisePlan`, `AppSettings`, `ActiveFlow`

### เปลี่ยนไฟล์เสียง
แทนที่ไฟล์ใน `assets/sounds/` โดยใช้ **ชื่อเดิม** (ตัวพิมพ์เล็ก, ใช้ `_`), รูปแบบ `.wav` ยาวไม่เกิน 30 วินาที แล้ว build dev ใหม่ (`npx expo prebuild --clean && npx expo run:android`)
