import type { PrepGroup } from '../lib/types.ts';

export const CASE_KEYS = {
  gen: 'case.2.name',
  dat: 'case.3.name',
  aku: 'case.4.name',
  ins: 'case.6.name',
  lok: 'case.7.name'
};

export const PREP_CASE_ABBR = {
  gen: 'GEN',
  dat: 'DAT',
  aku: 'AKU',
  ins: 'INS',
  lok: 'LOK'
};

export const PREP_GROUPS = [
  {
    key: 'prep.group.place',
    rows: [
      {
        prep: 'u', icon: 'in',
        uses: [
          { case: 'aku', icon: 'into', meaning: { en: 'into, to', ru: 'в, внутрь' }, sr: 'Idem u grad.', tr: { en: 'I am going into town.', ru: 'Я иду в город.' } },
          { case: 'lok', icon: 'in', meaning: { en: 'in, at', ru: 'в, внутри' }, sr: 'Živim u gradu.', tr: { en: 'I live in town.', ru: 'Я живу в городе.' } },
        ]
      },
      {
        prep: 'na', icon: 'on',
        uses: [
          { case: 'aku', icon: 'onto', meaning: { en: 'onto, to', ru: 'на, на поверхность' }, sr: 'Stavljam knjigu na sto.', tr: { en: 'I put the book onto the table.', ru: 'Я кладу книгу на стол.' } },
          { case: 'lok', icon: 'on', meaning: { en: 'on, at', ru: 'на, на месте' }, sr: 'Knjiga je na stolu.', tr: { en: 'The book is on the table.', ru: 'Книга на столе.' } },
        ]
      },
    ]
  },
  /* Static position first, because this is the series a learner will actually
     hear. The nad/pod/pred + INS forms below are correct but rarer; teaching
     them first produced sentences like `Podižem lampu nad sto` — grammatical,
     and nobody has ever said it. `iza` lives here, beside `za + INS`. */
  {
    key: 'prep.group.static',
    rows: [
      { prep: 'iznad', icon: 'over', uses: [{ case: 'gen', meaning: { en: 'above, over', ru: 'над' }, sr: 'Lampa je iznad stola.', tr: { en: 'The lamp is above the table.', ru: 'Лампа над столом.' } }] },
      { prep: 'ispod', icon: 'under', uses: [{ case: 'gen', meaning: { en: 'under, below', ru: 'под' }, sr: 'Mačka je ispod stola.', tr: { en: 'The cat is under the table.', ru: 'Кошка под столом.' } }] },
      { prep: 'ispred', icon: 'front', uses: [{ case: 'gen', meaning: { en: 'in front of', ru: 'перед' }, sr: 'Stojim ispred kuće.', tr: { en: 'I stand in front of the house.', ru: 'Я стою перед домом.' } }] },
      { prep: 'iza', icon: 'behind', uses: [{ case: 'gen', meaning: { en: 'behind', ru: 'за, позади' }, sr: 'Auto je iza kuće.', tr: { en: 'The car is behind the house.', ru: 'Машина за домом.' } }] },
      { prep: 'između', icon: 'between', uses: [{ case: 'gen', meaning: { en: 'between', ru: 'между' }, sr: 'Stojim između kuća.', tr: { en: 'I stand between the houses.', ru: 'Я стою между домами.' } }] },
      { prep: 'pored', icon: 'beside', uses: [{ case: 'gen', meaning: { en: 'beside, next to', ru: 'рядом с, возле' }, sr: 'Sedim pored prozora.', tr: { en: 'I sit by the window.', ru: 'Я сижу у окна.' } }] },
      { prep: 'kod', icon: 'near', uses: [{ case: 'gen', meaning: { en: "at (someone's place)", ru: 'у, возле' }, sr: 'Spavam kod brata.', tr: { en: "I sleep at my brother's place.", ru: 'Я ночую у брата.' } }] },
      { prep: 'blizu', icon: 'near', uses: [{ case: 'gen', meaning: { en: 'near', ru: 'близко к' }, sr: 'Stan je blizu centra.', tr: { en: 'The apartment is near the center.', ru: 'Квартира близко к центру.' } }] },
      { prep: 'oko', icon: 'around', uses: [{ case: 'gen', meaning: { en: 'around', ru: 'около, вокруг' }, sr: 'Sedimo oko stola.', tr: { en: 'We sit around the table.', ru: 'Мы сидим вокруг стола.' } }] },
      { prep: 'nasuprot', icon: 'opposite', uses: [{ case: 'dat', meaning: { en: 'opposite', ru: 'напротив' }, sr: 'Sedim nasuprot bratu.', tr: { en: 'I sit opposite my brother.', ru: 'Я сижу напротив брата.' } }] },
    ]
  },
  {
    key: 'prep.group.position',
    rows: [
      {
        prep: 'pod', icon: 'under',
        uses: [
          { case: 'aku', icon: 'under-motion', meaning: { en: 'to under', ru: 'под, движение' }, sr: 'Mačka ide pod sto.', tr: { en: 'The cat goes under the table.', ru: 'Кошка идёт под стол.' } },
          { case: 'ins', icon: 'under', meaning: { en: 'under (place; = ispod)', ru: 'под, место (= ispod)' }, sr: 'Mačka je pod stolom.', tr: { en: 'The cat is under the table.', ru: 'Кошка под столом.' } },
        ]
      },
      {
        prep: 'pred', icon: 'front',
        uses: [
          { case: 'aku', icon: 'front-motion', meaning: { en: 'to in front of', ru: 'перед, движение' }, sr: 'Stajem pred kuću.', tr: { en: 'I step in front of the house.', ru: 'Я встаю перед домом.' } },
          { case: 'ins', icon: 'front', meaning: { en: 'in front of (place; = ispred)', ru: 'перед, место (= ispred)' }, sr: 'Stojim pred kućom.', tr: { en: 'I stand in front of the house.', ru: 'Я стою перед домом.' } },
        ]
      },
      {
        prep: 'nad', icon: 'over',
        uses: [
          { case: 'aku', icon: 'over-motion', meaning: { en: 'to above', ru: 'над, движение' }, sr: 'Vešam lampu nad sto.', tr: { en: 'I hang the lamp above the table.', ru: 'Я вешаю лампу над столом.' } },
          { case: 'ins', icon: 'over', meaning: { en: 'above (place; = iznad)', ru: 'над, место (= iznad)' }, sr: 'Lampa je nad stolom.', tr: { en: 'The lamp is above the table.', ru: 'Лампа над столом.' } },
        ]
      },
      {
        prep: 'među', icon: 'between',
        uses: [
          { case: 'aku', icon: 'between-motion', meaning: { en: 'to among', ru: 'между, движение' }, sr: 'Ulazim među ljude.', tr: { en: 'I go among the people.', ru: 'Я вхожу в толпу.' } },
          { case: 'ins', icon: 'between', meaning: { en: 'among (place)', ru: 'среди, место' }, sr: 'Stojim među ljudima.', tr: { en: 'I stand among the people.', ru: 'Я стою среди людей.' } },
        ]
      },
      {
        prep: 'za', icon: 'behind',
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
      { prep: 'kroz', icon: 'through', uses: [{ case: 'aku', meaning: { en: 'through', ru: 'через, сквозь' }, sr: 'Idem kroz park.', tr: { en: 'I walk through the park.', ru: 'Я иду через парк.' } }] },
      { prep: 'preko', icon: 'across', uses: [{ case: 'gen', meaning: { en: 'across, over, via', ru: 'через, по' }, sr: 'Idem preko mosta.', tr: { en: 'I cross the bridge.', ru: 'Я иду через мост.' } }] },
      { prep: 'niz', icon: 'down', uses: [{ case: 'aku', meaning: { en: 'down along', ru: 'вниз по' }, sr: 'Idem niz ulicu.', tr: { en: 'I walk down the street.', ru: 'Я иду вниз по улице.' } }] },
      { prep: 'uz', icon: 'up', uses: [{ case: 'aku', meaning: { en: 'up along', ru: 'вверх по' }, sr: 'Idem uz stepenice.', tr: { en: 'I go up the stairs.', ru: 'Я иду вверх по лестнице.' } }] },
    ]
  },
  {
    key: 'prep.group.source',
    rows: [
      { prep: 'iz', icon: 'out', uses: [{ case: 'gen', meaning: { en: 'out of, from inside', ru: 'из, изнутри' }, sr: 'Izlazim iz kuće.', tr: { en: 'I leave the house.', ru: 'Я выхожу из дома.' } }] },
      { prep: 'od', icon: 'from', uses: [{ case: 'gen', meaning: { en: 'from, away from', ru: 'от' }, sr: 'Dolazim od prijatelja.', tr: { en: 'I am coming from a friend.', ru: 'Я иду от друга.' } }] },
      { prep: 's/sa', icon: 'off', uses: [{ case: 'gen', icon: 'off', meaning: { en: 'off, down from', ru: 'с, сверху' }, sr: 'Silazim sa autobusa.', tr: { en: 'I am getting off the bus.', ru: 'Я выхожу из автобуса.' } }] },
      { prep: 'do', icon: 'limit', uses: [{ case: 'gen', meaning: { en: 'up to, as far as', ru: 'до' }, sr: 'Idem do stanice.', tr: { en: 'I am going as far as the station.', ru: 'Я иду до станции.' } }] },
      { prep: 'k/ka', icon: 'toward', uses: [{ case: 'dat', meaning: { en: 'toward, to', ru: 'к' }, sr: 'Idem ka gradu.', tr: { en: 'I am going toward town.', ru: 'Я иду к городу.' } }] },
      { prep: 'prema', icon: 'toward', uses: [{ case: 'dat', meaning: { en: 'toward, facing', ru: 'к, по направлению' }, sr: 'Okrenut sam prema moru.', tr: { en: 'I am turned toward the sea.', ru: 'Я повёрнут к морю.' } }] },
      { prep: 'po', icon: 'fetch', uses: [{ case: 'aku', meaning: { en: 'to fetch, for', ru: 'за (чем-то)' }, sr: 'Idem po hleb.', tr: { en: 'I am going to get bread.', ru: 'Я иду за хлебом.' } }] },
    ]
  },
  {
    key: 'prep.group.time',
    rows: [
      { prep: 'pre', icon: 'before', uses: [{ case: 'gen', meaning: { en: 'before; ago', ru: 'до, перед; назад' }, sr: 'Pre ručka pijem vodu.', tr: { en: 'Before lunch I drink water.', ru: 'Перед обедом я пью воду.' } }] },
      { prep: 'posle', icon: 'after', uses: [{ case: 'gen', meaning: { en: 'after', ru: 'после' }, sr: 'Posle časa idem kući.', tr: { en: 'After class I go home.', ru: 'После урока я иду домой.' } }] },
      { prep: 'tokom', icon: 'during', uses: [{ case: 'gen', meaning: { en: 'during', ru: 'в течение, во время' }, sr: 'Tokom leta radim.', tr: { en: 'During the summer I work.', ru: 'Летом я работаю.' } }] },
      {
        prep: 'za', icon: 'future',
        uses: [
          { case: 'aku', icon: 'future', meaning: { en: 'in, after a span', ru: 'через, за срок' }, sr: 'Vraćam se za sat vremena.', tr: { en: 'I am coming back in an hour.', ru: 'Я вернусь через час.' } },
          { case: 'aku', icon: 'for', meaning: { en: 'for, intended for', ru: 'для' }, sr: 'Poklon je za majku.', tr: { en: 'The gift is for mother.', ru: 'Подарок для мамы.' } },
        ]
      },
    ]
  },
  {
    key: 'prep.group.fixed',
    rows: [
      { prep: 's/sa', icon: 'with', uses: [{ case: 'ins', meaning: { en: 'with', ru: 'с, вместе' }, sr: 'Putujem sa sestrom.', tr: { en: 'I travel with my sister.', ru: 'Я путешествую с сестрой.' } }] },
      { prep: 'uz', icon: 'with', uses: [{ case: 'aku', meaning: { en: 'alongside, along with', ru: 'вместе с, рядом с' }, sr: 'Pijem kafu uz kolač.', tr: { en: 'I drink coffee with cake.', ru: 'Я пью кофе с пирожным.' } }] },
      { prep: 'o', icon: 'about', uses: [{ case: 'lok', meaning: { en: 'about, on a topic', ru: 'о, про' }, sr: 'Pričamo o filmu.', tr: { en: 'We talk about the film.', ru: 'Мы говорим о фильме.' } }] },
      { prep: 'po', icon: 'around', uses: [{ case: 'lok', meaning: { en: 'around, by pattern', ru: 'по, вокруг' }, sr: 'Šetam po gradu.', tr: { en: 'I walk around town.', ru: 'Я гуляю по городу.' } }] },
      { prep: 'pri', icon: 'near', uses: [{ case: 'lok', meaning: { en: 'attached to, at', ru: 'при, у' }, sr: 'Radim pri školi.', tr: { en: 'I work at the school.', ru: 'Я работаю при школе.' } }] },
      { prep: 'bez', icon: 'without', uses: [{ case: 'gen', meaning: { en: 'without', ru: 'без' }, sr: 'Kafa bez šećera.', tr: { en: 'Coffee without sugar.', ru: 'Кофе без сахара.' } }] },
      { prep: 'protiv', icon: 'against', uses: [{ case: 'gen', meaning: { en: 'against', ru: 'против' }, sr: 'Igramo protiv njih.', tr: { en: 'We play against them.', ru: 'Мы играем против них.' } }] },
      { prep: 'zbog', icon: 'because', uses: [{ case: 'gen', meaning: { en: 'because of', ru: 'из-за' }, sr: 'Kasnim zbog kiše.', tr: { en: 'I am late because of the rain.', ru: 'Я опаздываю из-за дождя.' } }] },
      { prep: 'umesto', icon: 'instead', uses: [{ case: 'gen', meaning: { en: 'instead of', ru: 'вместо' }, sr: 'Pijem čaj umesto kafe.', tr: { en: 'I drink tea instead of coffee.', ru: 'Я пью чай вместо кофе.' } }] },
      { prep: 'osim', icon: 'except', uses: [{ case: 'gen', meaning: { en: 'except', ru: 'кроме' }, sr: 'Svi osim brata.', tr: { en: 'Everyone except my brother.', ru: 'Все, кроме брата.' } }] },
      { prep: 'uprkos', icon: 'despite', uses: [{ case: 'dat', meaning: { en: 'despite', ru: 'несмотря на' }, sr: 'Idemo uprkos kiši.', tr: { en: 'We go despite the rain.', ru: 'Мы идём несмотря на дождь.' } }] },
    ]
  },
] satisfies readonly PrepGroup[];
