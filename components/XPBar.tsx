import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.timing(animWidth, { toValue: Math.min(1, progress), duration: 900, useNativeDriver: false }).start();
  }, [progress]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.7, duration: 2000, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 2000, useNativeDriver: false }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Animated.Text style={[styles.levelIcon, { opacity: glowAnim }]}>{level.icon}</Animated.Text>
          <Text style={styles.levelName}>{level.name}</Text>
        </View>
        <Text style={styles.xpText}>{xp} XP</Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[styles.fillWrap, {
            width: animWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          }]}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.purpleWarm]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fill}
          />
        </Animated.View>
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
  levelIcon: { fontSize: 22 },
  levelName: { fontSize: 14, fontFamily: 'Cinzel_700Bold', color: COLORS.gold, letterSpacing: 1.5, textTransform: 'uppercase' },
  xpText: { fontSize: 16, fontWeight: '900', color: COLORS.textPrimary, fontFamily: mono },
  track: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  fillWrap: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { flex: 1, borderRadius: 4 },
  nextText: { fontSize: 9, color: COLORS.textMuted, fontFamily: mono, letterSpacing: 1, marginTop: 4, textAlign: 'right' },
});
