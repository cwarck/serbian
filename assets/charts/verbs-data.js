const PRONOUNS = [
  { key: 'ja', label: 'ja' },
  { key: 'ti', label: 'ti' },
  { key: 'on', label: 'on/ona/ono' },
  { key: 'mi', label: 'mi' },
  { key: 'vi', label: 'vi' },
  { key: 'oni', label: 'oni/one/ona' },
];

const VERB_GROUPS = [
  {
    key: 'verbs.group.im',
    tone: 'im',
    title: 'IM | E',
    endings: { ja:'-im', ti:'-iš', on:'-i', mi:'-imo', vi:'-ite', oni:'-e' },
    patterns: ['-iti', '-eti'],
    verbs: ['raditi', 'govoriti', 'učiti', 'videti', 'voleti', 'živeti', 'sedeti'],
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
    verbs: ['čitati', 'znati', 'imati', 'gledati', 'slušati', 'čekati', 'igrati'],
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
    verbs: ['lagati', 'pisati', 'zvati', 'brati', 'prati', 'peći', 'reći'],
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
    verbs: ['kupovati', 'putovati', 'stanovati', 'verovati', 'pokazivati', 'prodavati'],
    example: {
      infinitive: 'kupovati',
      forms: { ja:'kupujem', ti:'kupuješ', on:'kupuje', mi:'kupujemo', vi:'kupujete', oni:'kupuju' }
    }
  },
];

const IRREGULARS = [
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
];

const PAST = {
  formula: [{ sr:'sam/si/je/smo/ste/su' }, { text:'+' }, { key:'verbs.term.pastParticiple' }],
  examples: [
    { sr:'Gledao sam film.', en:'I watched a film. (m.)', ru:'Я смотрел фильм. (м.)' },
    { sr:'Ja sam gledao film.', en:'I watched a film.', ru:'Я смотрел фильм.' },
    { sr:'Nisam gledao film.', en:'I did not watch a film. (m.)', ru:'Я не смотрел фильм. (м.)' },
    { sr:'Gledala sam film.', en:'I watched a film. (f.)', ru:'Я смотрела фильм. (ж.)' },
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

const FUTURE = {
  formula: [{ sr:'ću/ćeš/će/ćemo/ćete/će' }, { text:'+' }, { key:'verbs.term.infinitive' }],
  examples: [
    { sr:'Ja ću raditi.', en:'I will work.', ru:'Я буду работать.' },
    { sr:'Radiću.', en:'I will work.', ru:'Я буду работать.' },
    { sr:'Neću raditi.', en:'I will not work.', ru:'Я не буду работать.' },
  ],
  merged: ['raditi -> radiću', 'radićeš', 'radiće'],
  exceptions: ['ići ću', 'doći ću'],
  reflexive: ['Šetam se.', 'Ja se šetam.', 'Nisam se šetao.']
};
