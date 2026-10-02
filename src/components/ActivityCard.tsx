import { StyleSheet, View } from 'react-native';
import { ActivityIllustration } from '../assets/illustrations/ActivityIllustration';
import { CATEGORY_LABEL } from '../data/activities';
import { Activity } from '../types';
import { colors } from '../utils/theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Card } from './Card';

interface Props {
  activity: Activity;
  onStart: () => void;
  title?: string;
}

export function ActivityCard({ activity, onStart, title = 'กิจกรรมแนะนำวันนี้' }: Props) {
  return (
    <Card tint={colors.cream}>
      <View style={styles.row}>
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="label" color={colors.teal}>
            {title}
          </AppText>
          <AppText variant="heading">
            {activity.name} {Math.round(activity.duration / 60)} นาที
          </AppText>
          <AppText variant="caption" color={colors.textSoft}>
            {CATEGORY_LABEL[activity.category]} · {activity.description}
          </AppText>
        </View>
        <ActivityIllustration kind={activity.illustration} size={96} />
      </View>
      <Button title="เริ่มกิจกรรม" icon="play" onPress={onStart} style={{ marginTop: 12 }} />
    </Card>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 12 } });
