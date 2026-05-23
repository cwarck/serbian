const NUMBER_GROUPS = [
  {
    key: 'numbers.digits',
    tone: 'num-digits',
    rows: [
      { n: '0', sr: 'nula' },
      { n: '1', sr: 'jedan' },
      { n: '2', sr: 'dva' },
      { n: '3', sr: 'tri' },
      { n: '4', sr: 'četiri' },
      { n: '5', sr: 'pet' },
      { n: '6', sr: 'šest' },
      { n: '7', sr: 'sedam' },
      { n: '8', sr: 'osam' },
      { n: '9', sr: 'devet' },
      { n: '10', sr: 'deset' },
    ]
  },
  {
    key: 'numbers.teens',
    tone: 'num-teens',
    rows: [
      { n: '11', sr: 'jedanaest' },
      { n: '12', sr: 'dvanaest' },
      { n: '13', sr: 'trinaest' },
      { n: '14', sr: 'četrnaest' },
      { n: '15', sr: 'petnaest' },
      { n: '16', sr: 'šesnaest' },
      { n: '17', sr: 'sedamnaest' },
      { n: '18', sr: 'osamnaest' },
      { n: '19', sr: 'devetnaest' },
    ]
  },
  {
    key: 'numbers.tens',
    tone: 'num-tens',
    rows: [
      { n: '20', sr: 'dvadeset' },
      { n: '30', sr: 'trideset' },
      { n: '40', sr: 'četrdeset' },
      { n: '50', sr: 'pedeset' },
      { n: '60', sr: 'šezdeset' },
      { n: '70', sr: 'sedamdeset' },
      { n: '80', sr: 'osamdeset' },
      { n: '90', sr: 'devedeset' },
    ]
  },
  {
    key: 'numbers.hundreds',
    tone: 'num-hundreds',
    rows: [
      { n: '100', sr: 'sto' },
      { n: '200', sr: 'dvesta' },
      { n: '300', sr: 'trista' },
      { n: '400', sr: 'četiristo' },
      { n: '500', sr: 'petsto' },
      { n: '600', sr: 'šeststo' },
      { n: '700', sr: 'sedamsto' },
      { n: '800', sr: 'osamsto' },
      { n: '900', sr: 'devetsto' },
      { n: '1.000', sr: 'hiljadu' },
    ]
  }
];

const NUMBER_BUILDS = [
  { n: '21', parts: ['dvadeset', 'jedan'], en: 'twenty one', ru: 'двадцать один' },
  { n: '34', parts: ['trideset', 'četiri'], en: 'thirty four', ru: 'тридцать четыре' },
  { n: '58', parts: ['pedeset', 'osam'], en: 'fifty eight', ru: 'пятьдесят восемь' },
  { n: '101', parts: ['sto', 'jedan'], en: 'one hundred one', ru: 'сто один' },
  { n: '125', parts: ['sto', 'dvadeset', 'pet'], en: 'one hundred twenty five', ru: 'сто двадцать пять' },
  { n: '2.345', parts: ['dve', 'hiljade', 'trista', 'četrdeset', 'pet'], en: 'two thousand three hundred forty five', ru: 'две тысячи триста сорок пять' },
];

const NOUN_COUNTS = [
  {
    n: '1',
    pattern: { en: 'agrees with noun', ru: 'согласуется с родом' },
    examples: ['jedan grad', 'jedna žena', 'jedno selo']
  },
  {
    n: '2',
    pattern: { en: 'gender split', ru: 'форма по роду' },
    examples: ['dva grada', 'dve žene', 'dva sela']
  },
  {
    n: '3-4',
    pattern: { en: 'counted form', ru: 'счётная форма' },
    examples: ['tri grada', 'četiri žene', 'tri sela']
  },
  {
    n: '5+',
    pattern: { en: 'genitive plural', ru: 'родительный мн.' },
    examples: ['pet gradova', 'šest žena', 'sedam sela']
  },
  {
    n: '21',
    pattern: { en: 'last word: 1', ru: 'последнее слово: 1' },
    examples: ['dvadeset jedan grad', 'trideset jedna žena', 'četrdeset jedno selo']
  },
  {
    n: '22-24',
    pattern: { en: 'last word: 2-4', ru: 'последнее слово: 2-4' },
    examples: ['dvadeset dva grada', 'dvadeset tri žene', 'dvadeset četiri sela']
  },
  {
    n: '25+',
    pattern: { en: 'last word: 5+', ru: 'последнее слово: 5+' },
    examples: ['dvadeset pet gradova', 'trideset šest žena', 'četrdeset sedam sela']
  }
];

const ORDINALS = [
  { n: '1.', forms: ['prvi', 'prva', 'prvo'] },
  { n: '2.', forms: ['drugi', 'druga', 'drugo'] },
  { n: '3.', forms: ['treći', 'treća', 'treće'] },
  { n: '4.', forms: ['četvrti', 'četvrta', 'četvrto'] },
  { n: '5.', forms: ['peti', 'peta', 'peto'] },
  { n: '6.', forms: ['šesti', 'šesta', 'šesto'] },
  { n: '7.', forms: ['sedmi', 'sedma', 'sedmo'] },
  { n: '8.', forms: ['osmi', 'osma', 'osmo'] },
  { n: '9.', forms: ['deveti', 'deveta', 'deveto'] },
  { n: '10.', forms: ['deseti', 'deseta', 'deseto'] },
  { n: '20.', forms: ['dvadeseti', 'dvadeseta', 'dvadeseto'] },
  { n: '21.', forms: ['dvadeset prvi', 'dvadeset prva', 'dvadeset prvo'] },
];
