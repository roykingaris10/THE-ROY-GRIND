import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '@/lib/constants';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

interface ProgressRingProps {
  progress: number;
  size?: number;
  label?: string;
  color?: string;
}

export function ProgressRing({ progress, size = 60, label, color = COLORS.primary }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const pct = Math.round(clamped * 100);
  const strokeWidth = Math.max(3, Math.round(size / 14));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const animProgress = useSharedValue(0);

  useEffect(() => {
    animProgress.value = withTiming(clamped, {
      duration: 700,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [clamped]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animProgress.value),
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={COLORS.border}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.5}
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.centerContent}>
        <Text style={[styles.pct, { fontSize: Math.round(size / 4.5) }]}>{pct}%</Text>
        {label && (
          <Text style={[styles.label, { fontSize: Math.max(6, Math.round(size / 9)) }]} numberOfLines={1}>
            {label}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pct: { fontFamily: mono, fontWeight: '700', color: COLORS.textPrimary },
  label: {
    color: COLORS.textMuted,
    fontFamily: mono,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
    textAlign: 'center',
  },
});
