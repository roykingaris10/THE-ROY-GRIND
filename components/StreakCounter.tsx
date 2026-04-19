import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { COLORS } from '@/lib/constants';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

interface StreakCounterProps {
  current: number;
  longest: number;
  compact?: boolean;
}

export function StreakCounter({ current, longest, compact }: StreakCounterProps) {
  const starSize = compact ? 18 : 28;
  const isActive = current > 0;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.2, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ]),
      ).start();
    }
  }, [isActive]);

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <Animated.Text
        style={[
          styles.star,
          {
            fontSize: starSize,
            color: isActive ? COLORS.gold : COLORS.textMuted,
            transform: [{ scale: isActive ? pulse : 1 }],
          },
        ]}
      >
        {isActive ? '\u2726' : '\u2727'}
      </Animated.Text>
      <View style={styles.textCol}>
        <Text style={[styles.count, !isActive && styles.countInactive]}>
          {current}
        </Text>
        <Text style={styles.label}>
          DAY STREAK
        </Text>
      </View>
      {!compact && (
        <View style={styles.bestCol}>
          <Text style={styles.bestLabel}>BEST</Text>
          <Text style={styles.bestValue}>{longest}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  compact: { gap: 8 },
  star: { textAlign: 'center' },
  textCol: { flex: 1 },
  count: { fontSize: 24, fontWeight: '900', color: COLORS.gold, fontFamily: mono },
  countInactive: { color: COLORS.textMuted },
  label: { fontSize: 9, color: COLORS.textSecondary, fontFamily: mono, letterSpacing: 1.5, textTransform: 'uppercase' },
  bestCol: { alignItems: 'center' },
  bestLabel: { fontSize: 8, color: COLORS.label, fontFamily: mono, letterSpacing: 1 },
  bestValue: { fontSize: 16, fontWeight: '700', color: COLORS.textSecondary, fontFamily: mono },
});
