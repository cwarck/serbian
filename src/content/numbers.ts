import type { Cardinal, NounCount, NumberBuild, Ordinal } from '../lib/types.ts';

/* Cardinal examples, grouped into six range cards by the renderer. `end`
   marks the notable endings of dvesta/trista and hiljadu/hiljade. */
export const CARDINALS = [
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
  { n: '11', sr: 'jedanaest' },
  { n: '12', sr: 'dvanaest' },
  { n: '13', sr: 'trinaest' },
  { n: '14', sr: 'četrnaest' },
  { n: '15', sr: 'petnaest' },
  { n: '16', sr: 'šesnaest' },
  { n: '17', sr: 'sedamnaest' },
  { n: '18', sr: 'osamnaest' },
  { n: '19', sr: 'devetnaest' },

  { n: '20', sr: 'dvadeset' },
  { n: '21', sr: 'dvadeset jedan' },
  { n: '22', sr: 'dvadeset dva' },
  { n: '23', sr: 'dvadeset tri' },
  { n: '24', sr: 'dvadeset četiri' },
  { n: '25', sr: 'dvadeset pet' },
  { n: '26', sr: 'dvadeset šest' },
  { n: '27', sr: 'dvadeset sedam' },
  { n: '28', sr: 'dvadeset osam' },
  { n: '29', sr: 'dvadeset devet' },
  { n: '30', sr: 'trideset' },
  { n: '40', sr: 'četrdeset' },
  { n: '50', sr: 'pedeset' },
  { n: '60', sr: 'šezdeset' },
  { n: '70', sr: 'sedamdeset' },
  { n: '80', sr: 'osamdeset' },
  { n: '90', sr: 'devedeset' },

  { n: '100', sr: 'sto' },
  { n: '200', sr: 'dvest', end: 'a' },
  { n: '300', sr: 'trist', end: 'a' },
  { n: '400', sr: 'četiristo' },
  { n: '500', sr: 'petsto' },
  { n: '600', sr: 'šeststo' },
  { n: '700', sr: 'sedamsto' },
  { n: '800', sr: 'osamsto' },
  { n: '900', sr: 'devetsto' },

  { n: '1 000', sr: 'hiljad', end: 'u' },
  { n: '2 000', sr: 'dve hiljad', end: 'e' },
  { n: '3 000', sr: 'tri hiljad', end: 'e' },
  { n: '4 000', sr: 'četiri hiljad', end: 'e' },
  { n: '5 000', sr: 'pet hiljada' },
  { n: '6 000', sr: 'šest hiljada' },
  { n: '7 000', sr: 'sedam hiljada' },
  { n: '8 000', sr: 'osam hiljada' },
  { n: '9 000', sr: 'devet hiljada' },
] satisfies readonly Cardinal[];

/* Only the builds the cardinal cards do NOT already spell out. The 20-29 card
   prints `dvadeset jedan` in full, so a two-digit row here restates a card two
   screens up; hundreds and thousands are the first place the chain is longer
   than anything listed. */
export const NUMBER_BUILDS = [
  { n: '101', parts: ['sto', 'jedan'], en: 'one hundred one', ru: 'сто один' },
  { n: '125', parts: ['sto', 'dvadeset', 'pet'], en: 'one hundred twenty five', ru: 'сто двадцать пять' },
  { n: '2 345', parts: ['dve', 'hiljade', 'trista', 'četrdeset', 'pet'], en: 'two thousand three hundred forty five', ru: 'две тысячи триста сорок пять' },
] satisfies readonly NumberBuild[];

/* Three bands, one case axis — not seven rows on three different axes.

   The column this chart used to call "pattern" named three different things at
   once: what the NUMERAL does (1 "agrees with noun", 2 "gender split"), what
   the NOUN does (3-4 "counted form", 5+ "genitive plural"), and a pointer to
   another row (21/22-24/25+ "last word: N"). One axis now — the case and
   number the counted noun takes — and the compound triggers collapse into the
   band they always matched, so 21 sits beside 1 instead of pointing at it.
   That also turns a two-hop lookup into one.

   Naming the case rather than a form makes the whole chart one sentence: a
   number puts its noun in the GENITIVE, singular for 2-4 and plural for 5+.
   The 2-4 band was labelled "counted form" — the paucal, historically the
   dual. It is spelled exactly like the genitive singular for every noun on
   this sheet, and GEN sg is what a learner needs to look up; the distinction
   is a diachronic one and costs the band its place in the case axis.

   The numeral's own gender inflection needs no prose: jedan/jedno/jedna and
   dva/dve are visible in the examples. Which is why the 2-4 band is
   exemplified with dva and not tri — two is where the numeral splits. Inside a
   band the numeral is held constant so the noun ending is the only variable.

   The agreement sentences drop the noun the bands use for a verb that
   inflects in BOTH glosses. radi/rade mirrors работает/работают/работает
   down to the 5+ singular; the earlier ima/imaju had no natural Russian
   counterpart — «есть» is invariant, so all three glosses read alike and
   the one thing the section exists to show was visible in the Serbian
   only. English still cannot carry row 3 (five restaurants ARE open). */
export const NOUN_COUNTS = [
  {
    triggers: ['1', '21', '101'],
    case: 'nom', number: 'sg',
    examples: ['jedan grad', 'jedno selo', 'jedna žena'],
    agreement: { sr: 'Jedan restoran <mark>radi</mark>.', tr: { en: 'One restaurant is open.', ru: 'Один ресторан работает.' } },
  },
  {
    triggers: ['2-4', '22-24'],
    case: 'gen', number: 'sg',
    examples: ['dva grada', 'dva sela', 'dve žene'],
    agreement: { sr: 'Dva restorana <mark>rade</mark>.', tr: { en: 'Two restaurants are open.', ru: 'Два ресторана работают.' } },
  },
  {
    triggers: ['5+', '25+'],
    case: 'gen', number: 'pl',
    examples: ['pet gradova', 'pet sela', 'pet žena'],
    agreement: { sr: 'Pet restorana <mark>radi</mark>.', tr: { en: 'Five restaurants are open.', ru: 'Пять ресторанов работает.' } },
  },
] satisfies readonly NounCount[];

/* An ordinal is an adjective: one stem, three endings, every row. Printing 36
   cells to say that fills a matrix instead of showing a rule — so the pattern
   is stated once, as a run of ending units, and the list below carries the
   concrete words in their citation (M) form.

   The one thing the pattern cannot carry: treći is a soft stem, so its neuter
   takes -e. validate.mjs derives the pattern from ORDINALS and pins the
   exception list, so a second soft ordinal is a build error rather than a
   quietly wrong rule. */
export const ORDINAL_ENDINGS = ['-i', '-o', '-a'] satisfies readonly string[];

export const ORDINALS = [
  { n: '1.', forms: ['prvi', 'prvo', 'prva'] },
  { n: '2.', forms: ['drugi', 'drugo', 'druga'] },
  { n: '3.', forms: ['treći', 'treće', 'treća'] },
  { n: '4.', forms: ['četvrti', 'četvrto', 'četvrta'] },
  { n: '5.', forms: ['peti', 'peto', 'peta'] },
  { n: '6.', forms: ['šesti', 'šesto', 'šesta'] },
  { n: '7.', forms: ['sedmi', 'sedmo', 'sedma'] },
  { n: '8.', forms: ['osmi', 'osmo', 'osma'] },
  { n: '9.', forms: ['deveti', 'deveto', 'deveta'] },
  { n: '10.', forms: ['deseti', 'deseto', 'deseta'] },
  { n: '20.', forms: ['dvadeseti', 'dvadeseto', 'dvadeseta'] },
  { n: '21.', forms: ['dvadeset prvi', 'dvadeset prvo', 'dvadeset prva'] },
] satisfies readonly Ordinal[];
