import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { colors } from '../utils/theme';

export function Cloud({ width = 90, color = colors.white, opacity = 1 }: { width?: number; color?: string; opacity?: number }) {
  const h = width * 0.55;
  return (
    <Svg width={width} height={h} viewBox="0 0 100 55" opacity={opacity}>
      <G fill={color}>
        <Ellipse cx="30" cy="38" rx="28" ry="16" />
        <Circle cx="50" cy="24" r="22" />
        <Ellipse cx="72" cy="38" rx="24" ry="15" />
      </G>
    </Svg>
  );
}

export function Leaf({ size = 28, color = colors.mintDeep, rotate = 0 }: { size?: number; color?: string; rotate?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" style={{ transform: [{ rotate: `${rotate}deg` }] }}>
      <Path d="M8 34 C6 18 18 6 34 6 C34 22 24 34 8 34 Z" fill={color} opacity={0.85} />
      <Path d="M10 32 L28 12" stroke={colors.white} strokeWidth={2} strokeLinecap="round" opacity={0.8} />
    </Svg>
  );
}

export function Heart({ size = 22, color = colors.peachDeep }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.6 4.5c2.1 0 3.5 1.1 4.4 2.5.9-1.4 2.3-2.5 4.4-2.5 3.6 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z"
        fill={color}
      />
    </Svg>
  );
}

export function Sparkle({ size = 16, color = colors.lavenderDeep }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill={color} />
    </Svg>
  );
}
