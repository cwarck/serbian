import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

const chartDataFiles = {
  'assets/charts/alphabet-data.js': ['ALPHABET'],
  'assets/charts/aspect-data.js': ['CONTRAST', 'TIME_ROWS', 'PATTERNS', 'PREFIXES', 'COMMON_PAIRS', 'TRAPS'],
  'assets/charts/cases-data.js': ['CASES', 'IDECL', 'WRINKLES', 'CAST', 'ENDING_AXES'],
  'assets/charts/false-friends-data.js': ['FALSE_FRIEND_GROUPS'],
  'assets/charts/numbers-data.js': ['NUMBER_GROUPS', 'NUMBER_BUILDS', 'NOUN_COUNTS', 'ORDINALS'],
  'assets/charts/pitch-stress-data.js': ['PITCH_ACCENTS', 'PITCH_RULES', 'PITCH_LENGTH_ROWS', 'PITCH_PARADIGMS', 'PITCH_PRIORITY', 'PITCH_READING', 'PITCH_NOTES'],
  'assets/charts/prepositions-data.js': ['CASE_KEYS', 'PREP_GROUPS'],
  'assets/charts/pronouns-data.js': ['PERSONAL', 'POSSESSIVES', 'DEMOS', 'QUESTIONS'],
  'assets/charts/verbs-data.js': ['PRONOUNS', 'VERB_GROUPS', 'IRREGULARS', 'PAST', 'FUTURE'],
};

function rel(file) {
  return path.relative(root, file);
}

function read(relPath) {
  return readFileSync(path.join(root, relPath), 'utf8');
}

function fail(scope, message) {
  errors.push(`${scope}: ${message}`);
}

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function expect(condition, scope, message) {
  if (!condition) fail(scope, message);
}

function expectString(value, scope, field) {
  expect(typeof value === 'string' && value.length > 0, scope, `${field} must be non-empty string`);
}

function expectArray(value, scope, field) {
  expect(Array.isArray(value) && value.length > 0, scope, `${field} must be non-empty array`);
}

function expectLocalized(value, scope, field) {
  expect(isObject(value), scope, `${field} must be object`);
  if (!isObject(value)) return;
  expectString(value.en, scope, `${field}.en`);
  expectString(value.ru, scope, `${field}.ru`);
}

function expectTranslation(value, scope, field = 'tr') {
  expectLocalized(value, scope, field);
}

function walk(dir, predicate, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === '.git' || entry === '.wrangler' || entry === 'node_modules') continue;
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, predicate, out);
    else if (predicate(full)) out.push(full);
  }
  return out;
}

function loadI18n() {
  const context = { window: {}, console };
  vm.createContext(context);
  vm.runInContext(read('assets/i18n.js'), context, { filename: 'assets/i18n.js' });
  return context.window.I18N;
}

function loadScriptConverter() {
  const context = {
    window: {},
    console,
    localStorage: { getItem: () => null, setItem: () => {} },
    navigator: { languages: ['en'], language: 'en' },
    document: {
      readyState: 'loading',
      addEventListener: () => {},
      documentElement: { setAttribute: () => {} },
      querySelectorAll: () => [],
    },
  };
  vm.createContext(context);
  vm.runInContext(read('assets/app.js'), context, { filename: 'assets/app.js' });
  return context.window.AtlasSrpski;
}

function loadData(relPath, names) {
  const source = `${read(relPath)}\nglobalThis.__atlasData = { ${names.join(', ')} };`;
  const context = { console };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: relPath });
  return context.__atlasData;
}

function loadGlossary(relPath) {
  const context = { window: {}, console };
  vm.createContext(context);
  vm.runInContext(read(relPath), context, { filename: relPath });
  return context.window.GLOSSARY;
}

const i18n = loadI18n();
const scriptConverter = loadScriptConverter();
const data = Object.fromEntries(
  Object.entries(chartDataFiles).map(([file, names]) => [file, loadData(file, names)])
);
const glossary = loadGlossary('data/glossary.js');

function collectHtmlI18nKeys(files) {
  const keys = new Set();

  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/\bdata-i18n="([^"]+)"/g)) {
      keys.add(match[1]);
    }
    for (const match of source.matchAll(/\bdata-i18n-attr="([^"]+)"/g)) {
      for (const pair of match[1].split(',')) {
        const key = pair.trim().split(':')[1];
        if (key) keys.add(key.trim());
      }
    }
  }

  return keys;
}

function collectJsLiteralI18nKeys(files) {
  const keys = new Set();

  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/\bt(?:Cases)?\(['"]([a-z][a-z0-9.-]+)['"]\)/g)) {
      keys.add(match[1]);
    }
    for (const match of source.matchAll(/\bui\(['"]([a-z][a-z0-9.-]+)['"]\)/g)) {
      const prefix = source.includes("function ui(key) { return t('aspect.' + key); }")
        ? 'aspect'
        : source.includes("function ui(key) { return t('pitch.' + key); }")
          ? 'pitch'
          : null;
      if (prefix) keys.add(`${prefix}.${match[1]}`);
    }
  }

  return keys;
}

function collectDataI18nKeys() {
  const keys = new Set();
  const add = key => keys.add(key);
  const addCaseKey = key => ['name', 'local', 'tagline', 'q'].forEach(suffix => add(`${key}.${suffix}`));

  const cases = data['assets/charts/cases-data.js'];
  cases.CASES.forEach(c => {
    addCaseKey(c.key);
    Object.values(c.endings).forEach(byNumber => {
      Object.values(byNumber).forEach(cell => {
        const splits = isObject(cell) && Array.isArray(cell.split) ? cell.split : [];
        splits.forEach(split => {
          if (split.labelKey) add(split.labelKey);
        });
      });
    });
  });
  cases.WRINKLES.forEach(item => add(`${item.key}.title`));

  const numbers = data['assets/charts/numbers-data.js'];
  numbers.NUMBER_GROUPS.forEach(group => add(group.key));

  const prep = data['assets/charts/prepositions-data.js'];
  Object.values(prep.CASE_KEYS).forEach(add);
  prep.PREP_GROUPS.forEach(group => add(group.key));

  const falseFriends = data['assets/charts/false-friends-data.js'];
  falseFriends.FALSE_FRIEND_GROUPS.forEach(group => add(group.key));

  const pronouns = data['assets/charts/pronouns-data.js'];
  pronouns.PERSONAL.forEach(row => add(row.label));
  pronouns.POSSESSIVES.forEach(row => {
    add(row.owner);
    if (row.note) add(row.note);
  });
  pronouns.DEMOS.forEach(group => {
    add(group.title);
    group.rows.forEach(row => add(row.key));
  });
  pronouns.QUESTIONS.whose.forEach(row => add(row.label));
  pronouns.QUESTIONS.whoWhat.forEach(row => add(row.key));

  const verbs = data['assets/charts/verbs-data.js'];
  for (const part of [...verbs.PAST.formula, ...verbs.FUTURE.formula]) {
    if (part.key) add(part.key);
  }
  verbs.PAST.endings.forEach(row => add(row.key));

  return keys;
}

function validateI18n() {
  const langs = Object.keys(i18n || {});
  expect(langs.includes('en') && langs.includes('ru'), 'i18n', 'en and ru dictionaries required');

  const enKeys = new Set(Object.keys(i18n.en || {}));
  const ruKeys = new Set(Object.keys(i18n.ru || {}));
  for (const key of enKeys) expect(ruKeys.has(key), 'i18n', `ru missing key ${key}`);
  for (const key of ruKeys) expect(enKeys.has(key), 'i18n', `en missing key ${key}`);

  const htmlFiles = walk(root, file => file.endsWith('.html'));
  const jsFiles = walk(path.join(root, 'assets'), file => file.endsWith('.js'));
  const used = new Set([
    ...collectHtmlI18nKeys(htmlFiles),
    ...collectJsLiteralI18nKeys(jsFiles),
    ...collectDataI18nKeys(),
  ]);

  for (const key of [...used].sort()) {
    for (const lang of langs) {
      expect(Object.hasOwn(i18n[lang], key), 'i18n', `${lang} missing used key ${key}`);
    }
  }
}

function validateLinks() {
  const files = walk(root, file => file.endsWith('.html'));
  const attrs = ['href', 'src'];

  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    for (const attr of attrs) {
      const re = new RegExp(`\\b${attr}="([^"]+)"`, 'g');
      for (const match of source.matchAll(re)) {
        const raw = match[1];
        if (!raw || raw.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(raw)) continue;
        const withoutHash = raw.split('#')[0];
        if (!withoutHash) continue;

        const target = withoutHash === '/'
          ? path.join(root, 'index.html')
          : withoutHash.startsWith('/')
            ? path.join(root, withoutHash.slice(1))
            : path.resolve(path.dirname(file), withoutHash);

        const finalTarget = existsSync(target) && statSync(target).isDirectory()
          ? path.join(target, 'index.html')
          : target;
        expect(existsSync(finalTarget), rel(file), `${attr}="${raw}" points to missing ${rel(finalTarget)}`);
      }
    }
  }
}

function parseToneAssignments(css) {
  const tones = new Map();
  for (const match of css.matchAll(/\[data-tone="([^"]+)"\]\s*\{\s*--tone:\s*([^;]+);/g)) {
    tones.set(match[1], match[2].trim());
  }
  return tones;
}

function validateTones() {
  const css = read('assets/styles.css');
  const tones = parseToneAssignments(css);
  const expected = {
    nom: 'var(--ink-soft)',
    gen: 'var(--tone-cyan)',
    dat: 'var(--tone-yellow)',
    aku: 'var(--tone-purple)',
    vok: 'var(--tone-red)',
    ins: 'var(--tone-orange)',
    lok: 'var(--tone-green)',
  };

  for (const [tone, value] of Object.entries(expected)) {
    expect(tones.get(tone) === value, 'tones', `${tone} must map to ${value}`);
  }

  const inflected = ['gen', 'dat', 'aku', 'vok', 'ins', 'lok'];
  const usedColors = new Map();
  for (const tone of inflected) {
    const color = tones.get(tone);
    if (!color) continue;
    expect(!usedColors.has(color), 'tones', `${tone} duplicates ${usedColors.get(color)} color ${color}`);
    usedColors.set(color, tone);
    expect(color !== 'var(--tone-blue)', 'tones', `${tone} collides with masculine blue`);
    expect(color !== 'var(--tone-magenta)', 'tones', `${tone} collides with feminine magenta`);
  }

  expect(css.includes('--gender-m:       var(--tone-blue);'), 'tones', 'masculine must use blue');
  expect(css.includes('--gender-f:       var(--tone-magenta);'), 'tones', 'feminine must use magenta');
  expect(css.includes('--gender-n:     var(--ink);'), 'tones', 'neuter must use ink');
  expect(/\[data-tone="im"\][\s\S]*\[data-tone="irr"\]\s*\{\s*--tone:\s*var\(--tone-orange\);/.test(css), 'tones', 'present verb family must share orange');
}

function convertSerbianHtml(value, convert) {
  return String(value)
    .split(/(<[^>]+>|&[^;\s]+;)/g)
    .map(part => part.startsWith('<') || part.startsWith('&') ? part : convert(part))
    .join('');
}

function validateSerbianLatin(value, scope) {
  const source = String(value).normalize('NFC');
  expect(convertSerbianHtml(source, scriptConverter.toLatin) === source, 'script', `${scope} must be Latin source`);

  const roundtrip = convertSerbianHtml(
    convertSerbianHtml(source, scriptConverter.toCyrillic),
    scriptConverter.toLatin
  );
  expect(roundtrip === source, 'script', `${scope} loses Latin/Cyrillic roundtrip`);
}

function validateScriptPair(lat, cyr, scope) {
  expect(scriptConverter.toCyrillic(lat) === cyr, 'script', `${scope} Latin to Cyrillic mismatch`);
  expect(scriptConverter.toLatin(cyr) === lat, 'script', `${scope} Cyrillic to Latin mismatch`);
}

function eachString(value, callback) {
  if (typeof value === 'string') callback(value);
  else if (Array.isArray(value)) value.forEach(item => eachString(item, callback));
  else if (isObject(value)) Object.values(value).forEach(item => eachString(item, callback));
}

function validateScriptConverter() {
  const pairs = [
    ['ljubav', 'љубав'],
    ['Ljubav', 'Љубав'],
    ['njiva', 'њива'],
    ['Njegoš', 'Његош'],
    ['džep', 'џеп'],
    ['Džep', 'Џеп'],
    ['ćuprija', 'ћуприја'],
    ['đak', 'ђак'],
  ];
  pairs.forEach(([lat, cyr]) => validateScriptPair(lat, cyr, `converter ${lat}`));

  ['gláva', 'nȅbo', 'sȑce', 'grȃdōvā', 'čokoláda'].forEach(sample => {
    expect(
      scriptConverter.toLatin(scriptConverter.toCyrillic(sample)) === sample,
      'script',
      `${sample} accent roundtrip failed`
    );
  });

  const html = '<mark>Živim</mark> u Beogradu.';
  expect(
    convertSerbianHtml(convertSerbianHtml(html, scriptConverter.toCyrillic), scriptConverter.toLatin) === html,
    'script',
    'HTML Serbian roundtrip failed'
  );
}

function validateSerbianContentScript() {
  const alphabet = data['assets/charts/alphabet-data.js'].ALPHABET;
  alphabet.forEach((row, index) => {
    validateScriptPair(row.lat, row.cyr, `alphabet[${index}].letter`);
    validateScriptPair(row.wLat, row.wCyr, `alphabet[${index}].word`);
  });

  const cases = data['assets/charts/cases-data.js'];
  cases.CASES.forEach((row, caseIndex) => {
    row.examples.forEach((example, exampleIndex) => {
      validateSerbianLatin(example.sr, `cases[${caseIndex}].examples[${exampleIndex}].sr`);
    });
    Object.values(row.notes || {}).forEach((note, noteIndex) => {
      note.pairs?.forEach((pair, pairIndex) => {
        eachString(pair, value => validateSerbianLatin(value, `cases[${caseIndex}].notes[${noteIndex}].pairs[${pairIndex}]`));
      });
    });
  });
  [...cases.IDECL.sg, ...cases.IDECL.pl].forEach((value, index) => validateSerbianLatin(value, `cases.IDECL[${index}]`));
  cases.WRINKLES.forEach((row, rowIndex) => {
    row.examples.forEach((example, exampleIndex) => {
      validateSerbianLatin(example.from, `wrinkles[${rowIndex}].examples[${exampleIndex}].from`);
      validateSerbianLatin(example.to, `wrinkles[${rowIndex}].examples[${exampleIndex}].to`);
    });
  });
  cases.CAST.forEach((row, rowIndex) => {
    validateSerbianLatin(row.word, `cast[${rowIndex}].word`);
    eachString(row.forms, value => validateSerbianLatin(value, `cast[${rowIndex}].forms`));
  });

  const numbers = data['assets/charts/numbers-data.js'];
  numbers.NUMBER_GROUPS.forEach((group, groupIndex) => {
    group.rows.forEach((row, rowIndex) => validateSerbianLatin(row.sr, `numberGroups[${groupIndex}].rows[${rowIndex}].sr`));
  });
  numbers.NUMBER_BUILDS.forEach((row, rowIndex) => eachString(row.parts, value => validateSerbianLatin(value, `numberBuilds[${rowIndex}].parts`)));
  numbers.NOUN_COUNTS.forEach((row, rowIndex) => eachString(row.examples, value => validateSerbianLatin(value, `nounCounts[${rowIndex}].examples`)));
  numbers.ORDINALS.forEach((row, rowIndex) => eachString(row.forms, value => validateSerbianLatin(value, `ordinals[${rowIndex}].forms`)));

  const prep = data['assets/charts/prepositions-data.js'];
  prep.PREP_GROUPS.forEach((group, groupIndex) => {
    group.rows.forEach((row, rowIndex) => {
      validateSerbianLatin(row.prep, `prepGroups[${groupIndex}].rows[${rowIndex}].prep`);
      row.uses.forEach((use, useIndex) => validateSerbianLatin(use.sr, `prepGroups[${groupIndex}].rows[${rowIndex}].uses[${useIndex}].sr`));
    });
  });

  const pronouns = data['assets/charts/pronouns-data.js'];
  pronouns.PERSONAL.forEach((row, rowIndex) => {
    ['subject', 'object', 'datloc', 'inst', 'poss'].forEach(field => validateSerbianLatin(row[field], `pronouns.personal[${rowIndex}].${field}`));
  });
  pronouns.POSSESSIVES.forEach((row, rowIndex) => eachString(row.forms, value => validateSerbianLatin(value, `pronouns.possessives[${rowIndex}].forms`)));
  pronouns.DEMOS.forEach((group, groupIndex) => group.rows.forEach((row, rowIndex) => eachString(row.forms, value => validateSerbianLatin(value, `pronouns.demos[${groupIndex}].rows[${rowIndex}].forms`))));
  pronouns.QUESTIONS.whose.forEach((row, rowIndex) => eachString(row.forms, value => validateSerbianLatin(value, `pronouns.questions.whose[${rowIndex}].forms`)));
  pronouns.QUESTIONS.whoWhat.forEach((row, rowIndex) => ['who', 'what'].forEach(field => validateSerbianLatin(row[field], `pronouns.questions.whoWhat[${rowIndex}].${field}`)));

  const verbs = data['assets/charts/verbs-data.js'];
  verbs.PRONOUNS.forEach((row, rowIndex) => validateSerbianLatin(row.label, `verbs.pronouns[${rowIndex}].label`));
  verbs.VERB_GROUPS.forEach((group, groupIndex) => {
    eachString(group.endings, value => validateSerbianLatin(value, `verbGroups[${groupIndex}].endings`));
    eachString(group.patterns, value => validateSerbianLatin(value, `verbGroups[${groupIndex}].patterns`));
    eachString(group.verbs, value => validateSerbianLatin(value, `verbGroups[${groupIndex}].verbs`));
    validateSerbianLatin(group.example.infinitive, `verbGroups[${groupIndex}].example.infinitive`);
    eachString(group.example.forms, value => validateSerbianLatin(value, `verbGroups[${groupIndex}].example.forms`));
  });
  verbs.IRREGULARS.forEach((row, rowIndex) => {
    ['title', 'forms', 'negative', 'full'].forEach(field => eachString(row[field], value => validateSerbianLatin(value, `irregulars[${rowIndex}].${field}`)));
  });
  [verbs.PAST, verbs.FUTURE].forEach((tense, tenseIndex) => {
    tense.formula.forEach((part, partIndex) => {
      if (part.sr) validateSerbianLatin(part.sr, `verbs.tense[${tenseIndex}].formula[${partIndex}].sr`);
    });
    tense.examples.forEach((example, exampleIndex) => validateSerbianLatin(example.sr, `verbs.tense[${tenseIndex}].examples[${exampleIndex}].sr`));
  });
  verbs.PAST.endings.forEach((row, rowIndex) => validateSerbianLatin(row.ending, `verbs.PAST.endings[${rowIndex}].ending`));
  ['merged', 'exceptions', 'reflexive'].forEach(field => eachString(verbs.FUTURE[field], value => validateSerbianLatin(value, `verbs.FUTURE.${field}`)));

  const aspect = data['assets/charts/aspect-data.js'];
  aspect.CONTRAST.forEach((row, rowIndex) => ['impEx', 'perfEx'].forEach(field => validateSerbianLatin(row[field].sr, `aspect.contrast[${rowIndex}].${field}.sr`)));
  aspect.TIME_ROWS.forEach((row, rowIndex) => ['imp', 'perf'].forEach(field => validateSerbianLatin(row[field].sr, `aspect.time[${rowIndex}].${field}.sr`)));
  aspect.PATTERNS.forEach((row, rowIndex) => ['imp', 'perf'].forEach(field => validateSerbianLatin(row[field], `aspect.patterns[${rowIndex}].${field}`)));
  aspect.PREFIXES.forEach((row, rowIndex) => {
    validateSerbianLatin(row.prefix, `aspect.prefixes[${rowIndex}].prefix`);
    eachString(row.pairs, value => validateSerbianLatin(value, `aspect.prefixes[${rowIndex}].pairs`));
  });
  aspect.COMMON_PAIRS.forEach((row, rowIndex) => {
    ['imp', 'perf'].forEach(field => validateSerbianLatin(row[field], `aspect.commonPairs[${rowIndex}].${field}`));
    validateSerbianLatin(row.ex.sr, `aspect.commonPairs[${rowIndex}].ex.sr`);
  });

  const pitch = data['assets/charts/pitch-stress-data.js'];
  pitch.PITCH_ACCENTS.forEach((row, rowIndex) => row.examples.forEach((example, exampleIndex) => validateSerbianLatin(example.sr, `pitch.accents[${rowIndex}].examples[${exampleIndex}].sr`)));
  pitch.PITCH_RULES.forEach((row, rowIndex) => eachString(row.examples, value => validateSerbianLatin(value, `pitch.rules[${rowIndex}].examples`)));
  pitch.PITCH_LENGTH_ROWS.forEach((row, rowIndex) => row.examples.forEach((example, exampleIndex) => validateSerbianLatin(example.sr, `pitch.lengthRows[${rowIndex}].examples[${exampleIndex}].sr`)));
  pitch.PITCH_PARADIGMS.forEach((row, rowIndex) => {
    validateSerbianLatin(row.word.sr, `pitch.paradigms[${rowIndex}].word.sr`);
    row.cells.forEach((cell, cellIndex) => validateSerbianLatin(cell.sr, `pitch.paradigms[${rowIndex}].cells[${cellIndex}].sr`));
  });

  const falseFriends = data['assets/charts/false-friends-data.js'];
  falseFriends.FALSE_FRIEND_GROUPS.forEach((group, groupIndex) => {
    group.rows.forEach((row, rowIndex) => {
      validateSerbianLatin(row.sr, `falseFriends[${groupIndex}].rows[${rowIndex}].sr`);
      validateSerbianLatin(row.ex.sr, `falseFriends[${groupIndex}].rows[${rowIndex}].ex.sr`);
    });
  });
}

function validateAlphabet() {
  const { ALPHABET } = data['assets/charts/alphabet-data.js'];
  expectArray(ALPHABET, 'alphabet', 'ALPHABET');
  expect(ALPHABET.length === 30, 'alphabet', 'ALPHABET must contain 30 letters');
  ALPHABET.forEach((row, index) => {
    const scope = `alphabet[${index}]`;
    expect(row.n === index + 1, scope, `n must be ${index + 1}`);
    ['cyr', 'lat', 'ipa', 'wCyr', 'wLat', 'kind'].forEach(field => expectString(row[field], scope, field));
    expect(['unique', 'shared', 'diff'].includes(row.kind), scope, 'kind must be unique/shared/diff');
    if (row.tip) expectTranslation(row.tip, scope, 'tip');
  });
}

function validateCases() {
  const { CASES, IDECL, WRINKLES, CAST, ENDING_AXES } = data['assets/charts/cases-data.js'];
  const caseAbbrs = ['NOM', 'GEN', 'DAT', 'AKU', 'VOK', 'INS', 'LOK'];
  const genders = ['m', 'f', 'n'];
  const numbers = ['sg', 'pl'];

  expectArray(CASES, 'cases', 'CASES');
  expect(CASES.length === 7, 'cases', 'CASES must contain seven cases');
  CASES.forEach((row, index) => {
    const scope = `cases[${index}]`;
    expectString(row.key, scope, 'key');
    expect(row.abbr === caseAbbrs[index], scope, `abbr must be ${caseAbbrs[index]}`);
    expectString(row.tone, scope, 'tone');
    expectString(row.sigEnding, scope, 'sigEnding');
    for (const gender of genders) {
      expect(isObject(row.endings?.[gender]), scope, `endings.${gender} required`);
      for (const number of numbers) expect(row.endings?.[gender]?.[number] !== undefined, scope, `endings.${gender}.${number} required`);
    }
    expectArray(row.examples, scope, 'examples');
    row.examples.forEach((example, exIndex) => {
      ['sr', 'en', 'ru'].forEach(field => expectString(example[field], `${scope}.examples[${exIndex}]`, field));
    });
    expect(Array.isArray(row.preps), scope, 'preps must be array');
  });

  expectArray(WRINKLES, 'cases', 'WRINKLES');
  WRINKLES.forEach((row, index) => {
    const scope = `wrinkles[${index}]`;
    expectString(row.key, scope, 'key');
    expectArray(row.examples, scope, 'examples');
  });

  expectArray(CAST, 'cases', 'CAST');
  expectArray(ENDING_AXES, 'cases', 'ENDING_AXES');
  expectArray(IDECL.cases, 'cases', 'IDECL.cases');
  expectArray(IDECL.sg, 'cases', 'IDECL.sg');
  expectArray(IDECL.pl, 'cases', 'IDECL.pl');
  expect(IDECL.cases.length === 7 && IDECL.sg.length === 7 && IDECL.pl.length === 7, 'cases', 'IDECL rows must align to seven cases');
}

function validateNumbers() {
  const { NUMBER_GROUPS, NUMBER_BUILDS, NOUN_COUNTS, ORDINALS } = data['assets/charts/numbers-data.js'];
  expectArray(NUMBER_GROUPS, 'numbers', 'NUMBER_GROUPS');
  NUMBER_GROUPS.forEach((group, index) => {
    const scope = `numberGroups[${index}]`;
    expectString(group.key, scope, 'key');
    expectString(group.tone, scope, 'tone');
    expectArray(group.rows, scope, 'rows');
    group.rows.forEach((row, rowIndex) => {
      expectString(row.n, `${scope}.rows[${rowIndex}]`, 'n');
      expectString(row.sr, `${scope}.rows[${rowIndex}]`, 'sr');
    });
  });
  NUMBER_BUILDS.forEach((row, index) => {
    const scope = `numberBuilds[${index}]`;
    expectString(row.n, scope, 'n');
    expectArray(row.parts, scope, 'parts');
    expectString(row.en, scope, 'en');
    expectString(row.ru, scope, 'ru');
  });
  NOUN_COUNTS.forEach((row, index) => {
    const scope = `nounCounts[${index}]`;
    expectString(row.n, scope, 'n');
    expectTranslation(row.pattern, scope, 'pattern');
    expectArray(row.examples, scope, 'examples');
  });
  ORDINALS.forEach((row, index) => {
    const scope = `ordinals[${index}]`;
    expectString(row.n, scope, 'n');
    expect(Array.isArray(row.forms) && row.forms.length === 3, scope, 'forms must have m/f/n entries');
  });
}

function validatePrepositions() {
  const { CASE_KEYS, PREP_GROUPS } = data['assets/charts/prepositions-data.js'];
  for (const key of ['gen', 'dat', 'aku', 'ins', 'lok']) expectString(CASE_KEYS[key], 'prepositions.CASE_KEYS', key);
  PREP_GROUPS.forEach((group, groupIndex) => {
    const scope = `prepGroups[${groupIndex}]`;
    expectString(group.key, scope, 'key');
    expectArray(group.rows, scope, 'rows');
    group.rows.forEach((row, rowIndex) => {
      const rowScope = `${scope}.rows[${rowIndex}]`;
      expectString(row.prep, rowScope, 'prep');
      expectString(row.icon, rowScope, 'icon');
      expectString(row.tone, rowScope, 'tone');
      expectArray(row.uses, rowScope, 'uses');
      row.uses.forEach((use, useIndex) => {
        const useScope = `${rowScope}.uses[${useIndex}]`;
        expect(Object.hasOwn(CASE_KEYS, use.case), useScope, `unknown case ${use.case}`);
        expectTranslation(use.meaning, useScope, 'meaning');
        expectString(use.sr, useScope, 'sr');
        expectTranslation(use.tr, useScope, 'tr');
      });
    });
  });
}

function validateAspect() {
  const { CONTRAST, TIME_ROWS, PATTERNS, PREFIXES, COMMON_PAIRS, TRAPS } = data['assets/charts/aspect-data.js'];
  CONTRAST.forEach((row, index) => {
    const scope = `aspect.contrast[${index}]`;
    ['key', 'imp', 'perf'].forEach(field => expectLocalized(row[field], scope, field));
    ['impEx', 'perfEx'].forEach(field => {
      expectString(row[field]?.sr, scope, `${field}.sr`);
      expectString(row[field]?.en, scope, `${field}.en`);
      expectString(row[field]?.ru, scope, `${field}.ru`);
    });
  });
  TIME_ROWS.forEach((row, index) => {
    const scope = `aspect.time[${index}]`;
    expectLocalized(row.tense, scope, 'tense');
    ['imp', 'perf'].forEach(field => {
      expectString(row[field]?.sr, scope, `${field}.sr`);
      expectString(row[field]?.en, scope, `${field}.en`);
      expectString(row[field]?.ru, scope, `${field}.ru`);
    });
  });
  PATTERNS.forEach((row, index) => {
    const scope = `aspect.patterns[${index}]`;
    expectLocalized(row.pattern, scope, 'pattern');
    ['imp', 'perf'].forEach(field => expectString(row[field], scope, field));
    expectLocalized(row.signal, scope, 'signal');
  });
  PREFIXES.forEach((row, index) => {
    const scope = `aspect.prefixes[${index}]`;
    ['prefix', 'tone'].forEach(field => expectString(row[field], scope, field));
    expectLocalized(row.feel, scope, 'feel');
    expectArray(row.pairs, scope, 'pairs');
    if (row.note) {
      expectLocalized(row.note.title, scope, 'note.title');
      expectLocalized(row.note.body, scope, 'note.body');
    }
  });
  COMMON_PAIRS.forEach((row, index) => {
    const scope = `aspect.commonPairs[${index}]`;
    expectLocalized(row.meaning, scope, 'meaning');
    ['imp', 'perf'].forEach(field => expectString(row[field], scope, field));
    expectString(row.ex?.sr, scope, 'ex.sr');
    expectString(row.ex?.en, scope, 'ex.en');
    expectString(row.ex?.ru, scope, 'ex.ru');
  });
  TRAPS.forEach((row, index) => {
    expectLocalized(row.trap, `aspect.traps[${index}]`, 'trap');
    expectLocalized(row.why, `aspect.traps[${index}]`, 'why');
  });
}

function validatePitch() {
  const chart = data['assets/charts/pitch-stress-data.js'];
  chart.PITCH_ACCENTS.forEach((row, index) => {
    const scope = `pitch.accents[${index}]`;
    ['key', 'mark', 'pattern'].forEach(field => expectString(row[field], scope, field));
    expectLocalized(row.length, scope, 'length');
    expectLocalized(row.contour, scope, 'contour');
    expectArray(row.examples, scope, 'examples');
    row.examples.forEach((example, exIndex) => {
      expectString(example.sr, `${scope}.examples[${exIndex}]`, 'sr');
      if (example.tr) expectTranslation(example.tr, `${scope}.examples[${exIndex}]`);
    });
  });
  for (const [name, rows] of Object.entries(chart).filter(([name, value]) => name !== 'PITCH_NOTES' && Array.isArray(value))) {
    expectArray(rows, `pitch.${name}`, name);
  }
  for (const [key, note] of Object.entries(chart.PITCH_NOTES)) {
    expectLocalized(note.title, `pitch.notes.${key}`, 'title');
    expectLocalized(note.body, `pitch.notes.${key}`, 'body');
  }
}

function validatePronouns() {
  const { PERSONAL, POSSESSIVES, DEMOS, QUESTIONS } = data['assets/charts/pronouns-data.js'];
  PERSONAL.forEach((row, index) => {
    const scope = `pronouns.personal[${index}]`;
    ['band', 'label', 'subject', 'object', 'datloc', 'inst', 'poss'].forEach(field => expectString(row[field], scope, field));
  });
  POSSESSIVES.forEach((row, index) => {
    const scope = `pronouns.possessives[${index}]`;
    expectString(row.owner, scope, 'owner');
    expect(Array.isArray(row.forms) && row.forms.length === 3, scope, 'forms must have m/n/f entries');
  });
  DEMOS.forEach((group, index) => {
    const scope = `pronouns.demos[${index}]`;
    expectString(group.title, scope, 'title');
    expectArray(group.rows, scope, 'rows');
  });
  expectArray(QUESTIONS.whose, 'pronouns.questions', 'whose');
  expectArray(QUESTIONS.whoWhat, 'pronouns.questions', 'whoWhat');
}

function validateVerbs() {
  const { PRONOUNS, VERB_GROUPS, IRREGULARS, PAST, FUTURE } = data['assets/charts/verbs-data.js'];
  expectArray(PRONOUNS, 'verbs', 'PRONOUNS');
  VERB_GROUPS.forEach((group, index) => {
    const scope = `verbGroups[${index}]`;
    ['key', 'tone', 'title'].forEach(field => expectString(group[field], scope, field));
    expect(isObject(group.endings), scope, 'endings must be object');
    PRONOUNS.forEach(pronoun => expectString(group.endings[pronoun.key], scope, `endings.${pronoun.key}`));
    expectArray(group.patterns, scope, 'patterns');
    expectArray(group.verbs, scope, 'verbs');
    expectString(group.example?.infinitive, scope, 'example.infinitive');
  });
  IRREGULARS.forEach((row, index) => {
    const scope = `irregulars[${index}]`;
    expectString(row.title, scope, 'title');
    expectArray(row.forms, scope, 'forms');
    expect(Array.isArray(row.negative), scope, 'negative must be array');
  });
  expectArray(PAST.formula, 'verbs.PAST', 'formula');
  expectArray(PAST.examples, 'verbs.PAST', 'examples');
  expectArray(PAST.endings, 'verbs.PAST', 'endings');
  expectArray(FUTURE.formula, 'verbs.FUTURE', 'formula');
  expectArray(FUTURE.examples, 'verbs.FUTURE', 'examples');
}

function validateFalseFriends() {
  const { FALSE_FRIEND_GROUPS } = data['assets/charts/false-friends-data.js'];
  FALSE_FRIEND_GROUPS.forEach((group, groupIndex) => {
    const scope = `falseFriends[${groupIndex}]`;
    expectString(group.key, scope, 'key');
    expectArray(group.rows, scope, 'rows');
    group.rows.forEach((row, rowIndex) => {
      const rowScope = `${scope}.rows[${rowIndex}]`;
      ['sr', 'means', 'trap', 'trapMeans'].forEach(field => expectString(row[field], rowScope, field));
      expectString(row.ex?.sr, rowScope, 'ex.sr');
      expectString(row.ex?.ru, rowScope, 'ex.ru');
    });
  });
}

const VALID_POS = new Set(['verb', 'noun', 'adj', 'adv', 'prep', 'pron', 'num']);
const VALID_LEVELS = new Set(['A0', 'A1', 'A2', 'B1', 'B2']);
const VALID_ASPECTS = new Set(['ipf', 'pf']);
const VALID_GENDERS = new Set(['m', 'f', 'n']);
const VALID_CASES = new Set(['nom', 'gen', 'dat', 'aku', 'vok', 'ins', 'lok']);

function stripDiacriticsKey(text) {
  const map = { 'š':'s', 'č':'c', 'ć':'c', 'ž':'z', 'đ':'dj', 'Š':'S', 'Č':'C', 'Ć':'C', 'Ž':'Z', 'Đ':'Dj' };
  return String(text).split('').map(ch => map[ch] || ch).join('');
}

function validateGlossaryEntries() {
  expect(isObject(glossary), 'glossary', 'window.GLOSSARY must be object');
  if (!isObject(glossary)) return;

  const slugs = new Map();

  for (const [key, entry] of Object.entries(glossary)) {
    const scope = `glossary[${key}]`;
    expect(isObject(entry), scope, 'entry must be object');
    if (!isObject(entry)) continue;

    expect(VALID_POS.has(entry.pos), scope, `pos must be one of ${[...VALID_POS].join('|')} (got ${entry.pos})`);
    expectLocalized(entry.gloss, scope, 'gloss');

    if (entry.level !== undefined) {
      expect(VALID_LEVELS.has(entry.level), scope, `level must be one of ${[...VALID_LEVELS].join('|')}`);
    }
    if (entry.tags !== undefined) {
      expect(Array.isArray(entry.tags), scope, 'tags must be array');
    }
    if (entry.related !== undefined) {
      expect(Array.isArray(entry.related), scope, 'related must be array');
      if (Array.isArray(entry.related)) {
        for (const ref of entry.related) {
          expect(Object.hasOwn(glossary, ref), scope, `related "${ref}" missing from glossary`);
        }
      }
    }

    if (entry.pos === 'verb') {
      expect(VALID_ASPECTS.has(entry.aspect), scope, `verb aspect must be ipf|pf (got ${entry.aspect})`);
      if (entry.government !== undefined) {
        expect(typeof entry.government === 'string' || Array.isArray(entry.government), scope, 'government must be string or array');
      }
    }
    if (entry.pos === 'noun') {
      expect(VALID_GENDERS.has(entry.gender), scope, `noun gender must be m|f|n (got ${entry.gender})`);
    }
    if (entry.pos === 'prep') {
      const gov = entry.government;
      expect(typeof gov === 'string' || Array.isArray(gov), scope, 'prep government required');
      const list = Array.isArray(gov) ? gov : (gov ? [gov] : []);
      list.forEach(c => expect(VALID_CASES.has(c), scope, `prep government case "${c}" invalid`));
    }

    const roundtrip = scriptConverter.toLatin(scriptConverter.toCyrillic(key));
    expect(roundtrip === key, scope, `key fails Latin↔Cyrillic roundtrip (got "${roundtrip}")`);

    const slug = entry.slug || stripDiacriticsKey(key);
    if (slugs.has(slug)) {
      fail(scope, `slug "${slug}" collides with ${slugs.get(slug)}`);
    } else {
      slugs.set(slug, key);
    }
  }
}

function chartLemmas() {
  const out = [];
  const add = (lemma, where) => out.push({ lemma, where });

  const verbs = data['assets/charts/verbs-data.js'];
  verbs.VERB_GROUPS.forEach((group, gi) => {
    group.verbs.forEach((v, i) => add(v, `verbGroups[${gi}].verbs[${i}]`));
    add(group.example.infinitive, `verbGroups[${gi}].example.infinitive`);
  });
  verbs.IRREGULARS.forEach((row, i) => add(row.title, `irregulars[${i}].title`));

  const aspect = data['assets/charts/aspect-data.js'];
  aspect.PATTERNS.forEach((row, i) => {
    add(row.imp, `aspect.patterns[${i}].imp`);
    add(row.perf, `aspect.patterns[${i}].perf`);
  });
  aspect.COMMON_PAIRS.forEach((row, i) => {
    add(row.imp, `aspect.commonPairs[${i}].imp`);
    add(row.perf, `aspect.commonPairs[${i}].perf`);
  });

  const prep = data['assets/charts/prepositions-data.js'];
  prep.PREP_GROUPS.forEach((group, gi) => {
    group.rows.forEach((row, ri) => {
      row.prep.split('/').forEach((piece, pi) => add(piece.trim(), `prepGroups[${gi}].rows[${ri}].prep[${pi}]`));
    });
  });

  const falseFriends = data['assets/charts/false-friends-data.js'];
  falseFriends.FALSE_FRIEND_GROUPS.forEach((group, gi) => {
    group.rows.forEach((row, ri) => add(row.sr, `falseFriends[${gi}].rows[${ri}].sr`));
  });

  const alphabet = data['assets/charts/alphabet-data.js'].ALPHABET;
  alphabet.forEach((row, i) => add(row.wLat, `alphabet[${i}].wLat`));

  return out;
}

function validateChartLemmaCoverage() {
  if (!isObject(glossary)) return;
  for (const { lemma, where } of chartLemmas()) {
    expect(Object.hasOwn(glossary, lemma), 'glossary', `${where} lemma "${lemma}" missing from glossary`);
  }
}

function validateDataShapes() {
  validateAlphabet();
  validateCases();
  validateNumbers();
  validatePrepositions();
  validateAspect();
  validatePitch();
  validatePronouns();
  validateVerbs();
  validateFalseFriends();
}

validateI18n();
validateLinks();
validateTones();
validateScriptConverter();
validateSerbianContentScript();
validateDataShapes();
validateGlossaryEntries();
validateChartLemmaCoverage();

if (errors.length) {
  console.error(`Validation failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Validation passed');
