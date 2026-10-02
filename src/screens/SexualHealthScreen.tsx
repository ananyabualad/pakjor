import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { Screen, ScreenHeader } from '../components/Screen';
import { InlineNotice } from '../components/States';
import { EduCard, SEXUAL_HEALTH_CARDS } from '../data/sexualHealth';
import { colors } from '../utils/theme';

const TINT: Record<EduCard['tint'], { bg: string; fg: string }> = {
  mint: { bg: colors.mint, fg: colors.teal },
  softBlue: { bg: colors.softBlue, fg: colors.softBlueDeep },
  lavender: { bg: colors.lavender, fg: colors.lavenderDeep },
  peach: { bg: colors.peach, fg: colors.peachDeep },
  cream: { bg: colors.cream, fg: '#C08A2E' },
};

export function SexualHealthScreen() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <Screen>
      <ScreenHeader back title="สุขภาพทางเพศ" subtitle="ความรู้ที่ถูกต้อง เพื่อดูแลตัวเองและคนที่เรารัก" />
      {SEXUAL_HEALTH_CARDS.map((card) => {
        const t = TINT[card.tint];
        const expanded = open === card.id;
        return (
          <Card key={card.id} tint={t.bg} onPress={() => setOpen(expanded ? null : card.id)} accessibilityLabel={card.title}>
            <View style={styles.head}>
              <View style={styles.icon}>
                <Ionicons name={card.icon as keyof typeof Ionicons.glyphMap} size={22} color={t.fg} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="subheading">{card.title}</AppText>
                <AppText variant="caption" color={colors.textSoft}>
                  {card.summary}
                </AppText>
              </View>
              <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={t.fg} />
            </View>
            {expanded ? (
              <View style={styles.body}>
                {card.sections.map((s) => (
                  <View key={s.heading} style={{ gap: 4 }}>
                    <AppText variant="body" weight="semibold">
                      {s.heading}
                    </AppText>
                    {s.points.map((p) => (
                      <View key={p} style={styles.point}>
                        <AppText variant="caption" color={t.fg}>
                          •
                        </AppText>
                        <AppText variant="caption" style={{ flex: 1 }}>
                          {p}
                        </AppText>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ) : null}
          </Card>
        );
      })}
      <InlineNotice
        tone="info"
        icon="call-outline"
        title="ต้องการคำปรึกษา"
        message="ปรึกษาได้ที่โรงพยาบาล ศูนย์บริการสาธารณสุข หรือสายด่วน 1663 (ปรึกษาเรื่องเอดส์และท้องไม่พร้อม)"
        actionLabel="โทร 1663"
        onAction={() => Linking.openURL('tel:1663')}
      />
      <AppText variant="label" color={colors.textMuted} center>
        เนื้อหาเพื่อสุขศึกษาทั่วไป ไม่ใช่การวินิจฉัยหรือการรักษา
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  body: { marginTop: 14, gap: 12, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 16, padding: 14 },
  point: { flexDirection: 'row', gap: 8 },
});
