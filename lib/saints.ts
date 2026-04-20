export interface Saint {
  id: string;
  name: string;
  feastDay: string;
  title: string;
  oneLine: string;
  archetype: 'ascetic' | 'warrior' | 'teacher' | 'confessor' | 'monastic' | 'martyr' | 'hierarch';
  era: 'apostolic' | 'early' | 'byzantine' | 'russian' | 'modern';
  prayer?: string;
  color: string;
}

export const SAINTS: Saint[] = [
  {
    id: 'seraphim-sarov', name: 'St. Seraphim of Sarov', feastDay: '01-02',
    title: 'Wonderworker of Sarov',
    oneLine: 'The cheerful ascetic who greeted all with "My joy, Christ is risen!"',
    archetype: 'ascetic', era: 'russian', color: '#C9A961',
    prayer: 'O Holy Father Seraphim, pray unto God for us, that we may acquire the spirit of peace.',
  },
  {
    id: 'john-chrysostom', name: 'St. John Chrysostom', feastDay: '11-13',
    title: 'Golden-Mouthed',
    oneLine: 'Archbishop of Constantinople whose sermons still thunder through every Liturgy.',
    archetype: 'hierarch', era: 'early', color: '#C9A88F',
    prayer: 'O Holy Hierarch John, intercede for us, that our words may glorify God.',
  },
  {
    id: 'basil-great', name: 'St. Basil the Great', feastDay: '01-01',
    title: 'Archbishop of Caesarea',
    oneLine: 'Monastic legislator, theologian, and defender of the poor.',
    archetype: 'hierarch', era: 'early', color: '#8FB396',
  },
  {
    id: 'gregory-theologian', name: 'St. Gregory the Theologian', feastDay: '01-25',
    title: 'The Theologian',
    oneLine: 'One of only three saints the Church calls "Theologian" — that says enough.',
    archetype: 'teacher', era: 'early', color: '#8FA8C9',
  },
  {
    id: 'nicholas-myra', name: 'St. Nicholas of Myra', feastDay: '12-06',
    title: 'Wonderworker',
    oneLine: 'Slapped a heretic at Nicaea, fed the hungry, saved sailors — patron of generosity.',
    archetype: 'hierarch', era: 'early', color: '#C9A961',
  },
  {
    id: 'george', name: 'St. George the Great Martyr', feastDay: '04-23',
    title: 'Trophy-Bearer',
    oneLine: 'The dragon-slayer. Patron of soldiers, athletes, and anyone facing the beast.',
    archetype: 'warrior', era: 'early', color: '#B67575',
  },
  {
    id: 'demetrios', name: 'St. Demetrius of Thessaloniki', feastDay: '10-26',
    title: 'Myrrh-Streaming',
    oneLine: 'Roman soldier turned martyr whose relics streamed healing myrrh for centuries.',
    archetype: 'warrior', era: 'early', color: '#8FA8C9',
  },
  {
    id: 'anthony-great', name: 'St. Anthony the Great', feastDay: '01-17',
    title: 'Father of Monasticism',
    oneLine: 'Walked into the Egyptian desert and emerged the father of all monks.',
    archetype: 'monastic', era: 'early', color: '#C9A961',
  },
  {
    id: 'paul-thebes', name: 'St. Paul of Thebes', feastDay: '01-15',
    title: 'First Hermit',
    oneLine: 'Lived alone in a cave for 90 years, fed daily by a raven. Mastery through solitude.',
    archetype: 'ascetic', era: 'early', color: '#8B7FB8',
  },
  {
    id: 'mary-egypt', name: 'St. Mary of Egypt', feastDay: '04-01',
    title: 'Desert Mother',
    oneLine: 'From harlot to saint — 47 years alone in the desert, the icon of radical repentance.',
    archetype: 'ascetic', era: 'byzantine', color: '#8B7FB8',
  },
  {
    id: 'macarius-great', name: 'St. Macarius the Great', feastDay: '01-19',
    title: 'Desert Father',
    oneLine: 'Egyptian hermit who lived among the skulls and taught that prayer is breathing.',
    archetype: 'monastic', era: 'early', color: '#A89FC9',
  },
  {
    id: 'john-climacus', name: 'St. John Climacus', feastDay: '03-30',
    title: 'Author of the Ladder',
    oneLine: 'Wrote the Ladder of Divine Ascent — 30 rungs from earth to heaven.',
    archetype: 'teacher', era: 'byzantine', color: '#8FA8C9',
  },
  {
    id: 'maximus-confessor', name: 'St. Maximus the Confessor', feastDay: '01-21',
    title: 'The Confessor',
    oneLine: 'They cut out his tongue and severed his hand — he still would not deny the truth.',
    archetype: 'confessor', era: 'byzantine', color: '#C9A88F',
  },
  {
    id: 'symeon-new-theologian', name: 'St. Symeon the New Theologian', feastDay: '10-12',
    title: 'New Theologian',
    oneLine: 'Mystic who saw the uncreated light and insisted every Christian can experience God directly.',
    archetype: 'teacher', era: 'byzantine', color: '#A89FC9',
  },
  {
    id: 'gregory-palamas', name: 'St. Gregory Palamas', feastDay: '11-14',
    title: 'Defender of Hesychasm',
    oneLine: 'Proved that the monks on Mount Athos really do see God\'s light — it\'s uncreated.',
    archetype: 'teacher', era: 'byzantine', color: '#E8EAF0',
  },
  {
    id: 'sergius-radonezh', name: 'St. Sergius of Radonezh', feastDay: '09-25',
    title: 'Builder of Russia',
    oneLine: 'Founded the Trinity Lavra, united Russia, and blessed warriors before Kulikovo.',
    archetype: 'monastic', era: 'russian', color: '#8FB396',
  },
  {
    id: 'herman-alaska', name: 'St. Herman of Alaska', feastDay: '12-13',
    title: 'Wonderworker of Alaska',
    oneLine: 'First Orthodox saint canonised in the Americas — lived in a hut, loved the Aleuts.',
    archetype: 'monastic', era: 'russian', color: '#8FA8C9',
  },
  {
    id: 'innocent-alaska', name: 'St. Innocent of Alaska', feastDay: '03-31',
    title: 'Enlightener of the Aleuts',
    oneLine: 'Missionary, linguist, Metropolitan — brought Orthodoxy to Alaska and beyond.',
    archetype: 'hierarch', era: 'russian', color: '#C9A88F',
  },
  {
    id: 'tikhon-moscow', name: 'St. Tikhon of Moscow', feastDay: '04-07',
    title: 'Patriarch and Confessor',
    oneLine: 'Patriarch during the Bolshevik revolution who kept the faith under persecution.',
    archetype: 'confessor', era: 'modern', color: '#8B7FB8',
  },
  {
    id: 'john-kronstadt', name: 'St. John of Kronstadt', feastDay: '12-20',
    title: 'Righteous Priest',
    oneLine: 'Parish priest whose liturgies drew thousands and whose diary is raw honesty before God.',
    archetype: 'hierarch', era: 'russian', color: '#C9A961',
  },
  {
    id: 'paisios-athos', name: 'St. Paisios of Mount Athos', feastDay: '07-12',
    title: 'Elder of Sinai and Athos',
    oneLine: 'The 20th-century elder who spoke with animals and counselled with devastating simplicity.',
    archetype: 'ascetic', era: 'modern', color: '#8B8FA0',
  },
  {
    id: 'porphyrios', name: 'St. Porphyrios of Kafsokalyvia', feastDay: '12-02',
    title: 'The Gentle Elder',
    oneLine: 'Clairvoyant elder who taught that love, not willpower, conquers sin.',
    archetype: 'ascetic', era: 'modern', color: '#8FB396',
  },
  {
    id: 'silouan-athonite', name: 'St. Silouan the Athonite', feastDay: '09-24',
    title: 'Monk of Mount Athos',
    oneLine: '"Keep thy mind in hell, and despair not." The Russian giant who found God in the abyss.',
    archetype: 'monastic', era: 'modern', color: '#A89FC9',
  },
  {
    id: 'nektarios-aegina', name: 'St. Nektarios of Aegina', feastDay: '11-09',
    title: 'Bishop and Wonderworker',
    oneLine: 'Slandered, exiled, humble — and after death, his relics healed the paralysed.',
    archetype: 'hierarch', era: 'modern', color: '#C9A88F',
  },
  {
    id: 'luke-crimea', name: 'St. Luke of Crimea', feastDay: '06-11',
    title: 'Archbishop and Surgeon',
    oneLine: 'Nobel-level surgeon who operated by day and preached by night — even in the gulag.',
    archetype: 'confessor', era: 'modern', color: '#B67575',
  },
  {
    id: 'xenia-petersburg', name: 'St. Xenia of St. Petersburg', feastDay: '01-24',
    title: 'Blessed Fool for Christ',
    oneLine: 'Gave away everything after her husband died, wandered the streets, worked miracles.',
    archetype: 'ascetic', era: 'russian', color: '#8B7FB8',
  },
  {
    id: 'matrona-moscow', name: 'St. Matrona of Moscow', feastDay: '05-02',
    title: 'Blessed of Moscow',
    oneLine: 'Blind from birth, she saw more than the sighted — healer and prophet of Soviet Russia.',
    archetype: 'ascetic', era: 'modern', color: '#C9A961',
  },
  {
    id: 'photini', name: 'St. Photini the Samaritan Woman', feastDay: '02-26',
    title: 'Equal-to-the-Apostles',
    oneLine: 'Met Christ at the well, became a missionary, martyred under Nero. New beginnings incarnate.',
    archetype: 'martyr', era: 'apostolic', color: '#8FA8C9',
  },
  {
    id: 'thekla', name: 'St. Thekla the Proto-Martyr', feastDay: '09-24',
    title: 'First Woman Martyr',
    oneLine: 'Converted by Paul, survived fire and beasts, preached fearlessly across Asia Minor.',
    archetype: 'martyr', era: 'apostolic', color: '#B67575',
  },
  {
    id: 'catherine-alexandria', name: 'St. Catherine of Alexandria', feastDay: '11-25',
    title: 'Great Martyr and Scholar',
    oneLine: 'Debated 50 philosophers and won — then chose the wheel over denying Christ.',
    archetype: 'martyr', era: 'early', color: '#A89FC9',
  },
  {
    id: 'nina-georgia', name: 'St. Nina of Georgia', feastDay: '01-14',
    title: 'Enlightener of Georgia',
    oneLine: 'A slave girl who converted an entire nation with a cross made of grapevine and her own hair.',
    archetype: 'teacher', era: 'early', color: '#8FB396',
  },
  {
    id: 'olga-kiev', name: 'St. Olga of Kiev', feastDay: '07-11',
    title: 'Equal-to-the-Apostles',
    oneLine: 'Viking princess turned Christian queen — blazed the trail Vladimir would follow.',
    archetype: 'teacher', era: 'byzantine', color: '#C9A88F',
  },
  {
    id: 'vladimir-kiev', name: 'St. Vladimir of Kiev', feastDay: '07-15',
    title: 'Equal-to-the-Apostles',
    oneLine: 'Baptised Rus\'. Changed the course of history by choosing beauty over pragmatism.',
    archetype: 'hierarch', era: 'byzantine', color: '#C9A961',
  },
  {
    id: 'alexander-nevsky', name: 'St. Alexander Nevsky', feastDay: '11-23',
    title: 'Prince and Warrior',
    oneLine: 'Defeated the Swedes and Teutonic Knights, then took monastic vows on his deathbed.',
    archetype: 'warrior', era: 'byzantine', color: '#B67575',
  },
  {
    id: 'john-forerunner', name: 'St. John the Forerunner', feastDay: '01-07',
    title: 'Baptist and Prophet',
    oneLine: 'Voice crying in the wilderness. Ate locusts, baptised God, lost his head for truth.',
    archetype: 'ascetic', era: 'apostolic', color: '#8B8FA0',
  },
  {
    id: 'stephen', name: 'St. Stephen the Protomartyr', feastDay: '12-27',
    title: 'First Martyr',
    oneLine: 'First to die for Christ — saw heaven open while the stones fell.',
    archetype: 'martyr', era: 'apostolic', color: '#B67575',
  },
  {
    id: 'peter-apostle', name: 'St. Peter the Apostle', feastDay: '06-29',
    title: 'Chief of the Apostles',
    oneLine: 'Denied three times, wept bitterly, became the rock. The patron of second chances.',
    archetype: 'teacher', era: 'apostolic', color: '#8FA8C9',
  },
  {
    id: 'paul-apostle', name: 'Apostle Paul', feastDay: '06-29',
    title: 'The Wrestler',
    oneLine: 'From persecutor to apostle — ran the race, fought the fight, kept the faith.',
    archetype: 'teacher', era: 'apostolic', color: '#C9A88F',
  },
  {
    id: 'john-theologian', name: 'St. John the Theologian', feastDay: '09-26',
    title: 'Beloved Disciple',
    oneLine: 'Leaned on Christ\'s chest at the Last Supper. Wrote "God is love" and meant it.',
    archetype: 'teacher', era: 'apostolic', color: '#A89FC9',
  },
  {
    id: 'andrew-first-called', name: 'St. Andrew the First-Called', feastDay: '11-30',
    title: 'First-Called Apostle',
    oneLine: 'First to follow Christ, last to be forgotten — crucified on an X-shaped cross.',
    archetype: 'martyr', era: 'apostolic', color: '#8FA8C9',
  },
  {
    id: 'mark-evangelist', name: 'St. Mark the Evangelist', feastDay: '04-25',
    title: 'Author of the Gospel',
    oneLine: 'Wrote the shortest Gospel, founded the Coptic Church, martyred in Alexandria.',
    archetype: 'teacher', era: 'apostolic', color: '#C9A88F',
  },
  {
    id: 'luke-evangelist', name: 'St. Luke the Evangelist', feastDay: '10-18',
    title: 'Physician and Iconographer',
    oneLine: 'Doctor, painter, writer — the Renaissance man before the Renaissance.',
    archetype: 'teacher', era: 'apostolic', color: '#8FB396',
  },
  {
    id: 'athanasius-great', name: 'St. Athanasius the Great', feastDay: '01-18',
    title: 'Pillar of Orthodoxy',
    oneLine: 'Athanasius contra mundum — stood alone against the world to defend the Trinity.',
    archetype: 'hierarch', era: 'early', color: '#C9A961',
  },
  {
    id: 'cyril-alexandria', name: 'St. Cyril of Alexandria', feastDay: '06-09',
    title: 'Pillar of Faith',
    oneLine: 'Demolished Nestorianism at Ephesus. Theotokos is not negotiable.',
    archetype: 'hierarch', era: 'early', color: '#8FA8C9',
  },
  {
    id: 'ephrem-syrian', name: 'St. Ephrem the Syrian', feastDay: '01-28',
    title: 'Harp of the Holy Spirit',
    oneLine: 'Poet-theologian whose Lenten prayer is prayed more than any other.',
    archetype: 'teacher', era: 'early', color: '#A89FC9',
  },
  {
    id: 'isaac-syrian', name: 'St. Isaac the Syrian', feastDay: '01-28',
    title: 'Bishop of Nineveh',
    oneLine: 'Mystic hermit whose writings on divine love surpass nearly everything written since.',
    archetype: 'ascetic', era: 'byzantine', color: '#8B7FB8',
  },
  {
    id: 'justin-popovich', name: 'St. Justin Popovich', feastDay: '06-01',
    title: 'Confessor of Belgrade',
    oneLine: 'Serbian theologian who stood against communism and modernism with equal fire.',
    archetype: 'confessor', era: 'modern', color: '#B67575',
  },
  {
    id: 'ignatius-antioch', name: 'St. Ignatius of Antioch', feastDay: '12-20',
    title: 'God-Bearer',
    oneLine: '"I am the wheat of God, ground by the teeth of beasts to become pure bread."',
    archetype: 'martyr', era: 'apostolic', color: '#C9A88F',
  },
  {
    id: 'polycarp-smyrna', name: 'St. Polycarp of Smyrna', feastDay: '02-23',
    title: 'Bishop and Martyr',
    oneLine: '"86 years I have served Him and He has done me no wrong." Burned alive at 86.',
    archetype: 'martyr', era: 'apostolic', color: '#8B8FA0',
  },
  {
    id: 'christ-pantocrator', name: 'Christ Pantocrator', feastDay: '01-07',
    title: 'The Unconquered',
    oneLine: 'The Alpha and the Omega. The default — for those who follow the Lord Himself.',
    archetype: 'teacher', era: 'apostolic', color: '#C9A961',
  },
];

export function getSaintById(id: string): Saint | undefined {
  return SAINTS.find(s => s.id === id);
}

export function getSaintsByArchetype(archetype: Saint['archetype']): Saint[] {
  return SAINTS.filter(s => s.archetype === archetype);
}

export function isFeastDay(saint: Saint, date: Date): boolean {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return saint.feastDay === `${mm}-${dd}`;
}
