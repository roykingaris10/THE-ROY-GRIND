import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, BENCHMARKS_REALISTIC, BENCHMARKS_STRETCH } from '@/lib/constants';

export function BenchmarkTable({ currentWeek, stretch = false }: { currentWeek: number; stretch?: boolean }) {
  const currentMonth = Math.min(8, Math.floor((currentWeek - 1) / 4));
  const benchmarks = stretch ? BENCHMARKS_STRETCH : BENCHMARKS_REALISTIC;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={styles.headerRow}>
          {['MON', 'BW', 'SQ', 'BN', 'DL', 'TOT'].map(h => (
            <View key={h} style={styles.cell}><Text style={styles.headerText}>{h}</Text></View>
          ))}
        </View>
        {benchmarks.map(bm => {
          const isCur = bm.month === currentMonth;
          return (
            <View key={bm.month} style={[styles.row, isCur && styles.curRow]}>
              <View style={styles.cell}><Text style={[styles.cellText, isCur && styles.curText]}>{bm.month === 0 ? 'Start' : `M${bm.month}`}</Text></View>
              <View style={styles.cell}><Text style={[styles.cellText, isCur && styles.curText]}>{bm.bw}</Text></View>
              <View style={styles.cell}><Text style={[styles.cellText, isCur && { color: COLORS.squat }]}>{bm.sq}</Text></View>
              <View style={styles.cell}><Text style={[styles.cellText, isCur && { color: COLORS.bench }]}>{bm.bn}</Text></View>
              <View style={styles.cell}><Text style={[styles.cellText, isCur && { color: COLORS.deadlift }]}>{bm.dl}</Text></View>
              <View style={styles.cell}><Text style={[styles.cellText, isCur && styles.curText]}>{bm.sq + bm.bn + bm.dl}</Text></View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 8, marginBottom: 4 },
  row: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  curRow: { backgroundColor: 'rgba(107, 78, 158, 0.12)', borderRadius: 4 },
  cell: { width: 52, alignItems: 'center' },
  headerText: { fontSize: 9, fontFamily: 'monospace', color: COLORS.label, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' },
  cellText: { fontSize: 12, fontFamily: 'monospace', color: COLORS.textSecondary },
  curText: { color: COLORS.textPrimary, fontWeight: '700' },
});
