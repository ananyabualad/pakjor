import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { colors } from '../../utils/theme';

/** ภาพหน้าหลัก: โทรศัพท์ที่ถูกวางพัก ล้อมด้วยใบไม้ หัวใจ และเมฆ */
export function HeroIllustration({ size = 150 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 160 160" accessibilityLabel="ภาพประกอบพักจอ">
      <Circle cx={80} cy={84} r={66} fill={colors.mint} />
      <G>
        <Rect x={52} y={36} width={56} height={96} rx={14} fill={colors.white} stroke={colors.teal} strokeWidth={4} />
        <Rect x={70} y={44} width={20} height={4} rx={2} fill={colors.teal} opacity={0.4} />
        <Path d="M68 92 Q80 74 92 92" stroke={colors.teal} strokeWidth={4} fill="none" strokeLinecap="round" />
        <Path d="M66 78 h8 M86 78 h8" stroke={colors.teal} strokeWidth={4} strokeLinecap="round" />
        <Path d="M74 108 Q80 112 86 108" stroke={colors.peachDeep} strokeWidth={3} fill="none" strokeLinecap="round" />
      </G>
      <Path d="M18 120 C14 96 30 80 52 80 C52 102 40 120 18 120 Z" fill={colors.mintDeep} />
      <Path d="M142 118 C146 96 132 82 112 82 C112 102 122 118 142 118 Z" fill={colors.teal} opacity={0.75} />
      <Path
        d="M128 40s-8-5-10.4-10c-1.6-3.6.7-7.8 4.6-7.8 2.3 0 3.8 1.2 4.8 2.7 1-1.5 2.5-2.7 4.8-2.7 3.9 0 6.2 4.2 4.6 7.8C136 35 128 40 128 40z"
        fill={colors.peachDeep}
      />
      <G fill={colors.white}>
        <Circle cx={30} cy={40} r={9} />
        <Circle cx={40} cy={36} r={11} />
        <Circle cx={50} cy={42} r={8} />
      </G>
    </Svg>
  );
}
