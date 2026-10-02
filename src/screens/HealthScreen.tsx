import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { Heart, Leaf } from '../components/Decorations';
import { HealthCard } from '../components/HealthCard';
import { Screen, ScreenHeader, SectionTitle } from '../components/Screen';
import { DEFAULT_USER } from '../data/defaults';
import { useStoredValue } from '../hooks/useStoredValue';
import { RootStackParamList } from '../navigation/types';
import { STORAGE_KEYS } from '../storage/keys';
import { User } from '../types';
import { colors } from '../utils/theme';

export function HealthScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useStoredValue<User>(STORAGE_KEYS.user, DEFAULT_USER);

  return (
    <Screen>
      <ScreenHeader title="สุขภาพ" subtitle="ดูแลตัวเองครบทุกด้าน" />
      <Card tint={colors.mint} style={styles.hero} onPress={() => navigation.navigate('Profile')}>
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="heading">สวัสดี{user.data.name ? ` ${user.data.name}` : ''} 👋</AppText>
          <AppText variant="caption" color={colors.textSoft}>
            {user.data.name ? 'แตะเพื่อแก้ไขโปรไฟล์' : 'ตั้งค่าโปรไฟล์เพื่อใช้กับการคำนวณ BMI ได้สะดวกขึ้น'}
          </AppText>
        </View>
        <Heart size={30} />
        <Leaf size={30} rotate={20} />
      </Card>

      <SectionTitle>หมวดสุขภาพ</SectionTitle>
      <View style={{ gap: 12 }}>
        <HealthCard icon="water-outline" title="ประจำเดือน" subtitle="บันทึกรอบเดือน อาการ และดูปฏิทิน" tint={colors.peach} iconColor={colors.peachDeep} onPress={() => navigation.navigate('Menstrual')} />
        <HealthCard icon="shield-checkmark-outline" title="สุขภาพทางเพศ" subtitle="ความรู้เรื่องการป้องกันและการดูแลตัวเอง" tint={colors.lavender} iconColor={colors.lavenderDeep} onPress={() => navigation.navigate('SexualHealth')} />
        <HealthCard icon="nutrition-outline" title="BMI & พลังงาน" subtitle="คำนวณ BMI พลังงานต่อวัน และแนวทางอาหาร" tint={colors.cream} iconColor="#C08A2E" onPress={() => navigation.navigate('BMI')} />
        <HealthCard icon="walk-outline" title="กิจกรรมทางกาย" subtitle="วางแผนออกกำลังกายรายสัปดาห์" tint={colors.softBlue} iconColor={colors.softBlueDeep} onPress={() => navigation.navigate('Exercise')} />
        <HealthCard icon="person-circle-outline" title="โปรไฟล์" subtitle="ข้อมูลส่วนตัวและเป้าหมายสุขภาพ" tint={colors.mint} onPress={() => navigation.navigate('Profile')} />
      </View>

      <AppText variant="label" color={colors.textMuted} center>
        ข้อมูลในแอปนี้เป็นความรู้ทั่วไปเพื่อการดูแลสุขภาพ ไม่ใช่การวินิจฉัยหรือคำแนะนำทางการแพทย์เฉพาะบุคคล
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
