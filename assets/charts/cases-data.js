/* Cases — data is structural; UI text comes from window.I18N per case key.
   Endings shown as the ending only (-a, not "žena -a"). Shared / animacy /
   sound-change overlays surface the system, not the noise. */

/* Cell shape:
     string         e.g. '-a'
     { v, same }    ending value + "same as X" marker  (X = NOM | GEN | DAT)
     { v, n }       ending + footnote id (resolved against .notes below)
     { split: [{label,v,same}, ...] }   animacy / soft-consonant alternation
*/

const CASES = [
  {
    key: 'case.1', abbr: 'NOM', tone: 'nom',
    sigEnding: '-∅',
    endings: {
      m: { sg: '-∅',               pl: { v:'-i', n:'sib-i' } },
      f: { sg: '-a',                pl: '-e' },
      n: { sg: '-o',                pl: '-a' },
    },
    notes: {
      'sib-i': {
        titleEn: '<i>k, g, h</i> soften before <i>-i</i>',
        titleRu: '<i>k, g, h</i> смягчаются перед <i>-i</i>',
        bodyEn: 'These three hard consonants don\'t sit comfortably next to a bright <i>-i</i>. They shift to softer cousins — <i>c, z, s</i> — that match the vowel better.',
        bodyRu: 'Этим трём твёрдым согласным неудобно стоять перед «светлым» <i>-i</i>. Они меняются на мягких родственников — <i>c, z, s</i> — которым с <i>-i</i> легче.',
        pairs: [['junak','junaci'],['jezik','jezici'],['monah','monasi']]
      }
    },
    examples: [
      { sr:'<mark>Dobar pilot</mark> proverava instrumente.', en:'A good <i>pilot</i> checks the instruments.', ru:'Хороший пилот проверяет приборы.' },
      { sr:'<mark>Žena</mark> peva.',                   en:'The woman sings.',               ru:'Женщина поёт.' },
      { sr:'<mark>Selo</mark> je tiho.',                en:'The village is quiet.',          ru:'Деревня тихая.' },
    ],
    preps: []
  },

  {
    key: 'case.2', abbr: 'GEN', tone: 'gen',
    sigEnding: '-a',
    endings: {
      m: { sg: '-a',                pl: '-a' },
      f: { sg: '-e',                pl: '-∅' },
      n: { sg: '-a',                pl: '-a' },
    },
    notes: {},
    examples: [
      { sr:'Kaciga <mark>pilota</mark>.',        en:'The <i>pilot</i>\'s helmet.',         ru:'Шлем пилота.' },
      { sr:'Stižem iz <mark>grada</mark>.',       en:'I\'m arriving from the city.', ru:'Я приезжаю из города.' },
      { sr:'Nemam <mark>vremena</mark>.',         en:'I have no time.',              ru:'У меня нет времени.' },
    ],
    preps: ['od','iz','do','kod','blizu','iza','oko','bez','pre','posle']
  },

  {
    key: 'case.3', abbr: 'DAT', tone: 'dat',
    sigEnding: '-u',
    endings: {
      m: { sg: '-u',                pl: { v:'-ima', share:['INS','LOK'] } },
      f: { sg: { v:'-i', n:'sib-i' }, pl: { v:'-ama', share:['INS','LOK'] } },
      n: { sg: '-u',                pl: { v:'-ima', share:['INS','LOK'] } },
    },
    notes: {
      'sib-i': {
        titleEn: '<i>k, g, h</i> soften before the <i>-i</i> ending',
        titleRu: '<i>k, g, h</i> смягчаются перед <i>-i</i>',
        bodyEn: 'When the feminine singular ending <i>-i</i> lands on a stem ending in <i>k</i>, <i>g</i>, or <i>h</i>, those hard consonants shift to <i>c, z, s</i> — softer sounds that sit better next to the <i>-i</i>.',
        bodyRu: 'Когда женское окончание <i>-i</i> падает на основу, оканчивающуюся на <i>k</i>, <i>g</i> или <i>h</i>, эти твёрдые согласные меняются на <i>c, z, s</i> — более мягкие звуки, которые лучше ладят с <i>-i</i>.',
        pairs: [['knjiga','knjizi'],['ruka','ruci'],['Amerika','Americi']]
      }
    },
    examples: [
      { sr:'Pokazujem kartu <mark>pilotu</mark>.', en:'I show the map to the <i>pilot</i>.',      ru:'Я показываю карту пилоту.' },
      { sr:'Idem k <mark>moru</mark>.',             en:'I\'m going to the sea.',            ru:'Я еду к морю.' },
      { sr:'Pomažem <mark>prijateljici</mark>.',    en:'I\'m helping a friend (f.).',       ru:'Я помогаю подруге.' },
    ],
    preps: ['k/ka','prema','nasuprot']
  },

  {
    key: 'case.4', abbr: 'AKU', tone: 'aku',
    sigEnding: '-a / -∅',
    endings: {
      m: {
        sg: { split: [
          { v:'-a', n:'animacy', labelKey:'cases.aku.label.alive' },
          { v:'-∅', n:'animacy', labelKey:'cases.aku.label.thing' },
        ] },
        pl: '-e'
      },
      f: { sg: '-u',                pl: '-e' },
      n: { sg: { v:'-o', same:'NOM' }, pl: { v:'-a', same:'NOM' } },
    },
    notes: {
      'animacy': {
        titleEn: 'Living things vs everything else',
        titleRu: 'Одушевлённые против всего остального',
        bodyEn: 'In the masculine singular only, the accusative splits by whether the noun is alive. Living things (people, animals) take <i>-a</i> — the same shape as the genitive. Inanimate things take <i>-∅</i> — the nominative form, unchanged. So you reuse two endings you already know.',
        bodyRu: 'Только в мужском роде единственного числа винительный делится по одушевлённости. У живых (люди, животные) окончание <i>-a</i> — точно как в родительном. У неодушевлённых — <i>-∅</i>, как в именительном. То есть переиспользуются уже знакомые окончания.',
        pairs: [['pilot','pilota'],['grad','grad']]
      }
    },
    examples: [
      { sr:'Vidim <mark>pilota</mark>.',    en:'I see the <i>pilot</i>. <em>(living → <i>-a</i>, like Gen)</em>',     ru:'Я вижу пилота. <em>(одуш. → <i>-a</i>, как Род.)</em>' },
      { sr:'Vidim <mark>grad</mark>.',       en:'I see the city. <em>(non-living → <i>-∅</i>, like Nom)</em>', ru:'Я вижу город. <em>(неодуш. → <i>-∅</i>, как Им.)</em>' },
      { sr:'Idem u <mark>grad</mark>.',      en:'I\'m going to the city. <em>(motion: <i>u</i> + Acc)</em>',  ru:'Я еду в город. <em>(движение: <i>u</i> + Acc)</em>' },
    ],
    preps: ['u','na','kroz','niz','uz','pod','pred','nad','među','za']
  },

  {
    key: 'case.5', abbr: 'VOK', tone: 'vok',
    sigEnding: '-e / -u',
    endings: {
      m: {
        sg: { split: [
          { v:'-e', n:'palatal' },
          { v:'-u', n:'soft' },
        ] },
        pl: { v:'-i', same:'NOM' }
      },
      f: { sg: '-o',                pl: { v:'-e', same:'NOM' } },
      n: { sg: { v:'-o', same:'NOM' }, pl: { v:'-a', same:'NOM' } },
    },
    notes: {
      'palatal': {
        titleEn: '<i>k, g, h</i> turn into <i>č, ž, š</i> when calling out',
        titleRu: '<i>k, g, h</i> превращаются в <i>č, ž, š</i> при обращении',
        bodyEn: 'When you address someone whose word ends in <i>k</i>, <i>g</i>, or <i>h</i>, those consonants shift to their soft cousins — <i>č, ž, š</i> — before the <i>-e</i> ending. The hard sounds soften because you\'re calling, not stating.',
        bodyRu: 'Когда зовут кого-то, чьё имя или должность оканчивается на <i>k, g, h</i>, эти согласные меняются на мягких родственников — <i>č, ž, š</i> — перед окончанием <i>-e</i>. Звук размягчается, потому что это окрик, а не утверждение.',
        pairs: [['junak','junače'],['Bog','Bože'],['duh','duše']]
      },
      'soft': {
        titleEn: 'After soft consonants, use <i>-u</i> instead of <i>-e</i>',
        titleRu: 'После мягких согласных — <i>-u</i> вместо <i>-e</i>',
        bodyEn: 'If the word already ends in a soft consonant — <i>c, ć, č, đ, dž, j, lj, nj, š, ž</i> — adding a soft <i>-e</i> on top would feel doubled. The ending switches to <i>-u</i> instead.',
        bodyRu: 'Если слово уже оканчивается на мягкий согласный — <i>c, ć, č, đ, dž, j, lj, nj, š, ž</i> — добавлять сверху мягкое <i>-e</i> было бы излишеством. Окончание становится <i>-u</i>.',
        pairs: [['prijatelj','prijatelju'],['mladić','mladiću'],['muž','mužu']]
      }
    },
    examples: [
      { sr:'<mark>Pilote</mark>, dobar dan!',    en:'<i>Pilot</i>, hello!',             ru:'Пилот, добрый день!' },
      { sr:'<mark>Marija</mark>, gde si?',         en:'<i>Marija</i>, where are you?',    ru:'Мария, ты где?' },
      { sr:'O, <mark>prijatelju</mark>!',         en:'Oh, my friend!',            ru:'О, друг мой!' },
    ],
    preps: []
  },

  {
    key: 'case.6', abbr: 'INS', tone: 'ins',
    sigEnding: '-om',
    endings: {
      m: { sg: { v:'-om', n:'soft-em' }, pl: { v:'-ima', share:['DAT','LOK'] } },
      f: { sg: '-om',                     pl: { v:'-ama', share:['DAT','LOK'] } },
      n: { sg: { v:'-om', n:'soft-em' }, pl: { v:'-ima', share:['DAT','LOK'] } },
    },
    notes: {
      'soft-em': {
        titleEn: 'After soft consonants, <i>-om</i> becomes <i>-em</i>',
        titleRu: 'После мягких согласных <i>-om</i> становится <i>-em</i>',
        bodyEn: 'The round <i>-om</i> feels heavy when it follows a soft consonant (<i>c, ć, č, đ, dž, j, lj, nj, š, ž</i>). It thins to <i>-em</i> so the word stays balanced — soft consonant, soft vowel.',
        bodyRu: 'Округлое <i>-om</i> кажется тяжёлым после мягкого согласного (<i>c, ć, č, đ, dž, j, lj, nj, š, ž</i>). Оно превращается в <i>-em</i>, чтобы слово оставалось лёгким — мягкий согласный, мягкий гласный.',
        pairs: [['muž','mužem'],['nož','nožem'],['mesec','mesecem']]
      }
    },
    examples: [
      { sr:'Putujem <mark>autobusom</mark>.',  en:'I\'m traveling by bus.',     ru:'Я еду на автобусе.' },
      { sr:'Letim sa <mark>pilotom</mark>.',    en:'I\'m flying with the <i>pilot</i>.', ru:'Я лечу с пилотом.' },
      { sr:'<mark>Ponedeljkom</mark> radim.',  en:'On Mondays I work. <em>(recurring time)</em>', ru:'По понедельникам я работаю. <em>(регулярное время)</em>' },
    ],
    preps: ['s/sa','pod','pred','nad','među','za']
  },

  {
    key: 'case.7', abbr: 'LOK', tone: 'lok',
    sigEnding: '-u',
    endings: {
      m: { sg: { v:'-u', same:'DAT' },               pl: { v:'-ima', same:'DAT' } },
      f: { sg: { v:'-i', same:'DAT', n:'sib-i' },     pl: { v:'-ama', same:'DAT' } },
      n: { sg: { v:'-u', same:'DAT' },               pl: { v:'-ima', same:'DAT' } },
    },
    notes: {
      'sib-i': {
        titleEn: '<i>k, g, h</i> soften before <i>-i</i> (same as Dative)',
        titleRu: '<i>k, g, h</i> смягчаются перед <i>-i</i> (как в Дательном)',
        bodyEn: 'The Locative singular ending for feminines is <i>-i</i> — exactly the same as Dative. Same ending, same softening: <i>k, g, h</i> become <i>c, z, s</i> when they meet it.',
        bodyRu: 'Окончание Предложного для женского рода единственного — то же <i>-i</i>, что и в Дательном. То же окончание, то же смягчение: <i>k, g, h</i> становятся <i>c, z, s</i>.',
        pairs: [['ruka','ruci'],['knjiga','knjizi'],['Amerika','Americi']]
      }
    },
    examples: [
      { sr:'Knjiga je na <mark>stolu</mark>.',      en:'The book is on the table. <em>(location)</em>',         ru:'Книга на столе. <em>(где)</em>' },
      { sr:'Govorim o <mark>pilotu</mark>.',        en:'I\'m speaking about the <i>pilot</i>. <em>(topic)</em>',       ru:'Я говорю о пилоте. <em>(о чём)</em>' },
      { sr:'Živim u <mark>Beogradu</mark>.',         en:'I live in Belgrade. <em>(location: <i>u</i> + Loc, no motion)</em>', ru:'Я живу в Белграде. <em>(где: <i>u</i> + Loc, без движения)</em>' },
    ],
    preps: ['u','na','o','po','pri']
  },
];

const IDECL = {
  cases: ['NOM','GEN','DAT','AKU','VOK','INS','LOK'],
  sg:    ['ljubav',   'ljubavi',  'ljubavi',  'ljubav',   'ljubavi',   'ljubavlju', 'ljubavi'],
  pl:    ['ljubavi',  'ljubavi',  'ljubavima','ljubavi',  'ljubavi',   'ljubavima', 'ljubavima'],
};

const WRINKLES = [
  {
    key: 'wrinkle.fleeting',
    examples: [
      { from:'pas',    to:'psa',    en:'dog · of the dog',          ru:'пёс · собаки' },
      { from:'posao',  to:'posla',  en:'job · of the job',          ru:'дело · дела' },
      { from:'otac',   to:'oca',    en:'father · of the father',    ru:'отец · отца' },
      { from:'vredan', to:'vredni', en:'hardworking (m.sg) · m.pl', ru:'усердный (м.р., ед.) · мн.ч.' },
    ],
  },
  {
    key: 'wrinkle.a-insert',
    examples: [
      { from:'sestra',   to:'sestara',   en:'sister · of sisters (gen. pl.)', ru:'сестра · сестёр (род. мн.)' },
      { from:'pismo',    to:'pisama',    en:'letter · of letters',             ru:'письмо · писем' },
      { from:'viljuška', to:'viljušaka', en:'fork · of forks',                 ru:'вилка · вилок' },
      { from:'staklo',   to:'stakala',   en:'glass · of glasses',              ru:'стекло · стёкол' },
    ],
  },
  {
    key: 'wrinkle.ov-ev',
    examples: [
      { from:'sin',  to:'sinovi',  en:'son · sons',                  ru:'сын · сыновья' },
      { from:'grad', to:'gradovi', en:'city · cities',               ru:'город · города' },
      { from:'muž',  to:'muževi',  en:'husband · husbands (soft → <i>-ev-</i>)', ru:'муж · мужья (мягк. → <i>-ev-</i>)' },
      { from:'dan',  to:'dani',    en:'day · days (exception, plain <i>-i</i>)', ru:'день · дни (исключение, просто <i>-i</i>)' },
    ],
  },
  {
    key: 'wrinkle.iju',
    examples: [
      { from:'oko',  to:'očiju',   en:'eye · of eyes',     ru:'глаз · глаз (род. мн.)' },
      { from:'uho',  to:'ušiju',   en:'ear · of ears',     ru:'ухо · ушей' },
      { from:'gost', to:'gostiju', en:'guest · of guests', ru:'гость · гостей' },
      { from:'prst', to:'prstiju', en:'finger · of fingers', ru:'палец · пальцев' },
    ],
  },
  {
    key: 'wrinkle.irregulars',
    examples: [
      { from:'brat',  to:'braća',    en:'brother → brothers (f.sg collective)', ru:'брат → братья (соб., ж.р., ед.)' },
      { from:'čovek', to:'ljudi',    en:'person → people (whole new word)',     ru:'человек → люди (новое слово)' },
      { from:'dete',  to:'deca',     en:'child → children (f.sg collective)',   ru:'ребёнок → дети (соб., ж.р., ед.)' },
      { from:'drvo',  to:'drveta',   en:'tree → of the tree (stem extends)',    ru:'дерево → дерева (основа удлиняется)' },
      { from:'ime',   to:'imena',    en:'name → names (n-stem extension)',      ru:'имя → имена (наращение -n-)' },
      { from:'vreme', to:'vremena',  en:'time → times (n-stem extension)',      ru:'время → времена (наращение -n-)' },
      { from:'ruka',  to:'ruku',     en:'hand → of hands (special gen. pl.)',   ru:'рука → рук (особый род. мн.)' },
      { from:'noga',  to:'nogu',     en:'leg → of legs (special gen. pl.)',     ru:'нога → ног (особый род. мн.)' },
      { from:'sat',   to:'sati',     en:'hour → hours (no <i>-ov-</i> infix)',         ru:'час → часы (без <i>-ov-</i>)' },
      { from:'nebo',  to:'nebesa',   en:'sky → skies (s-stem extension)',       ru:'небо → небеса (наращение -s-)' },
    ],
  },
];

const CAST = [
  { gender: 'm', word: 'pilot',
    forms: {
      sg: ['pilot','pilota','pilotu','pilota','pilote','pilotom','pilotu'],
      pl: ['piloti','pilota','pilotima','pilote','piloti','pilotima','pilotima'],
    } },
  { gender: 'f', word: 'žena',
    forms: {
      sg: ['žena','žene','ženi','ženu','ženo','ženom','ženi'],
      pl: ['žene','žena','ženama','žene','žene','ženama','ženama'],
    } },
  { gender: 'n', word: 'selo',
    forms: {
      sg: ['selo','sela','selu','selo','selo','selom','selu'],
      pl: ['sela','sela','selima','sela','sela','selima','selima'],
    } },
];

const ENDING_AXES = [
  { key: 'm-sg', g: 'm', n: 'sg' },
  { key: 'm-pl', g: 'm', n: 'pl' },
  { key: 'f-sg', g: 'f', n: 'sg' },
  { key: 'f-pl', g: 'f', n: 'pl' },
  { key: 'n-sg', g: 'n', n: 'sg' },
  { key: 'n-pl', g: 'n', n: 'pl' },
];
