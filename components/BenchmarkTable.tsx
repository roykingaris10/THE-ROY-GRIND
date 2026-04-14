import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, BENCHMARKS } from '@/lib/constants';

interface BenchmarkTableProps {
  currentWeek: number;
}

export function BenchmarkTable({ currentWeek }: BenchmarkTableProps) {
  const currentMonth = Math.min(8, Math.floor((currentWeek - 1) / 4));

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        {/* Header */}
        <View style={styles.headerRow}>
          {['MON', 'BW', 'SQ', 'BN', 'DL', 'TOT'].map((h) => (
            <View key={h} style={styles.cell}>
              <Text style={styles.headerText}>{h}</Text>
            </View>
          ))}
        </View>
        {/* Rows */}
        {BENCHMARKS.map((bm) => {
          const isCurrent = bm.month === currentMonth;
          const total = bm.sq + bm.bn + bm.dl;
          return (
            <View
              key={bm.month}
              style={[styles.row, isCurrent && styles.currentRow]}
            >
              <View style={styles.cell}>
                <Text style={[styles.cellText, isCurrent && styles.currentText]}>
                  {bm.month === 0 ? 'Start' : `M${bm.month}`}
                </Text>
              </View>
              <View style={styles.cell}>
                <Text style={[styles.cellText, isCurrent && styles.currentText]}>
                  {bm.bw}
                </Text>
              </View>
              <View style={styles.cell}>
                <Text style={[styles.cellText, isCurrent && styles.currentText, { color: isCurrent ? COLORS.squat : COLORS.textSecondary }]}>
                  {bm.sq}
                </Text>
              </View>
              <View style={styles.cell}>
                <Text style={[styles.cellText, isCurrent && styles.currentText, { color: isCurrent ? COLORS.bench : COLORS.textSecondary }]}>
                  {bm.bn}
                </Text>
              </View>
              <View style={styles.cell}>
                <Text style={[styles.cellText, isCurrent && styles.currentText, { color: isCurrent ? COLORS.deadlift : COLORS.textSecondary }]}>
                  {bm.dl}
                </Text>
              </View>
              <View style={styles.cell}>
                <Text style={[styles.cellText, isCurrent && styles.currentText]}>
                  {total}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  currentRow: {
    backgroundColor: 'rgba(255, 59, 59, 0.1)',
    borderRadius: 4,
  },
  cell: {
    width: 52,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: COLORS.label,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  cellText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: COLORS.textSecondary,
  },
  currentText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
});
