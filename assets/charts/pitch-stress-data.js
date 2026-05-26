const PITCH_ACCENTS = [
  {
    key: 'short-falling',
    mark: 'ȁ',
    length: { en: 'short', ru: 'краткий' },
    contour: { en: 'falling', ru: 'нисходящий' },
    pattern: 'HL',
    examples: [
      { sr: 'nȅbo' },
      { sr: 'sȑce' }
    ],
    note: 'falling'
  },
  {
    key: 'short-rising',
    mark: 'à',
    length: { en: 'short', ru: 'краткий' },
    contour: { en: 'rising', ru: 'восходящий' },
    pattern: 'LH',
    examples: [
      { sr: 'vòda' },
      { sr: 'màskara' }
    ],
    note: 'rising'
  },
  {
    key: 'long-falling',
    mark: 'ȃ',
    length: { en: 'long', ru: 'долгий' },
    contour: { en: 'falling', ru: 'нисходящий' },
    pattern: 'H-L',
    examples: [
      { sr: 'pȋvo' },
      { sr: 'grȃd' }
    ],
    note: 'falling'
  },
  {
    key: 'long-rising',
    mark: 'á',
    length: { en: 'long', ru: 'долгий' },
    contour: { en: 'rising', ru: 'восходящий' },
    pattern: 'L-H',
    examples: [
      { sr: 'gláva' },
      { sr: 'čokoláda' }
    ],
    note: 'rising'
  }
];

const PITCH_RULES = [
  {
    label: { en: 'ordinary writing', ru: 'обычное письмо' },
    fact: { en: 'accent marks omitted', ru: 'знаки ударения не пишутся' },
    examples: ['voda', 'glava', 'čokolada'],
    note: 'marks'
  },
  {
    label: { en: 'last syllable', ru: 'последний слог' },
    fact: { en: 'normally unstressed', ru: 'обычно без ударения' },
    examples: ['vòda', 'gláva', 'čokoláda'],
    note: 'final'
  },
  {
    label: { en: 'falling', ru: 'нисходящее' },
    fact: { en: 'one syllable, or first syllable', ru: 'односложное или первый слог' },
    examples: ['pȋvo', 'nȅbo', 'grȃd'],
    note: 'falling'
  },
  {
    label: { en: 'rising', ru: 'восходящее' },
    fact: { en: 'not final; needs following syllable', ru: 'не на конце; нужен следующий слог' },
    examples: ['vòda', 'gláva', 'čokoláda'],
    note: 'rising'
  }
];

const PITCH_LENGTH_ROWS = [
  {
    label: { en: 'short stressed', ru: 'краткий ударный' },
    marks: ['ȁ', 'à'],
    examples: [
      { sr: 'nȅbo' },
      { sr: 'vòda' }
    ]
  },
  {
    label: { en: 'long stressed', ru: 'долгий ударный' },
    marks: ['ȃ', 'á'],
    examples: [
      { sr: 'pȋvo' },
      { sr: 'gláva' }
    ]
  },
  {
    label: { en: 'long unstressed', ru: 'долгий без ударения' },
    marks: ['ā'],
    examples: [
      { sr: 'dèvōjka' },
      { sr: 'lȍnācā', tr: { en: 'pots, gen. pl.', ru: 'кастрюль, род. мн.' } }
    ],
    note: 'length'
  }
];

const PITCH_PARADIGMS = [
  {
    word: { sr: 'lȍnac' },
    cells: [
      { label: 'NOM SG', sr: 'lȍnac' },
      { label: 'GEN SG', sr: 'lónca' },
      { label: 'NOM PL', sr: 'lȏnci' },
      { label: 'GEN PL', sr: 'lȍnācā' }
    ],
    note: 'mobile'
  },
  {
    word: { sr: 'grȃd' },
    cells: [
      { label: 'NOM SG', sr: 'grȃd' },
      { label: 'GEN SG', sr: 'grȃda' },
      { label: 'NOM PL', sr: 'grȁdovi' },
      { label: 'GEN PL', sr: 'grȃdōvā' }
    ],
    note: 'mobile'
  }
];

const PITCH_PRIORITY = [
  {
    rank: '1',
    label: { en: 'stress place', ru: 'место ударения' },
    fact: { en: 'hear first; learn with word', ru: 'слышать первым; учить со словом' }
  },
  {
    rank: '2',
    label: { en: 'vowel length', ru: 'долгота' },
    fact: { en: 'short vs long changes rhythm', ru: 'кратко vs долго меняет ритм' }
  },
  {
    rank: '3',
    label: { en: 'pitch contour', ru: 'тон' },
    fact: { en: 'dialect-sensitive; dictionary mark helps', ru: 'зависит от говора; знак в словаре помогает' },
    note: 'urban'
  }
];

const PITCH_READING = [
  { step: '1', text: { en: 'Find marked syllable.', ru: 'Найти отмеченный слог.' } },
  { step: '2', text: { en: 'Read length: short mark or long mark.', ru: 'Прочитать долготу: краткий или долгий знак.' } },
  { step: '3', text: { en: 'Keep post-accent macrons long.', ru: 'Тянуть слоги с макроном после ударения.' } },
  { step: '4', text: { en: 'Do not move stress to final syllable.', ru: 'Не переносить ударение на последний слог.' } }
];

const PITCH_NOTES = {
  marks: {
    title: { en: 'Marks are reference notation', ru: 'Знаки - словарная запись' },
    body: { en: 'Books, dictionaries, and teaching material mark accent. Normal Serbian spelling does not.', ru: 'Словари, учебники и справочники отмечают ударение. Обычная сербская орфография нет.' }
  },
  falling: {
    title: { en: 'Falling accent', ru: 'Нисходящий тон' },
    body: { en: 'Standard falling accents appear on one-syllable words or the first syllable of longer words.', ru: 'В стандарте нисходящее ударение стоит в односложных словах или на первом слоге более длинного слова.' }
  },
  rising: {
    title: { en: 'Rising accent', ru: 'Восходящий тон' },
    body: { en: 'The rise is heard across the stressed syllable and what follows. Do not turn it into English question intonation.', ru: 'Подъём слышен на ударном слоге и после него. Это не английская вопросительная интонация.' }
  },
  final: {
    title: { en: 'Final stress', ru: 'Ударение на конце' },
    body: { en: 'Native standard words avoid final stress. Loans, names, and dialect forms can break the learner rule.', ru: 'Исконные стандартные слова избегают ударения на конце. Заимствования, имена и диалектные формы могут нарушать это правило.' }
  },
  length: {
    title: { en: 'Post-accent length', ru: 'Долгота после ударения' },
    body: { en: 'Macron marks long vowels without stress. In standard accent notation, these long vowels occur after the accented syllable.', ru: 'Макрон отмечает долгий безударный гласный. В стандартной акцентной записи такая долгота стоит после ударного слога.' }
  },
  mobile: {
    title: { en: 'Accent can move', ru: 'Ударение может двигаться' },
    body: { en: 'Case, number, and derivation can change stress place, tone, and length. Treat common paradigms as word facts.', ru: 'Падеж, число и словообразование могут менять место, тон и долготу. Частые парадигмы лучше учить как свойства слова.' }
  },
  urban: {
    title: { en: 'Modern speech', ru: 'Современная речь' },
    body: { en: 'Many speakers keep stress place and length more clearly than the four-way pitch contrast, especially in urban speech.', ru: 'Многие носители яснее сохраняют место ударения и долготу, чем четыре тоновых различия, особенно в городской речи.' }
  }
};
