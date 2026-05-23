const CONTRAST = [
  {
    key: { en: 'Shape', ru: 'Форма' },
    imp: { en: 'process, duration', ru: 'процесс, длительность' },
    perf: { en: 'result, boundary', ru: 'результат, граница' },
    impEx: { sr: 'Pišem pismo.', en: 'I am writing a letter.', ru: 'Я пишу письмо.' },
    perfEx: { sr: 'Napisaću pismo.', en: 'I will write the letter.', ru: 'Я напишу письмо.' }
  },
  {
    key: { en: 'Repeat', ru: 'Повтор' },
    imp: { en: 'habit, repeated action', ru: 'привычка, повтор' },
    perf: { en: 'one completed event', ru: 'одно завершённое событие' },
    impEx: { sr: 'Čitam svako veče.', en: 'I read every evening.', ru: 'Я читаю каждый вечер.' },
    perfEx: { sr: 'Pročitao sam knjigu.', en: 'I finished the book.', ru: 'Я прочитал книгу.' }
  },
  {
    key: { en: 'Present', ru: 'Настоящее' },
    imp: { en: 'now or generally', ru: 'сейчас или вообще' },
    perf: { en: 'future, sequence, condition', ru: 'будущее, последовательность, условие' },
    impEx: { sr: 'Gledam film.', en: 'I am watching a film.', ru: 'Я смотрю фильм.' },
    perfEx: { sr: 'Kad pogledam, reći ću.', en: 'When I look, I will say.', ru: 'Когда посмотрю, скажу.' }
  }
];

const TIME_ROWS = [
  {
    tense: { en: 'Present', ru: 'Настоящее' },
    imp: { sr: 'Pišem.', en: 'now / habit', ru: 'сейчас / обычно' },
    perf: { sr: 'Napišem.', en: 'when I write / I will write', ru: 'когда напишу / напишу' }
  },
  {
    tense: { en: 'Past', ru: 'Прошедшее' },
    imp: { sr: 'Pisao sam.', en: 'was writing / used to write', ru: 'писал / бывало писал' },
    perf: { sr: 'Napisao sam.', en: 'wrote and finished', ru: 'написал до результата' }
  },
  {
    tense: { en: 'Future', ru: 'Будущее' },
    imp: { sr: 'Pisaću.', en: 'will write / will be writing', ru: 'буду писать' },
    perf: { sr: 'Napisaću.', en: 'will write and finish', ru: 'напишу до результата' }
  }
];

const PATTERNS = [
  {
    pattern: { en: 'bare verb + prefix', ru: 'глагол + приставка' },
    imp: 'pisati',
    perf: 'napisati',
    signal: { en: 'finished text', ru: 'готовый текст' }
  },
  {
    pattern: { en: 'secondary imperfective', ru: 'вторичный несов.' },
    imp: 'otvarati',
    perf: 'otvoriti',
    signal: { en: 'open repeatedly / be opening', ru: 'открывать не раз / в процессе' }
  },
  {
    pattern: { en: 'suffix pair', ru: 'суффиксальная пара' },
    imp: 'kupovati',
    perf: 'kupiti',
    signal: { en: 'buying vs one purchase', ru: 'покупать vs купить' }
  },
  {
    pattern: { en: 'stem-change pair', ru: 'пара с другой основой' },
    imp: 'uzimati',
    perf: 'uzeti',
    signal: { en: 'taking vs one take', ru: 'брать vs взять' }
  }
];

const PREFIXES = [
  {
    prefix: 'na-',
    tone: 'na',
    feel: { en: 'completion, enough', ru: 'завершение, достаточно' },
    pairs: ['pisati -> napisati', 'učiti -> naučiti', 'jesti -> najesti se'],
    note: {
      title: { en: 'na- is not only completion', ru: 'na- не только завершение' },
      body: { en: 'The prefix can also mean onto, up, or enough. Treat the pair as a lexical fact first, and the prefix as a useful hint second.', ru: 'Приставка также может значить «на», «наверх» или «вдоволь». Сначала запоминайте пару как слово, а приставку используйте как подсказку.' }
    }
  },
  {
    prefix: 'po-',
    tone: 'po',
    feel: { en: 'short action, once, start', ru: 'немного, один раз, начало' },
    pairs: ['gledati -> pogledati', 'čekati -> počekati', 'pričati -> popričati'],
    note: {
      title: { en: 'po- is broad', ru: 'po- очень широкая' },
      body: { en: 'It often marks a bounded action: take a look, wait a bit, talk for a while. The exact feel depends on the verb.', ru: 'Часто она ограничивает действие: посмотреть, подождать, поговорить. Точный оттенок зависит от глагола.' }
    }
  },
  {
    prefix: 'u-',
    tone: 'u',
    feel: { en: 'into, successful result', ru: 'внутрь, успешный результат' },
    pairs: ['raditi -> uraditi', 'ići -> ući', 'upoznavati -> upoznati']
  },
  {
    prefix: 'iz-',
    tone: 'iz',
    feel: { en: 'out, fully through', ru: 'из, полностью' },
    pairs: ['vaditi -> izvaditi', 'birati -> izabrati', 'graditi -> izgraditi']
  },
  {
    prefix: 'do-',
    tone: 'do',
    feel: { en: 'reach, add up to', ru: 'дойти, добавить до точки' },
    pairs: ['dolaziti -> doći', 'nositi -> doneti', 'pisati -> dopisati'],
    note: {
      title: { en: 'Motion verbs compress patterns', ru: 'Глаголы движения сжимают схемы' },
      body: { en: 'Motion pairs often have extra stem changes. Keep them visible, but do not use them as the model for every verb.', ru: 'В парах движения часто есть дополнительные изменения основы. Их стоит видеть, но не брать за модель для всех глаголов.' }
    }
  },
  {
    prefix: 'pro-',
    tone: 'pro',
    feel: { en: 'through, for a span', ru: 'через, за промежуток' },
    pairs: ['čitati -> pročitati', 'živeti -> proživeti', 'ići -> proći']
  }
];

const COMMON_PAIRS = [
  { meaning: { en: 'work / do', ru: 'делать' }, imp: 'raditi', perf: 'uraditi', ex: { sr: 'Uradio sam domaći.', en: 'I did the homework.', ru: 'Я сделал домашку.' } },
  { meaning: { en: 'write', ru: 'писать' }, imp: 'pisati', perf: 'napisati', ex: { sr: 'Napisala je mejl.', en: 'She wrote an email.', ru: 'Она написала письмо.' } },
  { meaning: { en: 'read', ru: 'читать' }, imp: 'čitati', perf: 'pročitati', ex: { sr: 'Pročitao sam knjigu.', en: 'I finished the book.', ru: 'Я прочитал книгу.' } },
  { meaning: { en: 'watch / look', ru: 'смотреть' }, imp: 'gledati', perf: 'pogledati', ex: { sr: 'Pogledaj ovo.', en: 'Look at this.', ru: 'Посмотри на это.' } },
  { meaning: { en: 'learn', ru: 'учить' }, imp: 'učiti', perf: 'naučiti', ex: { sr: 'Naučili smo padeže.', en: 'We learned the cases.', ru: 'Мы выучили падежи.' } },
  { meaning: { en: 'buy', ru: 'покупать' }, imp: 'kupovati', perf: 'kupiti', ex: { sr: 'Kupio sam kartu.', en: 'I bought a ticket.', ru: 'Я купил билет.' } },
  { meaning: { en: 'take', ru: 'брать' }, imp: 'uzimati', perf: 'uzeti', ex: { sr: 'Uzmi vodu.', en: 'Take some water.', ru: 'Возьми воду.' } },
  { meaning: { en: 'give', ru: 'давать' }, imp: 'davati', perf: 'dati', ex: { sr: 'Dao mi je ključ.', en: 'He gave me the key.', ru: 'Он дал мне ключ.' } },
  { meaning: { en: 'open', ru: 'открывать' }, imp: 'otvarati', perf: 'otvoriti', ex: { sr: 'Otvorila je vrata.', en: 'She opened the door.', ru: 'Она открыла дверь.' } },
  { meaning: { en: 'forget', ru: 'забывать' }, imp: 'zaboravljati', perf: 'zaboraviti', ex: { sr: 'Zaboravio sam ime.', en: 'I forgot the name.', ru: 'Я забыл имя.' } }
];

const TRAPS = [
  {
    trap: { en: 'one imperfective, many perfectives', ru: 'один несов., много сов.' },
    why: { en: 'prefixes add result, direction, start, amount, or a new lexical meaning.', ru: 'приставки добавляют результат, направление, начало, меру или новое словарное значение.' }
  },
  {
    trap: { en: 'perfective present is not normal now', ru: 'сов. настоящее не обычное «сейчас»' },
    why: { en: 'it usually appears in future, condition, sequence, or repeated-frame contexts.', ru: 'обычно это будущее, условие, последовательность или повторяющаяся рамка.' }
  },
  {
    trap: { en: 'dictionary pairs are contextual', ru: 'словарные пары зависят от контекста' },
    why: { en: 'the right perfective can change with the exact result you mean.', ru: 'нужный совершенный глагол зависит от конкретного результата.' }
  },
  {
    trap: { en: 'motion verbs are special', ru: 'глаголы движения особые' },
    why: { en: 'direction, prefix, and stem changes overlap; keep them as their own chart.', ru: 'направление, приставка и изменения основы накладываются друг на друга.' }
  }
];
