const CASE_KEYS = {
  gen: 'case.2.name',
  dat: 'case.3.name',
  aku: 'case.4.name',
  ins: 'case.6.name',
  lok: 'case.7.name'
};

const PREP_GROUPS = [
  {
    key: 'prep.group.place',
    rows: [
      {
        prep: 'u', icon: 'in', tone: 'aku',
        uses: [
          { case: 'aku', icon: 'into', meaning: { en: 'into, to', ru: 'в, внутрь' }, sr: 'Idem u grad.', tr: { en: 'I am going into town.', ru: 'Я иду в город.' } },
          { case: 'lok', icon: 'in', meaning: { en: 'in, at', ru: 'в, внутри' }, sr: 'Živim u gradu.', tr: { en: 'I live in town.', ru: 'Я живу в городе.' } },
        ]
      },
      {
        prep: 'na', icon: 'on', tone: 'aku',
        uses: [
          { case: 'aku', icon: 'onto', meaning: { en: 'onto, to', ru: 'на, на поверхность' }, sr: 'Stavljam knjigu na sto.', tr: { en: 'I put the book onto the table.', ru: 'Я кладу книгу на стол.' } },
          { case: 'lok', icon: 'on', meaning: { en: 'on, at', ru: 'на, на месте' }, sr: 'Knjiga je na stolu.', tr: { en: 'The book is on the table.', ru: 'Книга на столе.' } },
        ]
      },
    ]
  },
  {
    key: 'prep.group.position',
    rows: [
      {
        prep: 'pod', icon: 'under', tone: 'ins',
        uses: [
          { case: 'aku', icon: 'under-motion', meaning: { en: 'to under', ru: 'под, движение' }, sr: 'Mačka ide pod sto.', tr: { en: 'The cat goes under the table.', ru: 'Кошка идёт под стол.' } },
          { case: 'ins', icon: 'under', meaning: { en: 'under', ru: 'под, место' }, sr: 'Mačka je pod stolom.', tr: { en: 'The cat is under the table.', ru: 'Кошка под столом.' } },
        ]
      },
      {
        prep: 'pred', icon: 'front', tone: 'ins',
        uses: [
          { case: 'aku', icon: 'front-motion', meaning: { en: 'to in front of', ru: 'перед, движение' }, sr: 'Stajem pred kuću.', tr: { en: 'I step in front of the house.', ru: 'Я встаю перед домом.' } },
          { case: 'ins', icon: 'front', meaning: { en: 'in front of', ru: 'перед, место' }, sr: 'Stojim pred kućom.', tr: { en: 'I stand in front of the house.', ru: 'Я стою перед домом.' } },
        ]
      },
      {
        prep: 'nad', icon: 'over', tone: 'ins',
        uses: [
          { case: 'aku', icon: 'over-motion', meaning: { en: 'to above', ru: 'над, движение' }, sr: 'Podižem lampu nad sto.', tr: { en: 'I lift the lamp above the table.', ru: 'Я поднимаю лампу над стол.' } },
          { case: 'ins', icon: 'over', meaning: { en: 'above, over', ru: 'над, место' }, sr: 'Lampa je nad stolom.', tr: { en: 'The lamp is above the table.', ru: 'Лампа над столом.' } },
        ]
      },
      {
        prep: 'među', icon: 'between', tone: 'ins',
        uses: [
          { case: 'aku', icon: 'between-motion', meaning: { en: 'to among, between', ru: 'между, движение' }, sr: 'Ulazim među ljude.', tr: { en: 'I go among the people.', ru: 'Я вхожу между людей.' } },
          { case: 'ins', icon: 'between', meaning: { en: 'among, between', ru: 'между, место' }, sr: 'Stojim među ljudima.', tr: { en: 'I stand among the people.', ru: 'Я стою между людьми.' } },
        ]
      },
      {
        prep: 'za', icon: 'behind', tone: 'ins',
        uses: [
          { case: 'aku', icon: 'behind-motion', meaning: { en: 'to behind', ru: 'за, движение' }, sr: 'Sakrivam se za kuću.', tr: { en: 'I hide behind the house.', ru: 'Я прячусь за дом.' } },
          { case: 'ins', icon: 'behind', meaning: { en: 'behind, at', ru: 'за, место' }, sr: 'Sedim za stolom.', tr: { en: 'I am sitting at the table.', ru: 'Я сижу за столом.' } },
        ]
      },
    ]
  },
  {
    key: 'prep.group.path',
    rows: [
      { prep: 'kroz', icon: 'through', tone: 'aku', uses: [{ case: 'aku', meaning: { en: 'through', ru: 'через, сквозь' }, sr: 'Idem kroz park.', tr: { en: 'I walk through the park.', ru: 'Я иду через парк.' } }] },
      { prep: 'niz', icon: 'down', tone: 'aku', uses: [{ case: 'aku', meaning: { en: 'down along', ru: 'вниз по' }, sr: 'Idem niz ulicu.', tr: { en: 'I walk down the street.', ru: 'Я иду вниз по улице.' } }] },
      { prep: 'uz', icon: 'up', tone: 'aku', uses: [{ case: 'aku', meaning: { en: 'up along', ru: 'вверх по' }, sr: 'Idem uz stepenice.', tr: { en: 'I go up the stairs.', ru: 'Я иду вверх по лестнице.' } }] },
    ]
  },
  {
    key: 'prep.group.source',
    rows: [
      { prep: 'iz', icon: 'out', tone: 'gen', uses: [{ case: 'gen', meaning: { en: 'out of, from inside', ru: 'из, изнутри' }, sr: 'Izlazim iz kuće.', tr: { en: 'I leave the house.', ru: 'Я выхожу из дома.' } }] },
      { prep: 'od', icon: 'from', tone: 'gen', uses: [{ case: 'gen', meaning: { en: 'from, away from', ru: 'от' }, sr: 'Dolazim od prijatelja.', tr: { en: 'I am coming from a friend.', ru: 'Я иду от друга.' } }] },
      { prep: 's/sa', icon: 'off', tone: 'gen', uses: [{ case: 'gen', icon: 'off', meaning: { en: 'from off, down from', ru: 'с, сверху/из' }, sr: 'Silazim sa autobusa.', tr: { en: 'I am getting off the bus.', ru: 'Я выхожу из автобуса.' } }] },
      { prep: 'do', icon: 'limit', tone: 'gen', uses: [{ case: 'gen', meaning: { en: 'up to, until', ru: 'до' }, sr: 'Idem do stanice.', tr: { en: 'I am going up to the station.', ru: 'Я иду до станции.' } }] },
      { prep: 'k/ka', icon: 'toward', tone: 'dat', uses: [{ case: 'dat', meaning: { en: 'toward, to', ru: 'к' }, sr: 'Idem ka gradu.', tr: { en: 'I am going toward town.', ru: 'Я иду к городу.' } }] },
      { prep: 'prema', icon: 'toward', tone: 'dat', uses: [{ case: 'dat', meaning: { en: 'toward, facing', ru: 'к, по направлению' }, sr: 'Okrenut sam prema moru.', tr: { en: 'I am turned toward the sea.', ru: 'Я повернут к морю.' } }] },
    ]
  },
  {
    key: 'prep.group.time',
    rows: [
      { prep: 'pre', icon: 'before', tone: 'gen', uses: [{ case: 'gen', meaning: { en: 'before', ru: 'до, перед' }, sr: 'Pre ručka pijem vodu.', tr: { en: 'Before lunch I drink water.', ru: 'Перед обедом я пью воду.' } }] },
      { prep: 'posle', icon: 'after', tone: 'gen', uses: [{ case: 'gen', meaning: { en: 'after', ru: 'после' }, sr: 'Posle časa idem kući.', tr: { en: 'After class I go home.', ru: 'После урока я иду домой.' } }] },
      {
        prep: 'za', icon: 'future', tone: 'aku',
        uses: [
          { case: 'aku', icon: 'future', meaning: { en: 'in, for a span', ru: 'через, за срок' }, sr: 'Vraćam se za sat vremena.', tr: { en: 'I am coming back in an hour.', ru: 'Я вернусь через час.' } },
          { case: 'aku', icon: 'for', meaning: { en: 'for, intended for', ru: 'для' }, sr: 'Poklon je za majku.', tr: { en: 'The gift is for mother.', ru: 'Подарок для мамы.' } },
        ]
      },
    ]
  },
  {
    key: 'prep.group.fixed',
    rows: [
      { prep: 's/sa', icon: 'with', tone: 'ins', uses: [{ case: 'ins', meaning: { en: 'with', ru: 'с, вместе' }, sr: 'Putujem sa sestrom.', tr: { en: 'I travel with my sister.', ru: 'Я путешествую с сестрой.' } }] },
      { prep: 'o', icon: 'about', tone: 'lok', uses: [{ case: 'lok', meaning: { en: 'about, on a topic', ru: 'о, про' }, sr: 'Pričamo o filmu.', tr: { en: 'We talk about the film.', ru: 'Мы говорим о фильме.' } }] },
      { prep: 'po', icon: 'around', tone: 'lok', uses: [{ case: 'lok', meaning: { en: 'around, by pattern', ru: 'по, вокруг' }, sr: 'Šetam po gradu.', tr: { en: 'I walk around town.', ru: 'Я гуляю по городу.' } }] },
      { prep: 'pri', icon: 'near', tone: 'lok', uses: [{ case: 'lok', meaning: { en: 'attached to, at', ru: 'при, у' }, sr: 'Radim pri školi.', tr: { en: 'I work at the school.', ru: 'Я работаю при школе.' } }] },
      { prep: 'bez', icon: 'without', tone: 'gen', uses: [{ case: 'gen', meaning: { en: 'without', ru: 'без' }, sr: 'Kafa bez šećera.', tr: { en: 'Coffee without sugar.', ru: 'Кофе без сахара.' } }] },
      { prep: 'kod', icon: 'near', tone: 'gen', uses: [{ case: 'gen', meaning: { en: "at someone's place", ru: 'у, возле' }, sr: 'Spavam kod brata.', tr: { en: "I sleep at my brother's place.", ru: 'Я ночую у брата.' } }] },
      { prep: 'blizu', icon: 'near', tone: 'gen', uses: [{ case: 'gen', meaning: { en: 'near', ru: 'близко к' }, sr: 'Stan je blizu centra.', tr: { en: 'The apartment is near the center.', ru: 'Квартира близко к центру.' } }] },
      { prep: 'oko', icon: 'around', tone: 'gen', uses: [{ case: 'gen', meaning: { en: 'around', ru: 'около, вокруг' }, sr: 'Sedimo oko stola.', tr: { en: 'We sit around the table.', ru: 'Мы сидим вокруг стола.' } }] },
      { prep: 'iza', icon: 'behind', tone: 'gen', uses: [{ case: 'gen', meaning: { en: 'behind', ru: 'за, позади' }, sr: 'Auto je iza kuće.', tr: { en: 'The car is behind the house.', ru: 'Машина за домом.' } }] },
      { prep: 'nasuprot', icon: 'opposite', tone: 'dat', uses: [{ case: 'dat', meaning: { en: 'opposite', ru: 'напротив' }, sr: 'Sedim nasuprot bratu.', tr: { en: 'I sit opposite my brother.', ru: 'Я сижу напротив брата.' } }] },
    ]
  },
];
