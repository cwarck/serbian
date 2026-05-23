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
        titleEn: 'k, g, h soften before -i',
        titleRu: 'k, g, h смягчаются перед -i',
        bodyEn: 'These three hard consonants don\'t sit comfortably next to a bright -i. They shift to softer cousins — c, z, s — that match the vowel better.',
        bodyRu: 'Этим трём твёрдым согласным неудобно стоять перед «светлым» -i. Они меняются на мягких родственников — c, z, s — которым с -i легче.',
        pairs: [['junak','junaci'],['jezik','jezici'],['monah','monasi']]
      }
    },
    examples: [
      { sr:'<mark>Dobar pilot</mark> proverava instrumente.', en:'A good pilot checks the instruments.', ru:'Хороший пилот проверяет приборы.' },
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
      { sr:'Kaciga <mark>pilota</mark>.',        en:'The pilot\'s helmet.',         ru:'Шлем пилота.' },
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
        titleEn: 'k, g, h soften before the -i ending',
        titleRu: 'k, g, h смягчаются перед -i',
        bodyEn: 'When the feminine singular ending -i lands on a stem ending in k, g, or h, those hard consonants shift to c, z, s — softer sounds that sit better next to the -i.',
        bodyRu: 'Когда женское окончание -i падает на основу, оканчивающуюся на k, g или h, эти твёрдые согласные меняются на c, z, s — более мягкие звуки, которые лучше ладят с -i.',
        pairs: [['knjiga','knjizi'],['ruka','ruci'],['Amerika','Americi']]
      }
    },
    examples: [
      { sr:'Pokazujem kartu <mark>pilotu</mark>.', en:'I show the map to the pilot.',      ru:'Я показываю карту пилоту.' },
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
        bodyEn: 'In the masculine singular only, the accusative splits by whether the noun is alive. Living things (people, animals) take -a — the same shape as the genitive. Inanimate things take -∅ — the nominative form, unchanged. So you reuse two endings you already know.',
        bodyRu: 'Только в мужском роде единственного числа винительный делится по одушевлённости. У живых (люди, животные) окончание -a — точно как в родительном. У неодушевлённых — -∅, как в именительном. То есть переиспользуются уже знакомые окончания.',
        pairs: [['pilot','pilota'],['grad','grad']]
      }
    },
    examples: [
      { sr:'Vidim <mark>pilota</mark>.',    en:'I see the pilot. <em>(living → -a, like Gen)</em>',     ru:'Я вижу пилота. <em>(одуш. → -a, как Род.)</em>' },
      { sr:'Vidim <mark>grad</mark>.',       en:'I see the city. <em>(non-living → -∅, like Nom)</em>', ru:'Я вижу город. <em>(неодуш. → -∅, как Им.)</em>' },
      { sr:'Idem u <mark>grad</mark>.',      en:'I\'m going to the city. <em>(motion: u + Acc)</em>',  ru:'Я еду в город. <em>(движение: u + Acc)</em>' },
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
        titleEn: 'k, g, h turn into č, ž, š when calling out',
        titleRu: 'k, g, h превращаются в č, ž, š при обращении',
        bodyEn: 'When you address someone whose word ends in k, g, or h, those consonants shift to their soft cousins — č, ž, š — before the -e ending. The hard sounds soften because you\'re calling, not stating.',
        bodyRu: 'Когда зовут кого-то, чьё имя или должность оканчивается на k, g, h, эти согласные меняются на мягких родственников — č, ž, š — перед окончанием -e. Звук размягчается, потому что это окрик, а не утверждение.',
        pairs: [['junak','junače'],['Bog','Bože'],['duh','duše']]
      },
      'soft': {
        titleEn: 'After soft consonants, use -u instead of -e',
        titleRu: 'После мягких согласных — -u вместо -e',
        bodyEn: 'If the word already ends in a soft consonant — c, ć, č, đ, dž, j, lj, nj, š, ž — adding a soft -e on top would feel doubled. The ending switches to -u instead.',
        bodyRu: 'Если слово уже оканчивается на мягкий согласный — c, ć, č, đ, dž, j, lj, nj, š, ž — добавлять сверху мягкое -e было бы излишеством. Окончание становится -u.',
        pairs: [['prijatelj','prijatelju'],['mladić','mladiću'],['muž','mužu']]
      }
    },
    examples: [
      { sr:'<mark>Pilote</mark>, dobar dan!',    en:'Pilot, hello!',             ru:'Пилот, добрый день!' },
      { sr:'<mark>Marija</mark>, gde si?',         en:'Marija, where are you?',    ru:'Мария, ты где?' },
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
        titleEn: 'After soft consonants, -om becomes -em',
        titleRu: 'После мягких согласных -om становится -em',
        bodyEn: 'The round -om feels heavy when it follows a soft consonant (c, ć, č, đ, dž, j, lj, nj, š, ž). It thins to -em so the word stays balanced — soft consonant, soft vowel.',
        bodyRu: 'Округлое -om кажется тяжёлым после мягкого согласного (c, ć, č, đ, dž, j, lj, nj, š, ž). Оно превращается в -em, чтобы слово оставалось лёгким — мягкий согласный, мягкий гласный.',
        pairs: [['muž','mužem'],['nož','nožem'],['mesec','mesecem']]
      }
    },
    examples: [
      { sr:'Putujem <mark>autobusom</mark>.',  en:'I\'m traveling by bus.',     ru:'Я еду на автобусе.' },
      { sr:'Letim sa <mark>pilotom</mark>.',    en:'I\'m flying with the pilot.', ru:'Я лечу с пилотом.' },
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
        titleEn: 'k, g, h soften before -i (same as Dative)',
        titleRu: 'k, g, h смягчаются перед -i (как в Дательном)',
        bodyEn: 'The Locative singular ending for feminines is -i — exactly the same as Dative. Same ending, same softening: k, g, h become c, z, s when they meet it.',
        bodyRu: 'Окончание Предложного для женского рода единственного — то же -i, что и в Дательном. То же окончание, то же смягчение: k, g, h становятся c, z, s.',
        pairs: [['ruka','ruci'],['knjiga','knjizi'],['Amerika','Americi']]
      }
    },
    examples: [
      { sr:'Knjiga je na <mark>stolu</mark>.',      en:'The book is on the table. <em>(location)</em>',         ru:'Книга на столе. <em>(где)</em>' },
      { sr:'Govorim o <mark>pilotu</mark>.',        en:'I\'m speaking about the pilot. <em>(topic)</em>',       ru:'Я говорю о пилоте. <em>(о чём)</em>' },
      { sr:'Živim u <mark>Beogradu</mark>.',         en:'I live in Belgrade. <em>(location: u + Loc, no motion)</em>', ru:'Я живу в Белграде. <em>(где: u + Loc, без движения)</em>' },
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
      { from:'muž',  to:'muževi',  en:'husband · husbands (soft → -ev-)', ru:'муж · мужья (мягк. → -ev-)' },
      { from:'dan',  to:'dani',    en:'day · days (exception, plain -i)', ru:'день · дни (исключение, просто -i)' },
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
      { from:'sat',   to:'sati',     en:'hour → hours (no -ov- infix)',         ru:'час → часы (без -ov-)' },
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
