import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '@/lib/constants';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RadialGaugeProps {
  progress: number;
  size?: number;
  color?: string;
  label?: string;
  trackColor?: string;
}

export function RadialGauge({
  progress,
  size = 120,
  color = COLORS.primary,
  label,
  trackColor = COLORS.border,
}: RadialGaugeProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const pct = Math.round(clamped * 100);

  const strokeWidth = Math.max(6, Math.round(size / 12));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const animProgress = useSharedValue(0);

  useEffect(() => {
    animProgress.value = withTiming(clamped, {
      duration: 900,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [clamped]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animProgress.value),
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={COLORS.gold} stopOpacity="0.8" />
          </LinearGradient>
        </Defs>

        {/* Track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.4}
        />

        {/* Glow layer */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth + 4}
          fill="none"
          opacity={0.1}
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation={-90}
          origin={`${center}, ${center}`}
        />

        {/* Fill */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#gaugeGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>

      <View style={[styles.centerText, { width: size, height: size }]}>
        <Text style={[styles.pctText, { fontSize: Math.round(size / 4.5), color }]}>
          {pct}%
        </Text>
        {label && (
          <Text style={[styles.labelText, { fontSize: Math.max(8, Math.round(size / 14)) }]}>
            {label}
          </Text>
        )}
      </View>
    </View>
  );
}

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pctText: {
    fontFamily: mono,
    fontWeight: '900',
  },
  labelText: {
    color: COLORS.textMuted,
    fontFamily: mono,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
});
