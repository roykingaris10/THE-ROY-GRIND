import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '@/lib/constants';

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
  const strokeWidth = Math.max(2, Math.round(size / 18));

  // Build arc segments for a cleaner rendering
  // We split into 4 quadrants: top-right, bottom-right, bottom-left, top-left
  const segments = [
    { threshold: 0,    prop: 'borderRightColor' as const },
    { threshold: 0.25, prop: 'borderBottomColor' as const },
    { threshold: 0.5,  prop: 'borderLeftColor' as const },
    { threshold: 0.75, prop: 'borderTopColor' as const },
  ];

  const segmentColors: Record<string, string> = {};
  for (const seg of segments) {
    segmentColors[seg.prop] = clamped > seg.threshold ? color : 'transparent';
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Track ring */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: COLORS.border,
          },
        ]}
      />
      {/* Filled ring */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: 'transparent',
            ...segmentColors,
          },
        ]}
      />
      {/* Center content */}
      <Text style={[styles.pct, { fontSize: Math.round(size / 4.5) }]}>{pct}%</Text>
      {label && (
        <Text style={[styles.label, { fontSize: Math.max(6, Math.round(size / 9)) }]} numberOfLines={1}>
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute' },
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
