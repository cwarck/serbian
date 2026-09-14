import type { FormulaPart, Irregular, VerbGroup } from '../lib/types.ts';

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
    ]
  },
  {
    key: 'verbs.group.am',
    tone: 'am',
    note: 'ati',
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
    ]
  },
  {
    key: 'verbs.group.em',
    tone: 'em',
    note: 'ati',
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
    ]
  },
  {
    key: 'verbs.group.jem',
    tone: 'jem',
    endings: { ja:'-jem', ti:'-ješ', on:'-je', mi:'-jemo', vi:'-jete', oni:'-ju' },
    patterns: ['-ovati', '-ivati', '-avati'],
    verbs: [
      { lemma: 'kupovati', present: 'kupujem' },
      { lemma: 'putovati', present: 'putujem' },
      { lemma: 'stanovati', present: 'stanujem' },
      { lemma: 'verovati', present: 'verujem' },
      { lemma: 'pokazivati', present: 'pokazujem' },
      { lemma: 'prodavati', present: 'prodajem' },
    ]
  },
] satisfies readonly VerbGroup[];

export const IRREGULARS = [
  {
    title: 'biti',
    short: ['sam', 'si', 'je', 'smo', 'ste', 'su'],
    negative: ['nisam', 'nisi', 'nije', 'nismo', 'niste', 'nisu'],
    perfective: ['budem', 'budeš', 'bude', 'budemo', 'budete', 'budu'],
    emphatic: ['jesam', 'jesi', 'jeste', 'jesmo', 'jeste', 'jesu']
  },
  {
    title: 'hteti',
    full: ['hoću', 'hoćeš', 'hoće', 'hoćemo', 'hoćete', 'hoće'],
    short: ['ću', 'ćeš', 'će', 'ćemo', 'ćete', 'će'],
    negative: ['neću', 'nećeš', 'neće', 'nećemo', 'nećete', 'neće']
  },
  {
    title: 'moći',
    forms: ['mogu', 'možeš', 'može', 'možemo', 'možete', 'mogu'],
    negative: []
  },
] satisfies readonly Irregular[];

/* Formulas name the auxiliary by lemma and paradigm; the six forms live on
   the auxiliary's own card, and the formula links there. */
export const PAST = {
  meaning: { en:'The everyday past: what happened or how things were.', ru:'Основное прошедшее: то, что было.' },
  formula: [{ aux: { lemma:'biti', field:'short' } }, { text:'+' }, { key:'verbs.term.pastParticiple' }] satisfies readonly FormulaPart[],
  examples: [
    { sr:'Gledao si film.', en:'You watched a film.', ru:'Ты смотрел фильм.' },
    { sr:'Ona je gledala film.', en:'She watched a film.', ru:'Она смотрела фильм.' },
    { sr:'Nismo gledali film.', en:'We did not watch a film.', ru:'Мы не смотрели фильм.' },
    { sr:'Juče su gledali film.', en:'Yesterday they watched a film.', ru:'Вчера они смотрели фильм.' },
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
  meaning: { en:'What will happen or how things will be.', ru:'То, что будет.' },
  formula: [{ aux: { lemma:'hteti', field:'short' } }, { text:'+' }, { key:'verbs.term.infinitive' }] satisfies readonly FormulaPart[],
  examples: [
    { sr:'Oni će raditi.', en:'They will work.', ru:'Они будут работать.' },
    { sr:'Radićeš.', en:'You will work.', ru:'Ты будешь работать.' },
    { sr:'Nećemo raditi.', en:'We will not work.', ru:'Мы не будем работать.' },
  ],
  merged: { from:'raditi', to:['radiću', 'radićeš', 'radiće'] },
  exceptions: ['ići ću', 'doći ću'],
};

/* Futur II: the same agreeing participle as the Perfekat, so its endings are
   not repeated here — the formula names the participle and the Perfekat bands
   hold the six forms; budem… sits on the biti card. */
export const FUTURE2 = {
  meaning: { en:'The future in <i>kad</i> (when), <i>ako</i> (if), <i>čim</i> (as soon as) clauses.', ru:'Будущее в частях с <i>kad</i> (когда), <i>ako</i> (если), <i>čim</i> (как только).' },
  formula: [{ aux: { lemma:'biti', field:'perfective' } }, { text:'+' }, { key:'verbs.term.pastParticiple' }] satisfies readonly FormulaPart[],
  examples: [
    { sr:'Kad budem imao vremena, doći ću.', en:'When I have time, I will come.', ru:'Когда у меня будет время, я приду.' },
    { sr:'Ako budeš imala vremena, dođi.', en:'If you have time, come.', ru:'Если у тебя будет время, приходи.' },
    { sr:'Čim budemo završili posao, javićemo se.', en:'As soon as we finish the work, we will get in touch.', ru:'Как только закончим работу, мы свяжемся.' },
  ],
};

/* Clitic placement is not a tense fact — these examples are present and past,
   so they get their own card instead of riding inside FUTURE. <mark> isolates
   the clitic group; the word before it is whatever came first, and inside
   the group the auxiliary precedes se. */
export const CLITICS = [
  { sr:'Šetam <mark>se</mark>.', en:'I take a walk.', ru:'Я гуляю.' },
  { sr:'Ja <mark>sam se</mark> šetao.', en:'I took a walk.', ru:'Я гулял.' },
  { sr:'Nisam <mark>se</mark> šetao.', en:'I did not take a walk.', ru:'Я не гулял.' },
];
