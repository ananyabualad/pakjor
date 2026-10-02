import { Activity, ActivityCategory } from '../types';

export const ACTIVITIES: Activity[] = [
  {
    id: 'stretch-neck',
    name: 'ยืดคอและไหล่',
    description: 'คลายกล้ามเนื้อคอ บ่า ไหล่ ที่ตึงจากการก้มมองจอ',
    steps: [
      'นั่งหรือยืนหลังตรง ปล่อยไหล่ตามสบาย',
      'เอียงศีรษะไปทางขวาช้า ๆ ค้างไว้ 10 วินาที แล้วสลับซ้าย',
      'ก้มคางเข้าหาอก ค้างไว้ 10 วินาที',
      'หมุนไหล่ไปด้านหลังช้า ๆ 10 รอบ',
    ],
    duration: 60,
    category: 'stretching',
    illustration: 'neck',
    difficulty: 'easy',
  },
  {
    id: 'stretch-arms',
    name: 'ยืดแขน',
    description: 'ยืดแขน ข้อมือ และนิ้วมือ ที่ใช้งานหนักจากการถือโทรศัพท์',
    steps: [
      'ประสานมือแล้วเหยียดแขนขึ้นเหนือศีรษะ ค้างไว้ 10 วินาที',
      'เหยียดแขนขวาไปด้านหน้า ใช้มือซ้ายดึงนิ้วเข้าหาตัวเบา ๆ 10 วินาที แล้วสลับข้าง',
      'กำมือ-แบมือช้า ๆ 10 ครั้ง',
      'สะบัดข้อมือเบา ๆ ให้ผ่อนคลาย',
    ],
    duration: 60,
    category: 'stretching',
    illustration: 'arms',
    difficulty: 'easy',
  },
  {
    id: 'ankle-rotation',
    name: 'หมุนข้อเท้า',
    description: 'ช่วยการไหลเวียนเลือดที่ขา หลังนั่งนาน ๆ',
    steps: [
      'นั่งบนเก้าอี้ ยกเท้าขวาขึ้นเล็กน้อย',
      'หมุนข้อเท้าตามเข็มนาฬิกา 10 รอบ แล้วทวนเข็ม 10 รอบ',
      'สลับทำกับเท้าซ้าย',
      'กระดกปลายเท้าขึ้น-ลง 10 ครั้ง',
    ],
    duration: 60,
    category: 'stretching',
    illustration: 'ankle',
    difficulty: 'easy',
  },
  {
    id: 'walk',
    name: 'ลุกเดิน',
    description: 'ลุกจากที่นั่งแล้วเดินเบา ๆ ลดพฤติกรรมเนือยนิ่ง',
    steps: [
      'วางโทรศัพท์ไว้ แล้วลุกขึ้นยืน',
      'เดินไปรอบ ๆ ห้องหรือทางเดินด้วยจังหวะสบาย ๆ',
      'แกว่งแขนตามธรรมชาติ หายใจลึก ๆ',
      'ถ้าสะดวก ลองเดินขึ้น-ลงบันไดสั้น ๆ',
    ],
    duration: 60,
    category: 'walking',
    illustration: 'walk',
    difficulty: 'easy',
  },
  {
    id: 'breathing',
    name: 'ฝึกหายใจ',
    description: 'หายใจช้า ๆ ช่วยให้ใจสงบและผ่อนคลาย',
    steps: [
      'นั่งสบาย ๆ หลับตาหรือมองต่ำ',
      'หายใจเข้าทางจมูกช้า ๆ นับ 1-2-3-4',
      'กลั้นไว้เบา ๆ นับ 1-2-3-4',
      'หายใจออกทางปากช้า ๆ นับ 1-2-3-4-5-6 แล้วทำซ้ำ',
    ],
    duration: 60,
    category: 'breathing',
    illustration: 'breath',
    difficulty: 'easy',
  },
  {
    id: 'drink-water',
    name: 'ดื่มน้ำ',
    description: 'เติมน้ำให้ร่างกาย พร้อมได้ลุกเดินไปด้วย',
    steps: [
      'ลุกไปหยิบแก้วน้ำ',
      'ค่อย ๆ จิบน้ำเปล่า 1 แก้ว',
      'ระหว่างดื่ม มองออกไปไกล ๆ พักสายตา',
      'เติมน้ำใส่ขวดเตรียมไว้สำหรับรอบถัดไป',
    ],
    duration: 60,
    category: 'hydration',
    illustration: 'water',
    difficulty: 'easy',
  },
];

export const CATEGORY_LABEL: Record<ActivityCategory, string> = {
  stretching: 'ยืดเส้น',
  walking: 'เดิน',
  breathing: 'ฝึกหายใจ',
  hydration: 'ดื่มน้ำ',
};

export const getActivityById = (id: string): Activity | undefined =>
  ACTIVITIES.find((a) => a.id === id);
