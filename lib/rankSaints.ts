export interface RankSaint {
  saintId: string;
  theme: string;
}

export const RANK_SAINTS: Record<string, RankSaint> = {
  Neophyte: { saintId: 'photini', theme: 'new beginnings, baptism of will' },
  Reader: { saintId: 'justin-popovich', theme: 'seeking truth' },
  Subdeacon: { saintId: 'stephen', theme: 'first service' },
  Deacon: { saintId: 'ephrem-syrian', theme: 'dedicated service' },
  Monk: { saintId: 'anthony-great', theme: 'entering the desert' },
  Ascetic: { saintId: 'mary-egypt', theme: 'radical repentance' },
  Confessor: { saintId: 'maximus-confessor', theme: 'unshaken witness' },
  Warrior: { saintId: 'george', theme: 'spiritual combat' },
  Elder: { saintId: 'seraphim-sarov', theme: 'acquired the Spirit' },
  Prophet: { saintId: 'john-forerunner', theme: 'voice crying in the wilderness' },
  'Desert Father': { saintId: 'paul-thebes', theme: 'mastery through solitude' },
  Invictus: { saintId: 'christ-pantocrator', theme: 'the unconquered' },
};

export const RANK_ORDER = [
  'Neophyte', 'Reader', 'Subdeacon', 'Deacon', 'Monk', 'Ascetic',
  'Confessor', 'Warrior', 'Elder', 'Prophet', 'Desert Father', 'Invictus',
];

export const RANK_XP_THRESHOLDS = [
  0, 500, 1500, 3000, 5500, 9000,
  14000, 20000, 28000, 38000, 50000, 65000,
];

export function getRankForXP(xp: number): { rank: string; index: number; progress: number; xpToNext: number } {
  let idx = RANK_XP_THRESHOLDS.length - 1;
  for (let i = RANK_XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= RANK_XP_THRESHOLDS[i]) { idx = i; break; }
  }
  const nextThreshold = idx < RANK_XP_THRESHOLDS.length - 1
    ? RANK_XP_THRESHOLDS[idx + 1]
    : RANK_XP_THRESHOLDS[idx];
  const currentThreshold = RANK_XP_THRESHOLDS[idx];
  const range = nextThreshold - currentThreshold || 1;
  const progress = (xp - currentThreshold) / range;
  return {
    rank: RANK_ORDER[idx],
    index: idx,
    progress: Math.min(1, progress),
    xpToNext: Math.max(0, nextThreshold - xp),
  };
}
