/* Serbian Latin <-> Cyrillic. Shared by the build (which bakes both variants
   into the markup) and the validator. After phase 4 the client never runs it. */

const LAT_TO_CYR: Record<string, string> = {
  "a": "а",
  "b": "б",
  "c": "ц",
  "č": "ч",
  "ć": "ћ",
  "d": "д",
  "đ": "ђ",
  "e": "е",
  "f": "ф",
  "g": "г",
  "h": "х",
  "i": "и",
  "j": "ј",
  "k": "к",
  "l": "л",
  "m": "м",
  "n": "н",
  "o": "о",
  "p": "п",
  "r": "р",
  "s": "с",
  "š": "ш",
  "t": "т",
  "u": "у",
  "v": "в",
  "z": "з",
  "ž": "ж",
  "A": "А",
  "B": "Б",
  "C": "Ц",
  "Č": "Ч",
  "Ć": "Ћ",
  "D": "Д",
  "Đ": "Ђ",
  "E": "Е",
  "F": "Ф",
  "G": "Г",
  "H": "Х",
  "I": "И",
  "J": "Ј",
  "K": "К",
  "L": "Л",
  "M": "М",
  "N": "Н",
  "O": "О",
  "P": "П",
  "R": "Р",
  "S": "С",
  "Š": "Ш",
  "T": "Т",
  "U": "У",
  "V": "В",
  "Z": "З",
  "Ž": "Ж",
};

/* Pitch marks. Only the Cyrillic font subsets carry U+030F / U+0311, so a Latin
   specimen wearing them falls back to a system face — see the @font-face
   unicode-ranges in styles.css. */
const ACCENT_TO_CYR: Record<string, string> = {
  "à": "а̀",
  "á": "а́",
  "ā": "а̄",
  "ȁ": "а̏",
  "ȃ": "а̑",
  "è": "ѐ",
  "é": "е́",
  "ē": "е̄",
  "ȅ": "е̏",
  "ȇ": "е̑",
  "ì": "ѝ",
  "í": "и́",
  "ī": "ӣ",
  "ȉ": "и̏",
  "ȋ": "и̑",
  "ò": "о̀",
  "ó": "о́",
  "ō": "о̄",
  "ȍ": "о̏",
  "ȏ": "о̑",
  "ù": "у̀",
  "ú": "у́",
  "ū": "ӯ",
  "ȕ": "у̏",
  "ȗ": "у̑",
  "ŕ": "р́",
  "ȑ": "р̏",
  "ȓ": "р̑",
  "À": "А̀",
  "Á": "А́",
  "Ā": "А̄",
  "Ȁ": "А̏",
  "Ȃ": "А̑",
  "È": "Ѐ",
  "É": "Е́",
  "Ē": "Е̄",
  "Ȅ": "Е̏",
  "Ȇ": "Е̑",
  "Ì": "Ѝ",
  "Í": "И́",
  "Ī": "Ӣ",
  "Ȉ": "И̏",
  "Ȋ": "И̑",
  "Ò": "О̀",
  "Ó": "О́",
  "Ō": "О̄",
  "Ȍ": "О̏",
  "Ȏ": "О̑",
  "Ù": "У̀",
  "Ú": "У́",
  "Ū": "Ӯ",
  "Ȕ": "У̏",
  "Ȗ": "У̑",
  "Ŕ": "Р́",
  "Ȑ": "Р̏",
  "Ȓ": "Р̑",
};

const CYR_TO_LAT: Record<string, string> = {
  ...Object.fromEntries(Object.entries(LAT_TO_CYR).map(([lat, cyr]) => [cyr, lat])),
  "\u0459": "lj", "\u045a": "nj", "\u045f": "dz\u030c",
  "\u0409": "Lj", "\u040a": "Nj", "\u040f": "Dz\u030c",
};

/* Latin digraphs that straddle a morpheme boundary stay TWO Cyrillic letters:
   nadziveti -> two letters, injekcija -> two letters, konjugacija -> two
   letters. Blind dz|lj|nj mapping corrupts them permanently after one toggle.
   The patterns are deliberately narrow: odzacar, konj and inje are genuine
   digraphs and must not match. */
const BOUNDARY_DIGRAPHS = /(nad\u017e|pod\u017e|injek|injic|konjug|konjunk|konjekt|vanjez|tanjug|anjon)/gi;

const DIGRAPHS = /d\u017e|D\u017e|D\u017d|lj|Lj|LJ|nj|Nj|NJ/g;
const ACCENTS = /[\u00e0\u00e1\u0101\u0201\u0203\u00e8\u00e9\u0113\u0205\u0207\u00ec\u00ed\u012b\u0209\u020b\u00f2\u00f3\u014d\u020d\u020f\u00f9\u00fa\u016b\u0215\u0217\u0155\u0211\u0213\u00c0\u00c1\u0100\u0200\u0202\u00c8\u00c9\u0112\u0204\u0206\u00cc\u00cd\u012a\u0208\u020a\u00d2\u00d3\u014c\u020c\u020e\u00d9\u00da\u016a\u0214\u0216\u0154\u0210\u0212]/g;
const LETTERS = /[A-Za-z\u010c\u0106\u0110\u0160\u017d\u010d\u0107\u0111\u0161\u017e]/g;

function cyrDigraph(match: string): string {
  const lower = match.toLowerCase();
  const cyr = lower === "lj" ? "\u0459" : lower === "nj" ? "\u045a" : "\u045f";
  return match[0]! === match[0]!.toUpperCase() ? cyr.toUpperCase() : cyr;
}

function mapLetters(text: string): string {
  return text
    .replace(ACCENTS, ch => ACCENT_TO_CYR[ch] || ch)
    .replace(LETTERS, ch => LAT_TO_CYR[ch] || ch);
}

/* Split on the exception patterns (the capture group keeps the matches in the
   array) and run the digraph pass on everything except them. */
export function toCyrillic(text: string): string {
  return String(text).normalize("NFC")
    .split(BOUNDARY_DIGRAPHS)
    .map((part, i) => (i % 2 === 1 ? mapLetters(part) : mapLetters(part.replace(DIGRAPHS, cyrDigraph))))
    .join("");
}

export function toLatin(text: string): string {
  return String(text)
    .replace(/[\u0410-\u0428\u0402\u0408\u0409\u040a\u040b\u040f\u0430-\u0448\u0452\u0458\u0459\u045a\u045b\u045f]/g,
      ch => CYR_TO_LAT[ch] || ch)
    .normalize("NFC");
}

const DIACRITIC_TO_PLAIN: Record<string, string> = {
  "\u0161": "s", "\u010d": "c", "\u0107": "c", "\u017e": "z", "\u0111": "dj",
  "\u0160": "S", "\u010c": "C", "\u0106": "C", "\u017d": "Z", "\u0110": "Dj",
};

export function stripDiacritics(text: string): string {
  return String(text).split("").map(ch => DIACRITIC_TO_PLAIN[ch] || ch).join("");
}

/* Case- and diacritic-insensitive key for lemma lookup. */
export function fold(text: string): string {
  return stripDiacritics(String(text).normalize("NFD").replace(/\p{M}+/gu, "")).toLowerCase();
}
