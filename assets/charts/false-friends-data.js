const FALSE_FRIEND_GROUPS = [
  {
    key: 'false.group.common',
    rows: [
      {
        sr: 'pozorište',
        means: 'театр',
        trap: 'позор',
        trapMeans: 'стыд',
        ex: { sr: 'Idemo u pozorište.', ru: 'Идём в театр.' }
      },
      {
        sr: 'hrana',
        means: 'еда, пища',
        trap: 'охрана, хранение',
        trapMeans: 'защита, сохранение',
        ex: { sr: 'Kupujem hranu.', ru: 'Покупаю еду.' }
      },
      {
        sr: 'vredan',
        means: 'трудолюбивый; ценный',
        trap: 'вредный',
        trapMeans: 'наносящий вред',
        ex: { sr: 'On je vredan.', ru: 'Он трудолюбивый.' }
      },
      {
        sr: 'ponos',
        means: 'гордость',
        trap: 'понос',
        trapMeans: 'диарея',
        ex: { sr: 'To je moj ponos.', ru: 'Это моя гордость.' }
      },
      {
        sr: 'poklon',
        means: 'подарок',
        trap: 'поклон',
        trapMeans: 'наклон головы или корпуса',
        ex: { sr: 'Ovo je poklon.', ru: 'Это подарок.' }
      },
      {
        sr: 'pravda',
        means: 'справедливость',
        trap: 'правда',
        trapMeans: 'истина',
        ex: { sr: 'Tražim pravdu.', ru: 'Я ищу справедливости.' }
      },
      {
        sr: 'reč',
        means: 'слово',
        trap: 'речь',
        trapMeans: 'говорение, выступление',
        ex: { sr: 'Nova reč.', ru: 'Новое слово.' }
      },
      {
        sr: 'iskustvo',
        means: 'опыт',
        trap: 'искусство',
        trapMeans: 'художественная деятельность',
        ex: { sr: 'Imam iskustvo.', ru: 'У меня есть опыт.' }
      },
      {
        sr: 'trudna',
        means: 'беременная',
        trap: 'трудная',
        trapMeans: 'сложная',
        ex: { sr: 'Ona je trudna.', ru: 'Она беременна.' }
      },
      {
        sr: 'potres',
        means: 'землетрясение',
        trap: 'потрясение',
        trapMeans: 'сильное волнение',
        ex: { sr: 'Bio je potres.', ru: 'Было землетрясение.' }
      }
    ]
  },
  {
    key: 'false.group.things',
    rows: [
      {
        sr: 'stolica',
        means: 'стул',
        trap: 'столица',
        trapMeans: 'главный город',
        ex: { sr: 'Stolica je pored stola.', ru: 'Стул возле стола.' }
      },
      {
        sr: 'stan',
        means: 'квартира',
        trap: 'стан',
        trapMeans: 'лагерь, корпус, станок',
        ex: { sr: 'Živim u stanu.', ru: 'Я живу в квартире.' }
      },
      {
        sr: 'sad',
        means: 'сейчас',
        trap: 'сад',
        trapMeans: 'участок с деревьями',
        ex: { sr: 'Sad idem.', ru: 'Сейчас иду.' }
      },
      {
        sr: 'sutra',
        means: 'завтра',
        trap: 'с утра',
        trapMeans: 'начиная с утра',
        ex: { sr: 'Vidimo se sutra.', ru: 'Увидимся завтра.' }
      },
      {
        sr: 'život',
        means: 'жизнь',
        trap: 'живот',
        trapMeans: 'часть тела',
        ex: { sr: 'Život je lep.', ru: 'Жизнь прекрасна.' }
      },
      {
        sr: 'jagoda',
        means: 'клубника, земляника',
        trap: 'ягода',
        trapMeans: 'любой ягодный плод',
        ex: { sr: 'Jedem jagode.', ru: 'Ем клубнику.' }
      },
      {
        sr: 'brusnica',
        means: 'клюква',
        trap: 'брусника',
        trapMeans: 'другая ягода',
        ex: { sr: 'Sok od brusnice.', ru: 'Клюквенный сок.' }
      },
      {
        sr: 'korica',
        means: 'корка; обложка',
        trap: 'корица',
        trapMeans: 'пряность',
        ex: { sr: 'Korica hleba.', ru: 'Корка хлеба.' }
      },
      {
        sr: 'bukva',
        means: 'бук',
        trap: 'буква',
        trapMeans: 'знак алфавита',
        ex: { sr: 'Stara bukva raste u parku.', ru: 'Старый бук растёт в парке.' }
      },
      {
        sr: 'slovo',
        means: 'буква',
        trap: 'слово',
        trapMeans: 'единица речи',
        ex: { sr: 'Slovo ć.', ru: 'Буква ć.' }
      }
    ]
  },
  {
    key: 'false.group.partial',
    rows: [
      {
        sr: 'vreme',
        means: 'время; погода',
        trap: 'время',
        trapMeans: 'только время',
        ex: { sr: 'Kakvo je vreme?', ru: 'Какая погода?' }
      },
      {
        sr: 'sto',
        means: 'стол; сто',
        trap: 'сто',
        trapMeans: 'число 100',
        ex: { sr: 'Knjiga je na stolu.', ru: 'Книга на столе.' }
      },
      {
        sr: 'govor',
        means: 'речь; манера говорить',
        trap: 'говор',
        trapMeans: 'диалект, выговор',
        ex: { sr: 'Njegov govor je jasan.', ru: 'Его речь ясна.' }
      },
      {
        sr: 'sklad',
        means: 'гармония, лад',
        trap: 'склад',
        trapMeans: 'хранилище; тип телосложения',
        ex: { sr: 'Žive u skladu.', ru: 'Живут в согласии.' }
      },
      {
        sr: 'struka',
        means: 'профессия, специальность',
        trap: 'стук',
        trapMeans: 'звук удара',
        ex: { sr: 'Moja struka je medicina.', ru: 'Моя специальность - медицина.' }
      },
      {
        sr: 'dijeta',
        means: 'рацион, питание',
        trap: 'диета',
        trapMeans: 'ограниченный режим еды',
        ex: { sr: 'Zdrava dijeta.', ru: 'Здоровое питание.' }
      }
    ]
  }
];
