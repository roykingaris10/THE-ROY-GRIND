import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '@/lib/constants';
import type { Achievement } from '@/types';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'large';
}

export function AchievementBadge({ achievement, size = 'small' }: AchievementBadgeProps) {
  const isLarge = size === 'large';
  const locked = !achievement.unlocked;

  return (
    <View style={[styles.badge, isLarge && styles.badgeLarge, locked && styles.locked]}>
      <Text style={[styles.icon, isLarge && styles.iconLarge, locked && styles.iconLocked]}>
        {achievement.icon}
      </Text>
      <Text style={[styles.name, isLarge && styles.nameLarge, locked && styles.nameLocked]} numberOfLines={1}>
        {achievement.name}
      </Text>
      {isLarge && (
        <Text style={[styles.desc, locked && styles.descLocked]} numberOfLines={2}>
          {achievement.description}
        </Text>
      )}
    </View>
  );
}

export function AchievementGrid({ achievements }: { achievements: Achievement[] }) {
  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);

  return (
    <View>
      {unlocked.length > 0 && (
        <View style={styles.grid}>
          {unlocked.map(a => <AchievementBadge key={a.id} achievement={a} size="large" />)}
        </View>
      )}
      {locked.length > 0 && (
        <>
          <Text style={styles.lockedHeader}>LOCKED ({locked.length})</Text>
          <View style={styles.grid}>
            {locked.map(a => <AchievementBadge key={a.id} achievement={a} size="large" />)}
          </View>
        </>
      )}
    </View>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  training: COLORS.squat,
  nutrition: COLORS.success,
  consistency: COLORS.streak,
  milestone: COLORS.xp,
};

export function AchievementRow({ achievement }: { achievement: Achievement }) {
  const catColor = CATEGORY_COLORS[achievement.category] || COLORS.primary;
  return (
    <View style={[styles.row, !achievement.unlocked && styles.rowLocked]}>
      <Text style={styles.rowIcon}>{achievement.icon}</Text>
      <View style={styles.rowText}>
        <Text style={[styles.rowName, !achievement.unlocked && styles.nameLocked]}>{achievement.name}</Text>
        <Text style={[styles.rowDesc, !achievement.unlocked && styles.descLocked]}>{achievement.description}</Text>
      </View>
      <View style={[styles.catDot, { backgroundColor: achievement.unlocked ? catColor : COLORS.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: '30%',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.xp,
  },
  badgeLarge: { width: '47%', padding: 12 },
  locked: { borderColor: COLORS.border, opacity: 0.5 },
  icon: { fontSize: 20, marginBottom: 4 },
  iconLarge: { fontSize: 28, marginBottom: 6 },
  iconLocked: { opacity: 0.4 },
  name: { fontSize: 8, fontWeight: '700', color: COLORS.textPrimary, fontFamily: mono, textAlign: 'center', letterSpacing: 0.5 },
  nameLarge: { fontSize: 10, marginBottom: 4 },
  nameLocked: { color: COLORS.textMuted },
  desc: { fontSize: 8, color: COLORS.textSecondary, fontFamily: mono, textAlign: 'center', lineHeight: 12 },
  descLocked: { color: COLORS.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-start' },
  lockedHeader: { fontSize: 9, color: COLORS.label, fontFamily: mono, letterSpacing: 1.5, marginTop: 16, marginBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 6,
    gap: 10,
  },
  rowLocked: { opacity: 0.5 },
  rowIcon: { fontSize: 22 },
  rowText: { flex: 1 },
  rowName: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, fontFamily: mono },
  rowDesc: { fontSize: 9, color: COLORS.textSecondary, fontFamily: mono, marginTop: 2 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
});
