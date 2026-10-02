import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../utils/theme';
import { AppText } from './AppText';

interface Props {
  data: { label: string; value: number; key: string; color?: string }[];
  height?: number;
  color?: string;
  /** แสดง label ทุก ๆ n แท่ง (สำหรับกราฟ 30 วัน) */
  labelEvery?: number;
  valueSuffix?: string;
  showValues?: boolean;
  maxValue?: number;
}

/** กราฟแท่งแบบเรียบง่าย (ไม่ต้องใช้ library เพิ่ม) */
export function BarChart({
  data,
  height = 140,
  color = colors.mintDeep,
  labelEvery = 1,
  showValues = true,
  maxValue,
}: Props) {
  const max = Math.max(maxValue ?? 0, 1, ...data.map((d) => d.value));
  return (
    <View accessibilityRole="image" accessibilityLabel={`กราฟ ${data.map((d) => `${d.label} ${d.value}`).join(', ')}`}>
      <View style={[styles.chart, { height }]}>
        {data.map((d) => {
          const h = Math.max(d.value > 0 ? 6 : 2, (d.value / max) * (height - 22));
          return (
            <View key={d.key} style={styles.col}>
              {showValues && d.value > 0 && data.length <= 14 ? (
                <AppText variant="label" color={colors.textSoft} style={{ fontSize: 11 }}>
                  {Number.isInteger(d.value) ? d.value : d.value.toFixed(1)}
                </AppText>
              ) : null}
              <View
                style={[
                  styles.bar,
                  {
                    height: h,
                    backgroundColor: d.value > 0 ? (d.color ?? color) : colors.border,
                    width: data.length > 14 ? 6 : 18,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.labels}>
        {data.map((d, i) => (
          <View key={d.key} style={styles.col}>
            <AppText variant="label" color={colors.textMuted} style={{ fontSize: 11 }}>
              {i % labelEvery === 0 ? d.label : ''}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { borderRadius: radius.pill },
  labels: { flexDirection: 'row', gap: 2, marginTop: 6 },
});
