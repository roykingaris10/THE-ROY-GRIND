export interface DailyVerse {
  text: string;
  reference: string;
}

export interface FastingInfo {
  name: string;
  type: 'strict' | 'moderate' | 'weekly';
}

export interface FeastDay {
  name: string;
  type: 'great' | 'major' | 'minor';
}

const VERSES: DailyVerse[] = [
  { text: 'Do you not know that your body is a temple of the Holy Spirit within you?', reference: '1 Cor 6:19' },
  { text: 'Therefore glorify God in your body.', reference: '1 Cor 6:20' },
  { text: 'I can do all things through Christ who strengthens me.', reference: 'Phil 4:13' },
  { text: 'The Lord is my strength and my shield; my heart trusts in Him.', reference: 'Psalm 28:7' },
  { text: 'Be strong and courageous. Do not be afraid, for the Lord your God is with you.', reference: 'Joshua 1:9' },
  { text: 'I have fought the good fight, I have finished the race, I have kept the faith.', reference: '2 Tim 4:7' },
  { text: 'But they who wait for the Lord shall renew their strength.', reference: 'Isaiah 40:31' },
  { text: 'Present your bodies as a living sacrifice, holy and acceptable to God.', reference: 'Rom 12:1' },
  { text: 'No discipline seems pleasant at the time, but painful. Later however, it produces a harvest of righteousness.', reference: 'Heb 12:11' },
  { text: 'Whatever you do, do it all for the glory of God.', reference: '1 Cor 10:31' },
  { text: 'He gives power to the faint, and to him who has no might He increases strength.', reference: 'Isaiah 40:29' },
  { text: 'The joy of the Lord is your strength.', reference: 'Neh 8:10' },
  { text: 'As iron sharpens iron, so one person sharpens another.', reference: 'Prov 27:17' },
  { text: 'Be watchful, stand firm in the faith, act like men, be strong.', reference: '1 Cor 16:13' },
  { text: 'The Lord is my light and my salvation; whom shall I fear?', reference: 'Psalm 27:1' },
  { text: 'For God gave us a spirit not of fear but of power, love, and self-control.', reference: '2 Tim 1:7' },
  { text: 'Train yourself for godliness; for bodily training is of some value, but godliness is of value in every way.', reference: '1 Tim 4:7-8' },
  { text: 'Let us run with endurance the race that is set before us.', reference: 'Heb 12:1' },
  { text: 'Blessed is the man who remains steadfast under trial.', reference: 'James 1:12' },
  { text: 'The Lord is the stronghold of my life; of whom shall I be afraid?', reference: 'Psalm 27:1' },
  { text: 'He who began a good work in you will bring it to completion.', reference: 'Phil 1:6' },
  { text: 'Commit your way to the Lord; trust in Him, and He will act.', reference: 'Psalm 37:5' },
  { text: 'Be strong in the Lord and in the strength of His might.', reference: 'Eph 6:10' },
  { text: 'For we walk by faith, not by sight.', reference: '2 Cor 5:7' },
  { text: 'I press on toward the goal for the prize of the upward call of God in Christ Jesus.', reference: 'Phil 3:14' },
  { text: 'The Lord is near to all who call on Him, to all who call on Him in truth.', reference: 'Psalm 145:18' },
  { text: 'Cast all your anxiety on Him because He cares for you.', reference: '1 Peter 5:7' },
  { text: 'If God is for us, who can be against us?', reference: 'Rom 8:31' },
  { text: 'The steadfast love of the Lord never ceases; His mercies never come to an end.', reference: 'Lam 3:22' },
  { text: 'Glory to God for all things!', reference: 'St. John Chrysostom' },
  { text: 'Acquire the Spirit of Peace and a thousand souls around you will be saved.', reference: 'St. Seraphim of Sarov' },
  { text: 'Stand at the brink of the abyss of despair, and when you see that you cannot bear it anymore, draw back a little, and have a cup of tea.', reference: 'Elder Sophrony' },
  { text: 'The body is not evil. It is the instrument of the soul.', reference: 'St. Maximus the Confessor' },
  { text: 'Prayer is the place of refuge for every worry, a foundation for cheerfulness, a source of constant happiness.', reference: 'St. John Chrysostom' },
  { text: 'God does not demand or desire that a person fast to the point of exhaustion, but rather the bodily fast is the beginning of the spiritual.', reference: 'St. Basil the Great' },
  { text: 'Out of the night that covers me, black as the pit from pole to pole, I thank whatever gods may be for my unconquerable soul.', reference: 'W.E. Henley, Invictus' },
  { text: 'I am the master of my fate, I am the captain of my soul.', reference: 'W.E. Henley, Invictus' },
  { text: 'It matters not how strait the gate, how charged with punishments the scroll, I am the master of my fate, I am the captain of my soul.', reference: 'W.E. Henley, Invictus' },
];

const FIXED_FEASTS: Record<string, FeastDay> = {
  '01-01': { name: 'Circumcision of Christ / St. Basil the Great', type: 'great' },
  '01-06': { name: 'Theophany (Baptism of Christ)', type: 'great' },
  '01-07': { name: 'Synaxis of St. John the Baptist', type: 'major' },
  '02-02': { name: 'Meeting of the Lord (Presentation)', type: 'great' },
  '03-25': { name: 'Annunciation of the Theotokos', type: 'great' },
  '05-21': { name: 'Sts. Constantine & Helen', type: 'major' },
  '06-24': { name: 'Nativity of St. John the Baptist', type: 'major' },
  '06-29': { name: 'Sts. Peter & Paul', type: 'major' },
  '07-20': { name: 'Prophet Elijah (Elias)', type: 'major' },
  '08-06': { name: 'Transfiguration of the Lord', type: 'great' },
  '08-15': { name: 'Dormition of the Theotokos', type: 'great' },
  '08-29': { name: 'Beheading of St. John the Baptist', type: 'major' },
  '09-08': { name: 'Nativity of the Theotokos', type: 'great' },
  '09-14': { name: 'Exaltation of the Holy Cross', type: 'great' },
  '10-26': { name: 'St. Demetrios the Great Martyr', type: 'major' },
  '11-08': { name: 'Archangels Michael & Gabriel', type: 'major' },
  '11-21': { name: 'Entry of the Theotokos into the Temple', type: 'great' },
  '12-06': { name: 'St. Nicholas the Wonderworker', type: 'major' },
  '12-25': { name: 'Nativity of Christ (Christmas)', type: 'great' },
};

export function getDailyVerse(date: Date = new Date()): DailyVerse {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  return VERSES[dayOfYear % VERSES.length];
}

export function getFeastDay(date: Date = new Date()): FeastDay | null {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return FIXED_FEASTS[`${mm}-${dd}`] || null;
}

export function getFastingInfo(date: Date = new Date()): FastingInfo | null {
  const day = date.getDay();
  const mm = date.getMonth() + 1;
  const dd = date.getDate();

  if (mm === 8 && dd >= 1 && dd <= 14) {
    return { name: 'Dormition Fast', type: 'strict' };
  }
  if ((mm === 11 && dd >= 15) || (mm === 12 && dd <= 24)) {
    return { name: 'Nativity Fast', type: 'moderate' };
  }

  const pascha = computePascha(date.getFullYear());
  const dateMs = date.getTime();
  const paschaMs = pascha.getTime();
  const daysBefore = Math.round((paschaMs - dateMs) / 86400000);
  if (daysBefore > 0 && daysBefore <= 48) {
    return { name: 'Great Lent', type: 'strict' };
  }

  if (day === 3 || day === 5) {
    return { name: day === 3 ? 'Wednesday Fast' : 'Friday Fast', type: 'weekly' };
  }

  return null;
}

function computePascha(year: number): Date {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  const julianDate = new Date(year, month - 1, day);
  julianDate.setDate(julianDate.getDate() + 13);
  return julianDate;
}

export function isFastingDay(date: Date = new Date()): boolean {
  return getFastingInfo(date) !== null;
}

export function getOrthodoxGreeting(date: Date = new Date()): string {
  const feast = getFeastDay(date);
  if (feast) return feast.name;
  const fasting = getFastingInfo(date);
  if (fasting && fasting.type !== 'weekly') return fasting.name;
  const hour = date.getHours();
  if (hour < 12) return 'Glory to God for this morning';
  if (hour < 17) return 'God bless your afternoon';
  return 'Peaceful evening to you';
}
