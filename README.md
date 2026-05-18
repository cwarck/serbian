# Atlas Srpski

Charts and cheat sheets for learners of the Serbian language.

A static site. No build step, no PDFs, no screenshots — just HTML, CSS, and a sprinkle of JS.

## What's in it

- **The two alphabets** — Cyrillic and Latin, side by side, with IPA and example words.
- **Seven cases** — endings, questions, prepositions, example sentences.
- More on the way: verbs, pronouns, prepositions, numbers, aspect, pitch, false friends.

## Features

- Bilingual UI — English and Russian.
- Light and dark themes.
- Mobile-friendly.

## Run locally

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Structure

```
index.html        # landing page
charts/           # individual chart pages
assets/           # styles, i18n, app js
```

## License

Dual-licensed:

- **Code** (HTML, CSS, JS) — [MIT](LICENSE)
- **Content** (charts, prose, translations) — [CC BY 4.0](LICENSE-CONTENT)

Use, share, and adapt freely, with attribution.
