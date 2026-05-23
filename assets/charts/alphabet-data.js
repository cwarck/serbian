/* Alphabet data — Serbian (azbuka order).
   kind: 'unique' = specific to S-Cr family,
         'shared' = familiar Cyrillic to other Slavic readers,
         'diff'   = Cyrillic letter that looks like a Latin one but sounds different. */

const ALPHABET = [
  { n: 1,  cyr:'А а', lat:'A a',  ipa:'/a/',   wCyr:'авион',   wLat:'avion',   kind:'shared', tr:{en:'airplane', ru:'самолёт'} },
  { n: 2,  cyr:'Б б', lat:'B b',  ipa:'/b/',   wCyr:'банана',  wLat:'banana',  kind:'shared', tr:{en:'banana',   ru:'банан'} },
  { n: 3,  cyr:'В в', lat:'V v',  ipa:'/ʋ/',   wCyr:'вода',    wLat:'voda',    kind:'diff',   tr:{en:'water',    ru:'вода'} },
  { n: 4,  cyr:'Г г', lat:'G g',  ipa:'/ɡ/',   wCyr:'гора',    wLat:'gora',    kind:'shared', tr:{en:'mountain', ru:'гора'} },
  { n: 5,  cyr:'Д д', lat:'D d',  ipa:'/d/',   wCyr:'дом',     wLat:'dom',     kind:'shared', tr:{en:'home',     ru:'дом'} },
  { n: 6,  cyr:'Ђ ђ', lat:'Đ đ',  ipa:'/dʑ/',  wCyr:'ђак',     wLat:'đak',     kind:'unique', tr:{en:'pupil',    ru:'ученик'},
    tip:{
      en:'A soft sound between “d” and “j”. Imagine the gentle “dy” sound some people use in <em>duke</em>. Your tongue stays close to the roof of the mouth, making it soft and smooth.',
      ru:'Мягкий звук между «дь» и «дж». Представь очень мягкое «д» в слове «дядя». Язык прижимается к нёбу, поэтому звук получается «нежным».'
    } },
  { n: 7,  cyr:'Е е', lat:'E e',  ipa:'/e/',   wCyr:'европа',  wLat:'evropa',  kind:'shared', tr:{en:'Europe',   ru:'Европа'} },
  { n: 8,  cyr:'Ж ж', lat:'Ž ž',  ipa:'/ʒ/',   wCyr:'жена',    wLat:'žena',    kind:'shared', tr:{en:'woman',    ru:'женщина'} },
  { n: 9,  cyr:'З з', lat:'Z z',  ipa:'/z/',   wCyr:'зима',    wLat:'zima',    kind:'shared', tr:{en:'winter',   ru:'зима'} },
  { n:10,  cyr:'И и', lat:'I i',  ipa:'/i/',   wCyr:'игра',    wLat:'igra',    kind:'shared', tr:{en:'game',     ru:'игра'} },
  { n:11,  cyr:'Ј ј', lat:'J j',  ipa:'/j/',   wCyr:'јабука',  wLat:'jabuka',  kind:'unique', tr:{en:'apple',    ru:'яблоко'} },
  { n:12,  cyr:'К к', lat:'K k',  ipa:'/k/',   wCyr:'књига',   wLat:'knjiga',  kind:'shared', tr:{en:'book',     ru:'книга'} },
  { n:13,  cyr:'Л л', lat:'L l',  ipa:'/l/',   wCyr:'лето',    wLat:'leto',    kind:'shared', tr:{en:'summer',   ru:'лето'} },
  { n:14,  cyr:'Љ љ', lat:'Lj lj',ipa:'/ʎ/',   wCyr:'љубав',   wLat:'ljubav',  kind:'unique', tr:{en:'love',     ru:'любовь'} },
  { n:15,  cyr:'М м', lat:'M m',  ipa:'/m/',   wCyr:'мост',    wLat:'most',    kind:'shared', tr:{en:'bridge',   ru:'мост'} },
  { n:16,  cyr:'Н н', lat:'N n',  ipa:'/n/',   wCyr:'небо',    wLat:'nebo',    kind:'diff',   tr:{en:'sky',      ru:'небо'} },
  { n:17,  cyr:'Њ њ', lat:'Nj nj',ipa:'/ɲ/',   wCyr:'њива',    wLat:'njiva',   kind:'unique', tr:{en:'field',    ru:'поле'} },
  { n:18,  cyr:'О о', lat:'O o',  ipa:'/o/',   wCyr:'отац',    wLat:'otac',    kind:'shared', tr:{en:'father',   ru:'отец'} },
  { n:19,  cyr:'П п', lat:'P p',  ipa:'/p/',   wCyr:'птица',   wLat:'ptica',   kind:'shared', tr:{en:'bird',     ru:'птица'} },
  { n:20,  cyr:'Р р', lat:'R r',  ipa:'/r/',   wCyr:'река',    wLat:'reka',    kind:'diff',   tr:{en:'river',    ru:'река'} },
  { n:21,  cyr:'С с', lat:'S s',  ipa:'/s/',   wCyr:'сир',     wLat:'sir',     kind:'diff',   tr:{en:'cheese',   ru:'сыр'} },
  { n:22,  cyr:'Т т', lat:'T t',  ipa:'/t/',   wCyr:'телефон', wLat:'telefon', kind:'shared', tr:{en:'phone',    ru:'телефон'} },
  { n:23,  cyr:'Ћ ћ', lat:'Ć ć',  ipa:'/tɕ/',  wCyr:'ћуран',   wLat:'ćuran',   kind:'unique', tr:{en:'turkey',   ru:'индюк'},
    tip:{
      en:'A soft version of “ch”. Imagine starting with a tiny “t” before the “ch” sound. It feels lighter and gentler than a normal English “ch”.',
      ru:'Мягкая версия «ч». Как будто ты одновременно говоришь «ть» и «ч». Звук лёгкий и «тонкий».'
    } },
  { n:24,  cyr:'У у', lat:'U u',  ipa:'/u/',   wCyr:'улица',   wLat:'ulica',   kind:'diff',   tr:{en:'street',   ru:'улица'} },
  { n:25,  cyr:'Ф ф', lat:'F f',  ipa:'/f/',   wCyr:'фабрика', wLat:'fabrika', kind:'shared', tr:{en:'factory',  ru:'фабрика'} },
  { n:26,  cyr:'Х х', lat:'H h',  ipa:'/x/',   wCyr:'хладно',  wLat:'hladno',  kind:'diff',   tr:{en:'cold',     ru:'холодно'} },
  { n:27,  cyr:'Ц ц', lat:'C c',  ipa:'/ts/',  wCyr:'цвет',    wLat:'cvet',    kind:'shared', tr:{en:'flower',   ru:'цветок'} },
  { n:28,  cyr:'Ч ч', lat:'Č č',  ipa:'/tʃ/',  wCyr:'час',     wLat:'čas',     kind:'shared', tr:{en:'lesson',   ru:'час·урок'},
    tip:{
      en:'Like the “ch” in <em>chocolate</em>. A strong and crisp sound.',
      ru:'Похоже на русский «ч» в слове «чай», но чуть твёрже и чётче.'
    } },
  { n:29,  cyr:'Џ џ', lat:'Dž dž',ipa:'/dʒ/',  wCyr:'џеп',     wLat:'džep',    kind:'unique', tr:{en:'pocket',   ru:'карман'},
    tip:{
      en:'The same sound as “j” in <em>jam</em>. Strong, voiced, and easy to hear.',
      ru:'Просто «дж», как в слове «джаз». Твёрдый и звонкий звук.'
    } },
  { n:30,  cyr:'Ш ш', lat:'Š š',  ipa:'/ʃ/',   wCyr:'шума',    wLat:'šuma',    kind:'shared', tr:{en:'forest',   ru:'лес'} },
];
