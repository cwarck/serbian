const PERSONAL = [
  { band:'self', label:'pron.self', subject:'-', object:'sebe, se', datloc:'sebi, si', inst:'sobom', poss:'svoj' },
  { band:'sg', label:'pron.1sg', subject:'ja', object:'mene, me', datloc:'meni, mi', inst:'mnom', poss:'moj' },
  { band:'sg', label:'pron.2sg', subject:'ti', object:'tebe, te', datloc:'tebi, ti', inst:'tobom', poss:'tvoj' },
  { band:'sg', label:'pron.3msg', subject:'on', object:'njega, ga', datloc:'njemu, mu', inst:'njim', poss:'njegov' },
  { band:'sg', label:'pron.3nsg', subject:'ono', object:'njega, ga', datloc:'njemu, mu', inst:'njim', poss:'njegov' },
  { band:'sg', label:'pron.3fsg', subject:'ona', object:'nju / nje, je / ju', datloc:'njoj, joj', inst:'njom', poss:'njen' },
  { band:'pl', label:'pron.1pl', subject:'mi', object:'nas', datloc:'nama, nam', inst:'nama', poss:'naš' },
  { band:'pl', label:'pron.2pl', subject:'vi', object:'vas', datloc:'vama, vam', inst:'vama', poss:'vaš' },
  { band:'pl', label:'pron.3mpl', subject:'oni', object:'njih, ih', datloc:'njima, im', inst:'njima', poss:'njihov' },
  { band:'pl', label:'pron.3npl', subject:'ona', object:'njih, ih', datloc:'njima, im', inst:'njima', poss:'njihov' },
  { band:'pl', label:'pron.3fpl', subject:'one', object:'njih, ih', datloc:'njima, im', inst:'njima', poss:'njihov' },
];

const POSSESSIVES = [
  { owner:'pron.self.owner', forms:['svoj', 'svoje', 'svoja'], note:'pron.self.note' },
  { owner:'pron.my', forms:['moj', 'moje', 'moja'] },
  { owner:'pron.your.sg', forms:['tvoj', 'tvoje', 'tvoja'] },
  { owner:'pron.his.its', forms:['njegov', 'njegovo', 'njegova'] },
  { owner:'pron.her', forms:['njen', 'njeno', 'njena'] },
  { owner:'pron.our', forms:['naš', 'naše', 'naša'] },
  { owner:'pron.your.pl', forms:['vaš', 'vaše', 'vaša'] },
  { owner:'pron.their', forms:['njihov', 'njihovo', 'njihova'] },
];

const DEMOS = [
  {
    title:'pron.demo.sg',
    rows:[
      { key:'pron.this', forms:['ovaj', 'ovo', 'ova'] },
      { key:'pron.that', forms:['taj', 'to', 'ta'] },
      { key:'pron.over.there', forms:['onaj', 'ono', 'ona'] },
    ]
  },
  {
    title:'pron.demo.pl',
    rows:[
      { key:'pron.these', forms:['ovi', 'ova', 'ove'] },
      { key:'pron.those', forms:['ti', 'ta', 'te'] },
      { key:'pron.those.far', forms:['oni', 'ona', 'one'] },
    ]
  }
];

const QUESTIONS = {
  whose: [
    { label:'pron.sg', forms:['čiji', 'čije', 'čija'] },
    { label:'pron.pl', forms:['čiji', 'čija', 'čije'] },
  ],
  whoWhat: [
    { key:'case.1.name', who:'ko', what:'šta' },
    { key:'case.4.name', who:'koga', what:'šta' },
    { key:'case.2.name', who:'koga', what:'čega' },
    { key:'pron.datloc', who:'kome', what:'čemu' },
    { key:'case.6.name', who:'kim', what:'čim' },
  ]
};
