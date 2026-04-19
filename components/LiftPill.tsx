import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LIFT_COLORS } from '@/lib/constants';
import type { LiftType } from '@/types';

interface LiftPillProps {
  type: LiftType;
  selected?: boolean;
  onPress?: () => void;
  small?: boolean;
}

export function LiftPill({ type, selected = false, onPress, small = false }: LiftPillProps) {
  const color = LIFT_COLORS[type];
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.pill, small && styles.small, selected ? { backgroundColor: color } : { borderColor: color, borderWidth: 1 }]}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, small && styles.textSmall, { color: selected ? '#000' : color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  small: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginRight: 4 },
  text: { fontSize: 13, fontFamily: 'monospace', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  textSmall: { fontSize: 9, letterSpacing: 0.5 },
});
