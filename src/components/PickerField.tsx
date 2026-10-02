import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { colors, radius } from '../utils/theme';
import { AppText } from './AppText';
import { Button } from './Button';

interface Props {
  label: string;
  value: Date | null;
  mode: 'date' | 'time';
  onChange: (date: Date) => void;
  placeholder?: string;
  display?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

/** ปุ่มเลือกวันที่/เวลา — Android ใช้ dialog ของระบบ, iOS ใช้ spinner ใน bottom sheet */
export function PickerField({ label, value, mode, onChange, placeholder = 'เลือก', display, maximumDate, minimumDate }: Props) {
  const [open, setOpen] = useState(false);
  const [temp, setTemp] = useState<Date>(value ?? new Date());

  const handleAndroid = (event: DateTimePickerEvent, date?: Date) => {
    setOpen(false);
    if (event.type === 'set' && date) onChange(date);
  };

  return (
    <View style={{ gap: 6, flex: 1 }}>
      <AppText variant="label" color={colors.textSoft}>
        {label}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label} ${display ?? ''}`}
        style={styles.field}
        onPress={() => {
          setTemp(value ?? new Date());
          setOpen(true);
        }}
      >
        <AppText variant="body" weight="semibold" color={value ? colors.text : colors.textMuted}>
          {display ?? placeholder}
        </AppText>
        <Ionicons name={mode === 'time' ? 'time-outline' : 'calendar-outline'} size={20} color={colors.teal} />
      </Pressable>

      {open && Platform.OS === 'android' ? (
        <DateTimePicker
          value={value ?? new Date()}
          mode={mode}
          is24Hour
          onChange={handleAndroid}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      ) : null}

      {Platform.OS !== 'android' ? (
        <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="ปิด" />
          <View style={styles.sheet}>
            <AppText variant="subheading" center>
              {label}
            </AppText>
            <DateTimePicker
              value={temp}
              mode={mode}
              display="spinner"
              is24Hour
              locale="th-TH"
              onChange={(_, d) => d && setTemp(d)}
              maximumDate={maximumDate}
              minimumDate={minimumDate}
              textColor={colors.text}
            />
            <Button
              title="ตกลง"
              onPress={() => {
                onChange(temp);
                setOpen(false);
              }}
            />
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    minHeight: 50,
    backgroundColor: colors.white,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(39,63,63,0.3)' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
});
