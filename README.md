# serbian.fyi

Charts and cheat sheets for learners of the Serbian language.

## What's in it

- **The two alphabets** — Cyrillic and Latin, side by side, with IPA and example words.
- **Numbers & counting** — cardinals, construction patterns, noun forms, and ordinals.
- **Seven cases** — endings, questions, prepositions, example sentences.
- **Verbs & conjugation** — present buckets, irregulars, past and future.
- **Verb aspect pairs** — imperfective/perfective pairs, time behavior, prefix patterns, and common pairs.
- **Pronouns & their forms** — personal forms, possessives, demonstratives, and question words.
- **Prepositions & cases** — visual references for place, motion, path, source, time, and case behavior.
- **Pitch & stress** — four accent marks, placement rules, vowel length, and common accent shifts.
- **False friends** — Serbian words that look or sound like Russian/English but mean something else.

## Features

- Bilingual — English at `/`, Russian at `/ru/`, each prerendered on its own
  URL. A first visit from a Russian browser is redirected once; a `/ru/` link
  you were sent is never bounced.
- Serbian script toggle — Latin and Cyrillic. Both alphabets ship in the
  markup and CSS picks one, so copy/paste and screen readers stay correct.
- Light and dark themes, auto-detected from system preferences.
- Mobile-first. One layout, scaled — no width breakpoints.

## Run locally

Requires [Bun](https://bun.sh).

```sh
bun install
bun run dev      # builds to dist/ and serves it on :3000, rebuilding on change
```

Other scripts:

```sh
bun run build      # static output to dist/
bun run validate   # build + content validation + tests + typecheck
```

## Deploying

Cloudflare Workers Static Assets, from a git-connected build:

- build command: `bun install && bun run validate && bun run build`
- output directory: `dist`

`bun.lock` must stay committed, or the build will not detect Bun.

## License

Dual-licensed:

- **Code** (HTML, CSS, JS) — [MIT](LICENSE)
- **Content** (charts, prose, translations) — [CC BY 4.0](LICENSE-CONTENT)

Use, share, and adapt freely, with attribution.
