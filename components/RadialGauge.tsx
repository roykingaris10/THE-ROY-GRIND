import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { COLORS } from '@/lib/constants';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

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
  const animProgress = useRef(new Animated.Value(0)).current;
  const clamped = Math.max(0, Math.min(1, progress));
  const pct = Math.round(clamped * 100);

  useEffect(() => {
    Animated.timing(animProgress, {
      toValue: clamped,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [clamped]);

  const strokeWidth = Math.max(4, Math.round(size / 15));
  const radius = (size - strokeWidth) / 2;
  const halfSize = size / 2;

  // We render a semi-circle using border tricks
  // The gauge is a half-circle (180 degrees)
  // We use two overlapping quarter-circle segments

  // For a semi-circular gauge we split into left-quarter and right-quarter
  // Progress 0..0.5 fills the right quarter, 0.5..1 fills the left quarter
  const rightFill = Math.min(clamped * 2, 1); // 0-1 for right quadrant
  const leftFill = Math.max(0, (clamped - 0.5) * 2); // 0-1 for left quadrant

  return (
    <View style={[styles.container, { width: size, height: halfSize + 8 }]}>
      {/* Track - semi circle */}
      <View style={[styles.semiTrack, { width: size, height: halfSize, borderTopLeftRadius: radius + strokeWidth / 2, borderTopRightRadius: radius + strokeWidth / 2 }]}>
        <View
          style={{
            width: size,
            height: halfSize,
            borderTopLeftRadius: radius + strokeWidth / 2,
            borderTopRightRadius: radius + strokeWidth / 2,
            borderWidth: strokeWidth,
            borderBottomWidth: 0,
            borderColor: trackColor,
          }}
        />
      </View>

      {/* Fill - right half (0-90 degrees from right) */}
      <View style={[styles.fillWrap, { width: halfSize, height: halfSize, right: 0, overflow: 'hidden' }]}>
        <Animated.View
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: halfSize,
            height: halfSize,
            borderTopRightRadius: radius + strokeWidth / 2,
            borderWidth: strokeWidth,
            borderBottomWidth: 0,
            borderLeftWidth: 0,
            borderColor: color,
            opacity: animProgress.interpolate({
              inputRange: [0, 0.01, 1],
              outputRange: [0, 1, 1],
            }),
            transform: [
              {
                rotate: animProgress.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: ['90deg', '0deg', '0deg'],
                }),
              },
            ],
            transformOrigin: 'left bottom',
          }}
        />
      </View>

      {/* Fill - left half (90-180 degrees from right) */}
      <View style={[styles.fillWrap, { width: halfSize, height: halfSize, left: 0, overflow: 'hidden' }]}>
        <Animated.View
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: halfSize,
            height: halfSize,
            borderTopLeftRadius: radius + strokeWidth / 2,
            borderWidth: strokeWidth,
            borderBottomWidth: 0,
            borderRightWidth: 0,
            borderColor: color,
            opacity: animProgress.interpolate({
              inputRange: [0, 0.5, 0.51, 1],
              outputRange: [0, 0, 1, 1],
            }),
            transform: [
              {
                rotate: animProgress.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: ['-90deg', '-90deg', '0deg'],
                }),
              },
            ],
            transformOrigin: 'right bottom',
          }}
        />
      </View>

      {/* Center text */}
      <View style={[styles.centerText, { bottom: 0, width: size }]}>
        <Text style={[styles.pctText, { fontSize: Math.round(size / 4), color }]}>{pct}%</Text>
        {label && (
          <Text style={[styles.labelText, { fontSize: Math.max(8, Math.round(size / 12)) }]}>
            {label}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
  },
  semiTrack: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
  },
  fillWrap: {
    position: 'absolute',
    top: 0,
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
