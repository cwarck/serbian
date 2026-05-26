/* Alphabet data — Serbian (azbuka order).
   kind: 'unique' = specific to S-Cr family,
         'shared' = familiar Cyrillic to other Slavic readers,
         'diff'   = Cyrillic letter that looks like a Latin one but sounds different. */

const ALPHABET = [
  { n: 1,  cyr:'А а', lat:'A a',  ipa:'/a/',   wCyr:'авион',   wLat:'avion',   kind:'shared' },
  { n: 2,  cyr:'Б б', lat:'B b',  ipa:'/b/',   wCyr:'банана',  wLat:'banana',  kind:'shared' },
  { n: 3,  cyr:'В в', lat:'V v',  ipa:'/ʋ/',   wCyr:'вода',    wLat:'voda',    kind:'diff' },
  { n: 4,  cyr:'Г г', lat:'G g',  ipa:'/ɡ/',   wCyr:'гора',    wLat:'gora',    kind:'shared' },
  { n: 5,  cyr:'Д д', lat:'D d',  ipa:'/d/',   wCyr:'дом',     wLat:'dom',     kind:'shared' },
  { n: 6,  cyr:'Ђ ђ', lat:'Đ đ',  ipa:'/dʑ/',  wCyr:'ђак',     wLat:'đak',     kind:'unique',
    tip:{
      en:'A soft sound between “d” and “j”. Imagine the gentle “dy” sound some people use in <em>duke</em>. Your tongue stays close to the roof of the mouth, making it soft and smooth.',
      ru:'Мягкий звук между «дь» и «дж». Представь очень мягкое «д» в слове «дядя». Язык прижимается к нёбу, поэтому звук получается «нежным».'
    } },
  { n: 7,  cyr:'Е е', lat:'E e',  ipa:'/e/',   wCyr:'европа',  wLat:'evropa',  kind:'shared' },
  { n: 8,  cyr:'Ж ж', lat:'Ž ž',  ipa:'/ʒ/',   wCyr:'жена',    wLat:'žena',    kind:'shared' },
  { n: 9,  cyr:'З з', lat:'Z z',  ipa:'/z/',   wCyr:'зима',    wLat:'zima',    kind:'shared' },
  { n:10,  cyr:'И и', lat:'I i',  ipa:'/i/',   wCyr:'игра',    wLat:'igra',    kind:'shared' },
  { n:11,  cyr:'Ј ј', lat:'J j',  ipa:'/j/',   wCyr:'јабука',  wLat:'jabuka',  kind:'unique' },
  { n:12,  cyr:'К к', lat:'K k',  ipa:'/k/',   wCyr:'књига',   wLat:'knjiga',  kind:'shared' },
  { n:13,  cyr:'Л л', lat:'L l',  ipa:'/l/',   wCyr:'лето',    wLat:'leto',    kind:'shared' },
  { n:14,  cyr:'Љ љ', lat:'Lj lj',ipa:'/ʎ/',   wCyr:'љубав',   wLat:'ljubav',  kind:'unique' },
  { n:15,  cyr:'М м', lat:'M m',  ipa:'/m/',   wCyr:'мост',    wLat:'most',    kind:'shared' },
  { n:16,  cyr:'Н н', lat:'N n',  ipa:'/n/',   wCyr:'небо',    wLat:'nebo',    kind:'diff' },
  { n:17,  cyr:'Њ њ', lat:'Nj nj',ipa:'/ɲ/',   wCyr:'њива',    wLat:'njiva',   kind:'unique' },
  { n:18,  cyr:'О о', lat:'O o',  ipa:'/o/',   wCyr:'отац',    wLat:'otac',    kind:'shared' },
  { n:19,  cyr:'П п', lat:'P p',  ipa:'/p/',   wCyr:'птица',   wLat:'ptica',   kind:'shared' },
  { n:20,  cyr:'Р р', lat:'R r',  ipa:'/r/',   wCyr:'река',    wLat:'reka',    kind:'diff' },
  { n:21,  cyr:'С с', lat:'S s',  ipa:'/s/',   wCyr:'сир',     wLat:'sir',     kind:'diff' },
  { n:22,  cyr:'Т т', lat:'T t',  ipa:'/t/',   wCyr:'телефон', wLat:'telefon', kind:'shared' },
  { n:23,  cyr:'Ћ ћ', lat:'Ć ć',  ipa:'/tɕ/',  wCyr:'ћуран',   wLat:'ćuran',   kind:'unique',
    tip:{
      en:'A soft version of “ch”. Imagine starting with a tiny “t” before the “ch” sound. It feels lighter and gentler than a normal English “ch”.',
      ru:'Мягкая версия «ч». Как будто ты одновременно говоришь «ть» и «ч». Звук лёгкий и «тонкий».'
    } },
  { n:24,  cyr:'У у', lat:'U u',  ipa:'/u/',   wCyr:'улица',   wLat:'ulica',   kind:'diff' },
  { n:25,  cyr:'Ф ф', lat:'F f',  ipa:'/f/',   wCyr:'фабрика', wLat:'fabrika', kind:'shared' },
  { n:26,  cyr:'Х х', lat:'H h',  ipa:'/x/',   wCyr:'хладно',  wLat:'hladno',  kind:'diff' },
  { n:27,  cyr:'Ц ц', lat:'C c',  ipa:'/ts/',  wCyr:'цвет',    wLat:'cvet',    kind:'shared' },
  { n:28,  cyr:'Ч ч', lat:'Č č',  ipa:'/tʃ/',  wCyr:'час',     wLat:'čas',     kind:'shared',
    tip:{
      en:'Like the “ch” in <em>chocolate</em>. A strong and crisp sound.',
      ru:'Похоже на русский «ч» в слове «чай», но чуть твёрже и чётче.'
    } },
  { n:29,  cyr:'Џ џ', lat:'Dž dž',ipa:'/dʒ/',  wCyr:'џеп',     wLat:'džep',    kind:'unique',
    tip:{
      en:'The same sound as “j” in <em>jam</em>. Strong, voiced, and easy to hear.',
      ru:'Просто «дж», как в слове «джаз». Твёрдый и звонкий звук.'
    } },
  { n:30,  cyr:'Ш ш', lat:'Š š',  ipa:'/ʃ/',   wCyr:'шума',    wLat:'šuma',    kind:'shared' },
];
