import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '@/lib/constants';
import { ProgressBar } from './ProgressBar';
import type { VirtueStats as VirtueStatsType } from '@/types';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

const VIRTUE_DEFS = [
  { key: 'discipline' as const, label: 'Discipline', icon: '\u{1F4FF}', color: COLORS.silver, desc: 'Consistency of daily logging' },
  { key: 'temperance' as const, label: 'Temperance', icon: '\u{1F35E}', color: COLORS.success, desc: 'Nutrition target adherence' },
  { key: 'fortitude' as const, label: 'Fortitude', icon: '\u2694', color: COLORS.squat, desc: 'Training completion rate' },
  { key: 'perseverance' as const, label: 'Perseverance', icon: '\u26F0', color: COLORS.primary, desc: 'Program weeks completed' },
];

interface VirtueStatsProps {
  virtues: VirtueStatsType;
  compact?: boolean;
}

export function VirtueStatsCard({ virtues, compact }: VirtueStatsProps) {
  return (
    <View style={styles.container}>
      {VIRTUE_DEFS.map(v => (
        <View key={v.key} style={[styles.row, compact && styles.rowCompact]}>
          <View style={styles.labelRow}>
            <Text style={styles.icon}>{v.icon}</Text>
            <Text style={[styles.label, { color: v.color }]}>{v.label}</Text>
            <Text style={styles.value}>{virtues[v.key]}%</Text>
          </View>
          <ProgressBar progress={virtues[v.key] / 100} color={v.color} height={compact ? 4 : 6} />
          {!compact && <Text style={styles.desc}>{v.desc}</Text>}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  row: {},
  rowCompact: { marginBottom: -4 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  icon: { fontSize: 14 },
  label: { fontSize: 11, fontWeight: '700', fontFamily: mono, letterSpacing: 1, textTransform: 'uppercase', flex: 1 },
  value: { fontSize: 13, fontWeight: '900', color: COLORS.textPrimary, fontFamily: mono },
  desc: { fontSize: 8, color: COLORS.textMuted, fontFamily: mono, marginTop: 4, letterSpacing: 0.5 },
});
