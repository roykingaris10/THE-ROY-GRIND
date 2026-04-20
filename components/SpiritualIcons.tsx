import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Svg, { Circle, Path, Line, Ellipse, Rect, Defs, RadialGradient, Stop, G } from 'react-native-svg';
import { COLORS } from '@/lib/constants';

interface IconProps {
  size?: number;
  color?: string;
}

export function OrthodoxCross({ size = 20, color = COLORS.gold }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round">
      <Path d="M12 2 L12 22" />
      <Path d="M8 6 L16 6" />
      <Path d="M7 11 L17 11" />
      <Path d="M6 17 L18 15" />
    </Svg>
  );
}

export function ChiRho({ size = 28, color = COLORS.gold }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round">
      <Path d="M10 10 L30 30 M30 10 L10 30" />
      <Path d="M20 6 L20 34" />
      <Path d="M20 20 C 26 20 26 14 20 14" />
    </Svg>
  );
}

export function Halo({ size = 80, color = COLORS.gold }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="haloGrad" cx="50%" cy="50%">
          <Stop offset="0%" stopColor={color} stopOpacity={0.9} />
          <Stop offset="70%" stopColor={color} stopOpacity={0.35} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={50} cy={50} r={48} fill="url(#haloGrad)" />
      <Circle cx={50} cy={50} r={36} fill="none" stroke={color} strokeWidth={0.6} opacity={0.7} />
      <Circle cx={50} cy={50} r={42} fill="none" stroke={color} strokeWidth={0.3} opacity={0.5} />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30) * Math.PI / 180;
        const x1 = 50 + Math.cos(a) * 38;
        const y1 = 50 + Math.sin(a) * 38;
        const x2 = 50 + Math.cos(a) * 46;
        const y2 = 50 + Math.sin(a) * 46;
        return <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={0.7} opacity={0.75} />;
      })}
    </Svg>
  );
}

export function Flame({ size = 14, color = COLORS.gold }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2 C 12 8 18 10 18 15 C 18 19 15 22 12 22 C 9 22 6 19 6 15 C 6 12 8 10 10 8 C 10 10 11 12 12 12 C 12 8 12 5 12 2 Z" opacity={0.9} />
      <Path d="M12 18 C 11 18 10 17 10 16 C 10 14 12 13 12 11 C 12 13 14 14 14 16 C 14 17 13 18 12 18 Z" fill={COLORS.silverBright} opacity={0.7} />
    </Svg>
  );
}

export function Dove({ size = 20, color = COLORS.gold }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 14 C 4 10 7 8 11 8 L16 8 C 19 8 20 10 20 12 C 20 14 18 15 16 15 L14 15 L12 19 L10 19 L10 15 C 6 15 4 15 4 14 Z" />
      <Circle cx={17} cy={11} r={0.6} fill={color} />
    </Svg>
  );
}

export function CellIcon({ size = 18, color = COLORS.silver }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 20 L4 10 L12 4 L20 10 L20 20 Z" />
      <Path d="M10 20 L10 14 L14 14 L14 20" />
      <Circle cx={12} cy={17} r={0.4} fill={color} />
    </Svg>
  );
}

interface SaintFigureProps {
  size?: number;
  haloColor?: string;
  robeColor?: string;
}

export function SaintFigure({ size = 80, haloColor = COLORS.gold, robeColor = COLORS.purpleImperial }: SaintFigureProps) {
  const h = size * 1.25;
  return (
    <Svg width={size} height={h} viewBox="0 0 80 100">
      <Circle cx={40} cy={28} r={22} fill={haloColor} opacity={0.4} />
      <Circle cx={40} cy={28} r={20} fill="none" stroke={haloColor} strokeWidth={0.6} opacity={0.9} />
      <Circle cx={40} cy={28} r={16} fill="none" stroke={haloColor} strokeWidth={0.3} opacity={0.6} />
      <Ellipse cx={40} cy={32} rx={9} ry={11} fill="#D4A573" opacity={0.85} />
      <Path d="M31 28 C 31 22 36 18 40 18 C 44 18 49 22 49 28 C 49 30 48 32 46 32 L34 32 C 32 32 31 30 31 28 Z" fill="#2a1e15" opacity={0.8} />
      <Path d="M34 38 C 34 44 40 48 40 48 C 40 48 46 44 46 38" fill="#2a1e15" opacity={0.7} />
      <Path d={`M18 95 L22 55 C 24 48 32 44 40 44 C 48 44 56 48 58 55 L62 95 Z`} fill={robeColor} />
      <Path d="M34 44 L40 52 L46 44" fill="none" stroke={haloColor} strokeWidth={0.8} opacity={0.8} />
      <Rect x={42} y={62} width={14} height={18} fill={haloColor} opacity={0.9} rx={1} />
      <Path d="M45 66 L53 66 M45 70 L53 70 M45 74 L53 74" stroke="#2a1e15" strokeWidth={0.4} opacity={0.6} />
      <Circle cx={30} cy={65} r={3} fill="#D4A573" opacity={0.85} />
    </Svg>
  );
}

interface IconFrameProps {
  children: React.ReactNode;
  width: number;
  height: number;
  glow?: boolean;
}

export function IconFrame({ children, width, height, glow }: IconFrameProps) {
  return (
    <View style={[
      styles.iconFrame,
      { width, height },
      glow && styles.iconFrameGlow,
    ]}>
      <View style={styles.iconFrameInner}>
        {children}
      </View>
    </View>
  );
}

export function Quill({ size = 16, color = COLORS.silverDim }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 20 C 8 16 14 10 20 4 C 18 10 14 16 8 20 Z" />
      <Path d="M4 20 L7 17" opacity={0.6} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  iconFrame: {
    backgroundColor: '#1a1224',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.35)',
    borderRadius: 6,
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#6B4E9E',
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 0 },
      },
      android: { elevation: 4 },
    }),
  },
  iconFrameGlow: {
    ...Platform.select({
      ios: {
        shadowColor: '#C9A961',
        shadowOpacity: 0.25,
        shadowRadius: 24,
      },
      android: { elevation: 8 },
    }),
  },
  iconFrameInner: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(201,169,97,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
});
