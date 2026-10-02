import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../utils/theme';
import { THAI_DAYS_SHORT, THAI_MONTHS, toDateKey } from '../utils/time';
import { AppText } from './AppText';

interface Props {
  year: number;
  month: number; // 0-11
  onChangeMonth: (year: number, month: number) => void;
  /** สีของแต่ละวัน: key = YYYY-MM-DD */
  dayColors: Record<string, string | undefined>;
  onPressDay?: (key: string) => void;
  legend?: { label: string; color: string }[];
}

export function MonthCalendar({ year, month, onChangeMonth, dayColors, onPressDay, legend }: Props) {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);
  const todayKey = toDateKey(new Date());

  const shift = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    onChangeMonth(d.getFullYear(), d.getMonth());
  };

  return (
    <View style={{ gap: 10 }}>
      <View style={styles.header}>
        <Pressable onPress={() => shift(-1)} accessibilityLabel="เดือนก่อนหน้า" hitSlop={10} style={styles.nav}>
          <Ionicons name="chevron-back" size={20} color={colors.teal} />
        </Pressable>
        <AppText variant="subheading">
          {THAI_MONTHS[month]} {year + 543}
        </AppText>
        <Pressable onPress={() => shift(1)} accessibilityLabel="เดือนถัดไป" hitSlop={10} style={styles.nav}>
          <Ionicons name="chevron-forward" size={20} color={colors.teal} />
        </Pressable>
      </View>
      <View style={styles.row}>
        {THAI_DAYS_SHORT.map((d) => (
          <View key={d} style={styles.cell}>
            <AppText variant="label" color={colors.textMuted}>
              {d}
            </AppText>
          </View>
        ))}
      </View>
      {Array.from({ length: cells.length / 7 }).map((_, r) => (
        <View key={r} style={styles.row}>
          {cells.slice(r * 7, r * 7 + 7).map((day, i) => {
            if (!day) return <View key={i} style={styles.cell} />;
            const key = toDateKey(new Date(year, month, day));
            const bg = dayColors[key];
            const isToday = key === todayKey;
            return (
              <Pressable
                key={i}
                style={styles.cell}
                onPress={onPressDay ? () => onPressDay(key) : undefined}
                accessibilityLabel={`วันที่ ${day}`}
              >
                <View
                  style={[
                    styles.day,
                    bg ? { backgroundColor: bg } : null,
                    isToday ? { borderColor: colors.teal, borderWidth: 2 } : null,
                  ]}
                >
                  <AppText variant="caption" weight={isToday ? 'bold' : 'regular'}>
                    {day}
                  </AppText>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
      {legend ? (
        <View style={styles.legend}>
          {legend.map((l) => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: l.color }]} />
              <AppText variant="label" color={colors.textSoft}>
                {l.label}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nav: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', paddingVertical: 2 },
  day: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderColor: 'transparent', borderWidth: 2 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 12, height: 12, borderRadius: 6 },
});
