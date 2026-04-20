import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppData, SetLog } from '@/types';
import { getSaintById } from '@/lib/saints';

export interface CoachSummary {
  weekNumber: number;
  date: string;
  whatHappened: string;
  whatToWatch: string;
  wordFromFathers: string;
  stats: WeekStats;
}

export interface WeekStats {
  sessions: number;
  sessionsPlanned: number;
  weightStart: number;
  weightEnd: number;
  weightChange: number;
  avgDeficit: number;
  tonnage: number;
  avgSleep: number;
  prs: number;
}

const FATHER_QUOTES = [
  { quote: 'Acquire the spirit of peace, and a thousand souls around you will be saved.', author: 'St. Seraphim of Sarov' },
  { quote: 'If you are discouraged by anything external, the pain is not due to the thing itself, but to your own estimate of it.', author: 'St. Marcus Aurelius' },
  { quote: 'Be like a bee. A bee seeks honey, not garbage.', author: 'St. Paisios of Mount Athos' },
  { quote: 'Stand at the brink of the abyss of despair, and when you see that you cannot bear it anymore, draw back a little and have a cup of tea.', author: 'Elder Sophrony' },
  { quote: 'The whole of a monk\'s discipline is temperance.', author: 'St. Anthony the Great' },
  { quote: 'The soul is dyed the colour of its thoughts.', author: 'St. Marcus Aurelius' },
  { quote: 'Do not despair, one of the thieves was saved; do not presume, one of the thieves was damned.', author: 'St. Augustine' },
  { quote: 'Where there is no struggle, there is no virtue.', author: 'St. John Climacus' },
  { quote: 'A whole sea of water cannot sink a ship unless it gets inside the ship.', author: 'St. Seraphim of Sarov' },
  { quote: 'Prayer is the place of refuge for every worry, a foundation for cheerfulness.', author: 'St. Ephrem the Syrian' },
];

function buildCoachPrompt(stats: WeekStats, weekNumber: number, patronSaintId?: string): string {
  const saint = patronSaintId ? getSaintById(patronSaintId) : null;
  const patronName = saint?.name || 'Christ Pantocrator';

  return `You are a wise Orthodox coach and elder writing a short weekly reflection for a man in week ${weekNumber} of 32 of a body recomposition and powerlifting program. His patron saint is ${patronName}.

His week:
- Weight: ${stats.weightStart}kg → ${stats.weightEnd}kg (change: ${stats.weightChange.toFixed(1)}kg)
- Workouts completed: ${stats.sessions}/${stats.sessionsPlanned}
- Main lift PRs hit: ${stats.prs}
- Average sleep: ${stats.avgSleep.toFixed(1)}h
- Average deficit: ${stats.avgDeficit}kcal

Write a summary with three parts, each 2-3 sentences:

1. **What happened** — factual narrative of the week, not just numbers
2. **What to watch** — one specific thing he should attend to next week
3. **A word from the Fathers** — a closing spiritual reflection drawing on Orthodox tradition, ideally referencing his patron saint ${patronName} or a relevant Church Father. Keep it grounded, not preachy.

Tone: direct, reverent, warm. Not a cheerleader. Not a drill sergeant. An elder in a monastery who has seen many disciples. Keep the entire summary under 200 words.

Format your response as three paragraphs separated by blank lines. The first paragraph is "What happened", the second is "What to watch", and the third is "A word from the Fathers".`;
}

export function generateTemplateSummary(stats: WeekStats, weekNumber: number): CoachSummary {
  const weightDir = stats.weightChange < 0 ? 'dropped' : stats.weightChange > 0 ? 'gained' : 'held steady at';
  const weightVal = Math.abs(stats.weightChange).toFixed(1);

  const whatHappened = stats.sessions >= stats.sessionsPlanned
    ? `A complete week. All ${stats.sessions} sessions logged, weight ${weightDir} ${weightVal} kg. ${stats.prs > 0 ? `${stats.prs} PR${stats.prs > 1 ? 's' : ''} — the bar is moving.` : 'No PRs this week, but consistency is its own reward.'}`
    : `${stats.sessions} of ${stats.sessionsPlanned} sessions completed. Weight ${weightDir} ${weightVal} kg. ${stats.sessions > 0 ? 'Partial weeks still count — every rep is a deposit.' : 'A rest week, intentional or not.'}`;

  const whatToWatch = stats.avgSleep < 7
    ? `Sleep averaged ${stats.avgSleep.toFixed(1)}h — below the 7h minimum. Guard your rest. The bar doesn't lie about what happens when you don't.`
    : stats.avgDeficit > 0
    ? `You were in surplus this week by ${stats.avgDeficit} kcal/day. If cutting, tighten the reins. If intentional, document why.`
    : `Stay the course. Deficit is on track at ${Math.abs(stats.avgDeficit)} kcal/day. Don't let success breed complacency.`;

  const quoteIdx = weekNumber % FATHER_QUOTES.length;
  const { quote, author } = FATHER_QUOTES[quoteIdx];
  const wordFromFathers = `"${quote}" — ${author}`;

  return {
    weekNumber,
    date: new Date().toISOString().split('T')[0],
    whatHappened,
    whatToWatch,
    wordFromFathers,
    stats,
  };
}

export async function generateWeeklySummary(
  data: AppData,
  weekNumber: number,
  stats: WeekStats,
  patronSaintId?: string,
): Promise<CoachSummary> {
  try {
    const apiKey = await SecureStore.getItemAsync('anthropic_api_key');
    if (!apiKey) return generateTemplateSummary(stats, weekNumber);

    const prompt = buildCoachPrompt(stats, weekNumber, patronSaintId);
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) return generateTemplateSummary(stats, weekNumber);

    const result = await response.json();
    const text = result.content?.[0]?.text || '';
    const paragraphs = text.split(/\n\n+/).filter((p: string) => p.trim());

    const summary: CoachSummary = {
      weekNumber,
      date: new Date().toISOString().split('T')[0],
      whatHappened: paragraphs[0] || '',
      whatToWatch: paragraphs[1] || '',
      wordFromFathers: paragraphs[2] || '',
      stats,
    };

    await AsyncStorage.setItem(`coach-week-${weekNumber}`, JSON.stringify(summary));
    return summary;
  } catch {
    return generateTemplateSummary(stats, weekNumber);
  }
}

export async function getCachedSummary(weekNumber: number): Promise<CoachSummary | null> {
  try {
    const cached = await AsyncStorage.getItem(`coach-week-${weekNumber}`);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}
