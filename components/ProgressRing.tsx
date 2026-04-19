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

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.ring, { width: size, height: size, borderColor: COLORS.border, borderRadius: size / 2 }]}>
        <View style={[styles.ringFill, {
          width: size, height: size, borderRadius: size / 2,
          borderColor: color,
          borderTopColor: clamped > 0.25 ? color : 'transparent',
          borderRightColor: clamped > 0.5 ? color : 'transparent',
          borderBottomColor: clamped > 0.75 ? color : 'transparent',
          borderLeftColor: clamped > 0 ? color : 'transparent',
        }]} />
      </View>
      <Text style={[styles.pct, { fontSize: size / 4 }]}>{pct}%</Text>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 3 },
  ringFill: { position: 'absolute', borderWidth: 3 },
  pct: { fontFamily: mono, fontWeight: '700', color: COLORS.textPrimary },
  label: { fontSize: 8, color: COLORS.textMuted, fontFamily: mono, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2, textAlign: 'center' },
});
