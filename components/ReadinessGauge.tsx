import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS } from '@/lib/constants';
import { FONTS } from '@/lib/typography';
import type { ReadinessResult } from '@/lib/readiness';

interface ReadinessGaugeProps {
  readiness: ReadinessResult;
  size?: number;
}

export function ReadinessGauge({ readiness, size = 180 }: ReadinessGaugeProps) {
  const r = (size - 16) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const arc = 270;
  const startA = 135;
  const circumference = 2 * Math.PI * r;
  const dashFull = (arc / 360) * circumference;
  const pct = readiness.score / 100;

  const color = readiness.score >= 80 ? COLORS.success
    : readiness.score >= 60 ? COLORS.gold
    : readiness.score >= 40 ? COLORS.purpleWarm
    : COLORS.warning;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="rgGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={COLORS.purpleWarm} />
            <Stop offset="50%" stopColor={COLORS.gold} />
            <Stop offset="100%" stopColor={COLORS.success} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke={COLORS.border} strokeWidth={4}
          strokeDasharray={`${dashFull} ${circumference}`}
          strokeLinecap="round"
          rotation={startA} origin={`${cx}, ${cy}`}
        />
        <Circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke="url(#rgGrad)" strokeWidth={4}
          strokeDasharray={`${dashFull * pct} ${circumference}`}
          strokeLinecap="round"
          rotation={startA} origin={`${cx}, ${cy}`}
        />
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (startA + (i / 10) * arc) * Math.PI / 180;
          const x1 = cx + Math.cos(a) * (r - 10);
          const y1 = cy + Math.sin(a) * (r - 10);
          const x2 = cx + Math.cos(a) * (r - 14);
          const y2 = cy + Math.sin(a) * (r - 14);
          return <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLORS.silverDim} strokeWidth={0.6} opacity={0.6} />;
        })}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={styles.label}>READINESS</Text>
        <Text style={[styles.score, { color }]}>{readiness.score}</Text>
        <Text style={styles.sublabel}>OF 100</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5, color: COLORS.textMuted, textTransform: 'uppercase' },
  score: { fontSize: 56, fontFamily: FONTS.serif, lineHeight: 60, marginTop: 4 },
  sublabel: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5, color: COLORS.silverDim, marginTop: 2 },
});
