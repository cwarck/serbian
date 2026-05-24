# Atlas Srpski

Charts and cheat sheets for learners of the Serbian language.

A static site. No build step, no PDFs, no screenshots — just HTML, CSS, and a sprinkle of JS.

## What's in it

- **The two alphabets** — Cyrillic and Latin, side by side, with IPA and example words.
- **Numbers & counting** — cardinals, construction patterns, noun forms, and ordinals.
- **Seven cases** — endings, questions, prepositions, example sentences.
- **Verbs & conjugation** — present buckets, irregulars, past and future.
- **Verb aspect pairs** — imperfective/perfective pairs, time behavior, prefix patterns, and common pairs.
- **Pronouns & their forms** — personal forms, possessives, demonstratives, and question words.
- **Prepositions & cases** — visual references for place, motion, path, source, time, and case behavior.
- **Pitch & stress** — four accent marks, placement rules, vowel length, and common accent shifts.
- More on the way: false friends.

## Features

- Bilingual UI — English and Russian.
- Serbian script toggle — Latin and Cyrillic.
- Light and dark themes.
- Mobile-friendly.

## Run locally

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Structure

```
index.html               # chart index
charts/alphabet.html     # alphabet chart
charts/numbers.html      # numbers and counting chart
charts/cases.html        # noun cases chart
charts/verbs.html        # conjugation chart
charts/aspect.html       # verb aspect pairs chart
charts/pronouns.html     # pronouns chart
charts/prepositions.html # prepositions chart
charts/pitch-stress.html # pitch and stress chart
assets/                  # styles, i18n, app js
```

## License

Dual-licensed:

- **Code** (HTML, CSS, JS) — [MIT](LICENSE)
- **Content** (charts, prose, translations) — [CC BY 4.0](LICENSE-CONTENT)

Use, share, and adapt freely, with attribution.
