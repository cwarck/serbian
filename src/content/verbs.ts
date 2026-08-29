import type { Irregular, VerbGroup } from '../lib/types.ts';

export const PRONOUNS = [
  { key: 'ja', label: 'ja' },
  { key: 'ti', label: 'ti' },
  { key: 'on', label: 'on/ona/ono' },
  { key: 'mi', label: 'mi' },
  { key: 'vi', label: 'vi' },
  { key: 'oni', label: 'oni/one/ona' },
];

export const VERB_GROUPS = [
  {
    key: 'verbs.group.im',
    tone: 'im',
    title: 'IM | E',
    endings: { ja:'-im', ti:'-iš', on:'-i', mi:'-imo', vi:'-ite', oni:'-e' },
    patterns: ['-iti', '-eti'],
    verbs: [
      { lemma: 'raditi', present: 'radim' },
      { lemma: 'govoriti', present: 'govorim' },
      { lemma: 'učiti', present: 'učim' },
      { lemma: 'videti', present: 'vidim' },
      { lemma: 'voleti', present: 'volim' },
      { lemma: 'živeti', present: 'živim' },
      { lemma: 'sedeti', present: 'sedim' },
    ],
    example: {
      infinitive: 'raditi',
      forms: { ja:'radim', ti:'radiš', on:'radi', mi:'radimo', vi:'radite', oni:'rade' }
    }
  },
  {
    key: 'verbs.group.am',
    tone: 'am',
    title: 'AM | AJU',
    endings: { ja:'-am', ti:'-aš', on:'-a', mi:'-amo', vi:'-ate', oni:'-aju' },
    patterns: ['-ati'],
    verbs: [
      { lemma: 'čitati', present: 'čitam' },
      { lemma: 'znati', present: 'znam' },
      { lemma: 'imati', present: 'imam' },
      { lemma: 'gledati', present: 'gledam' },
      { lemma: 'slušati', present: 'slušam' },
      { lemma: 'čekati', present: 'čekam' },
      { lemma: 'igrati', present: 'igram' },
    ],
    example: {
      infinitive: 'čitati',
      forms: { ja:'čitam', ti:'čitaš', on:'čita', mi:'čitamo', vi:'čitate', oni:'čitaju' }
    }
  },
  {
    key: 'verbs.group.em',
    tone: 'em',
    title: 'EM | U',
    endings: { ja:'-em', ti:'-eš', on:'-e', mi:'-emo', vi:'-ete', oni:'-u' },
    patterns: ['-ati', '-ći'],
    verbs: [
      { lemma: 'lagati', present: 'lažem' },
      { lemma: 'pisati', present: 'pišem' },
      { lemma: 'zvati', present: 'zovem' },
      { lemma: 'brati', present: 'berem' },
      { lemma: 'prati', present: 'perem' },
      { lemma: 'kazati', present: 'kažem' },
      { lemma: 'plakati', present: 'plačem' },
    ],
    example: {
      infinitive: 'lagati',
      forms: { ja:'lažem', ti:'lažeš', on:'laže', mi:'lažemo', vi:'lažete', oni:'lažu' }
    }
  },
  {
    key: 'verbs.group.jem',
    tone: 'jem',
    title: 'JEM | JU',
    endings: { ja:'-jem', ti:'-ješ', on:'-je', mi:'-jemo', vi:'-jete', oni:'-ju' },
    patterns: ['-ovati', '-ivati', '-avati'],
    verbs: [
      { lemma: 'kupovati', present: 'kupujem' },
      { lemma: 'putovati', present: 'putujem' },
      { lemma: 'stanovati', present: 'stanujem' },
      { lemma: 'verovati', present: 'verujem' },
      { lemma: 'pokazivati', present: 'pokazujem' },
      { lemma: 'prodavati', present: 'prodajem' },
    ],
    example: {
      infinitive: 'kupovati',
      forms: { ja:'kupujem', ti:'kupuješ', on:'kupuje', mi:'kupujemo', vi:'kupujete', oni:'kupuju' }
    }
  },
] satisfies readonly VerbGroup[];

export const IRREGULARS = [
  {
    title: 'biti',
    forms: ['sam', 'si', 'je', 'smo', 'ste', 'su'],
    negative: ['nisam', 'nisi', 'nije', 'nismo', 'niste', 'nisu'],
    full: ['jesam', 'jesi', 'jeste', 'jesmo', 'jeste', 'jesu']
  },
  {
    title: 'hteti',
    forms: ['hoću', 'hoćeš', 'hoće', 'hoćemo', 'hoćete', 'hoće'],
    negative: ['neću', 'nećeš', 'neće', 'nećemo', 'nećete', 'neće']
  },
  {
    title: 'moći',
    forms: ['mogu', 'možeš', 'može', 'možemo', 'možete', 'mogu'],
    negative: []
  },
] satisfies readonly Irregular[];

export const PAST = {
  formula: [{ sr:'sam/si/je/smo/ste/su' }, { text:'+' }, { key:'verbs.term.pastParticiple' }],
  examples: [
    { sr:'Gledao sam film.', en:'I watched a film. (m.)', ru:'Я смотрел фильм. (м.)' },
    { sr:'Ja sam gledao film.', en:'I watched a film.', ru:'Я смотрел фильм.' },
    { sr:'Nisam gledao film.', en:'I did not watch a film. (m.)', ru:'Я не смотрел фильм. (м.)' },
    { sr:'Juče sam gledao film.', en:'Yesterday I watched a film.', ru:'Вчера я смотрел фильм.' },
  ],
  endings: [
    { key:'past.msg', ending:'-o' },
    { key:'past.fsg', ending:'-la' },
    { key:'past.nsg', ending:'-lo' },
    { key:'past.mpl', ending:'-li' },
    { key:'past.fpl', ending:'-le' },
    { key:'past.npl', ending:'-la' },
  ]
};

export const FUTURE = {
  formula: [{ sr:'ću/ćeš/će/ćemo/ćete/će' }, { text:'+' }, { key:'verbs.term.infinitive' }],
  examples: [
    { sr:'Ja ću raditi.', en:'I will work.', ru:'Я буду работать.' },
    { sr:'Radiću.', en:'I will work.', ru:'Я буду работать.' },
    { sr:'Neću raditi.', en:'I will not work.', ru:'Я не буду работать.' },
  ],
  merged: ['raditi → radiću', 'radićeš', 'radiće'],
  exceptions: ['ići ću', 'doći ću'],
};

/* Clitic placement is not a tense fact — these examples are present and past,
   so they get their own panel instead of riding inside FUTURE. */
export const CLITICS = ['Šetam se.', 'Ja se šetam.', 'Nisam se šetao.'];
