import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { COLORS } from '@/lib/constants';
import type { GamificationLevel } from '@/types';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

interface XPBarProps {
  xp: number;
  level: GamificationLevel;
  progress: number;
  xpToNext: number;
}

export function XPBar({ xp, level, progress, xpToNext }: XPBarProps) {
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animWidth, { toValue: Math.min(1, progress), duration: 800, useNativeDriver: false }).start();
  }, [progress]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelIcon}>{level.icon}</Text>
          <Text style={styles.levelName}>{level.name}</Text>
        </View>
        <Text style={styles.xpText}>{xp} XP</Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[styles.fill, {
            width: animWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          }]}
        />
      </View>
      <Text style={styles.nextText}>
        {xpToNext > 0 ? `${xpToNext} XP to next level` : 'MAX LEVEL'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelIcon: { fontSize: 20 },
  levelName: { fontSize: 14, fontWeight: '900', color: COLORS.xp, fontFamily: mono, letterSpacing: 1, textTransform: 'uppercase' },
  xpText: { fontSize: 16, fontWeight: '900', color: COLORS.textPrimary, fontFamily: mono },
  track: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, backgroundColor: COLORS.xp, borderRadius: 4 },
  nextText: { fontSize: 9, color: COLORS.textMuted, fontFamily: mono, letterSpacing: 1, marginTop: 4, textAlign: 'right' },
});
