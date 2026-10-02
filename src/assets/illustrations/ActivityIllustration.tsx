import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import { IllustrationKey } from '../../types';
import { colors } from '../../utils/theme';

const SKIN = '#F6D2BC';
const HAIR = '#3E4B4B';
const SHIRT = colors.mintDeep;
const PANTS = colors.softBlueDeep;

function Head({ x = 100, y = 58, tilt = 0 }: { x?: number; y?: number; tilt?: number }) {
  return (
    <G rotation={tilt} origin={`${x}, ${y + 18}`}>
      <Circle cx={x} cy={y} r={22} fill={SKIN} />
      <Path d={`M${x - 22} ${y - 2} Q${x} ${y - 34} ${x + 22} ${y - 2} Q${x + 10} ${y - 14} ${x - 22} ${y - 2} Z`} fill={HAIR} />
      <Circle cx={x - 8} cy={y + 2} r={2.2} fill={HAIR} />
      <Circle cx={x + 8} cy={y + 2} r={2.2} fill={HAIR} />
      <Path d={`M${x - 6} ${y + 10} Q${x} ${y + 15} ${x + 6} ${y + 10}`} stroke={HAIR} strokeWidth={2} fill="none" strokeLinecap="round" />
      <Circle cx={x - 14} cy={y + 9} r={3.5} fill={colors.peachDeep} opacity={0.5} />
      <Circle cx={x + 14} cy={y + 9} r={3.5} fill={colors.peachDeep} opacity={0.5} />
    </G>
  );
}

const limb = { stroke: SKIN, strokeWidth: 10, strokeLinecap: 'round' as const };
const leg = { stroke: PANTS, strokeWidth: 13, strokeLinecap: 'round' as const };

function Body() {
  return <Rect x={78} y={82} width={44} height={58} rx={18} fill={SHIRT} />;
}

function Ground() {
  return <Ellipse cx={100} cy={192} rx={70} ry={8} fill={colors.mint} />;
}

function Pose({ kind }: { kind: IllustrationKey }) {
  switch (kind) {
    case 'neck':
      return (
        <G>
          <Ground />
          <Line x1={90} y1={138} x2={86} y2={186} {...leg} />
          <Line x1={110} y1={138} x2={114} y2={186} {...leg} />
          <Body />
          <Line x1={80} y1={92} x2={70} y2={138} {...limb} />
          <Line x1={120} y1={92} x2={130} y2={138} {...limb} />
          <Head tilt={-18} />
          <Path d="M140 40 Q155 55 142 72" stroke={colors.teal} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Path d="M138 70 L142 74 L147 68" stroke={colors.teal} strokeWidth={3} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'arms':
      return (
        <G>
          <Ground />
          <Line x1={90} y1={138} x2={86} y2={186} {...leg} />
          <Line x1={110} y1={138} x2={114} y2={186} {...leg} />
          <Body />
          <Line x1={82} y1={90} x2={92} y2={22} {...limb} />
          <Line x1={118} y1={90} x2={108} y2={22} {...limb} />
          <Circle cx={100} cy={16} r={8} fill={SKIN} />
          <Head y={60} />
        </G>
      );
    case 'ankle':
      return (
        <G>
          <Rect x={60} y={132} width={80} height={12} rx={6} fill={colors.lavenderDeep} opacity={0.6} />
          <Line x1={70} y1={144} x2={70} y2={190} stroke={colors.lavenderDeep} strokeWidth={6} strokeLinecap="round" opacity={0.6} />
          <Line x1={130} y1={144} x2={130} y2={190} stroke={colors.lavenderDeep} strokeWidth={6} strokeLinecap="round" opacity={0.6} />
          <Body />
          <Line x1={92} y1={134} x2={128} y2={134} {...leg} />
          <Line x1={128} y1={134} x2={150} y2={160} {...leg} />
          <Line x1={104} y1={134} x2={98} y2={186} {...leg} />
          <Ellipse cx={156} cy={166} rx={9} ry={6} fill={HAIR} />
          <Path d="M168 150 A16 16 0 1 1 146 178" stroke={colors.teal} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Line x1={80} y1={92} x2={72} y2={130} {...limb} />
          <Line x1={120} y1={92} x2={128} y2={128} {...limb} />
          <Head />
        </G>
      );
    case 'walk':
      return (
        <G>
          <Ground />
          <Line x1={94} y1={138} x2={74} y2={184} {...leg} />
          <Line x1={106} y1={138} x2={126} y2={184} {...leg} />
          <Body />
          <Line x1={80} y1={92} x2={62} y2={128} {...limb} />
          <Line x1={120} y1={92} x2={138} y2={124} {...limb} />
          <Head />
          <Path d="M30 120 h18 M24 134 h18 M34 148 h14" stroke={colors.softBlueDeep} strokeWidth={3} strokeLinecap="round" />
        </G>
      );
    case 'breath':
      return (
        <G>
          <Ground />
          <Ellipse cx={100} cy={176} rx={46} ry={14} fill={colors.lavender} />
          <Line x1={84} y1={150} x2={120} y2={172} {...leg} />
          <Line x1={116} y1={150} x2={80} y2={172} {...leg} />
          <Rect x={78} y={92} width={44} height={60} rx={18} fill={SHIRT} />
          <Line x1={82} y1={102} x2={96} y2={122} {...limb} />
          <Line x1={118} y1={102} x2={104} y2={122} {...limb} />
          <Head y={68} />
          <Path d="M134 50 Q146 42 158 50 Q170 58 182 50" stroke={colors.softBlueDeep} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Path d="M138 66 Q150 58 162 66 Q174 74 186 66" stroke={colors.softBlueDeep} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.6} />
        </G>
      );
    case 'water':
    default:
      return (
        <G>
          <Ground />
          <Line x1={90} y1={138} x2={86} y2={186} {...leg} />
          <Line x1={110} y1={138} x2={114} y2={186} {...leg} />
          <Body />
          <Line x1={80} y1={92} x2={70} y2={138} {...limb} />
          <Line x1={120} y1={92} x2={128} y2={78} {...limb} />
          <Path d="M124 50 L144 50 L140 82 L128 82 Z" fill={colors.softBlue} stroke={colors.softBlueDeep} strokeWidth={2} />
          <Rect x={127} y={62} width={14} height={18} fill={colors.softBlueDeep} opacity={0.5} />
          <Head />
        </G>
      );
  }
}

export function ActivityIllustration({ kind, size = 200 }: { kind: IllustrationKey; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" accessibilityLabel="ภาพประกอบกิจกรรม">
      <Circle cx={100} cy={100} r={96} fill={colors.cream} />
      <Pose kind={kind} />
    </Svg>
  );
}
