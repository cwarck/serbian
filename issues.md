Issues, worst first

1. cases-data.js:45 — the genitive feminine plural is wrong, on the flagship chart.
f: { sg: '-e', pl: '-∅' }. Under this chart's own stem model (NOM f.sg = -a, so stem = žen-), -∅ yields žen. The form is žena, ending -a. Your own site contradicts you twice: numbers-data.js:90 ships šest žena, and cases-data.js:216 ships sestra → sestara in the "spacer -a in gen. pl." wrinkle — which only makes sense if the ending is -a. Nobody caught it because the GEN card has no feminine-plural example among its three sentences. Fix: pl: '-a', and add a fem. gen. pl. example so the grid is falsifiable by a reader.

2. Croatisms and non-words are being taught as Serbian.
- false-friends-data.js:69 — potres = землетрясение is Croatian. Serbian is zemljotres; potres in Serbian is concussion (potres mozga). "Bio je potres" is not what a Serb says. This is a false-friends chart teaching a false friend.
- aspect-data.js:83 — počekati isn't a word people use. The pair for čekati is sačekati (or pričekati, which is Croatian).
- cases-data.js:236 — uho in an otherwise strictly ekavian sheet (čovek, vreme, nedelja, leto). Serbian standard is uvo (gen. pl. still ušiju).
- pronouns-data.js:12 — reflexive dative clitic si. Croatian. In Serbian si is "ti si", and putting it in a pronoun table for beginners guarantees the exact confusion the chart exists to prevent. Delete it.
- alphabet-data.js:17 — европа / evropa lowercase. It's a proper noun: Evropa. Pick evo or ekran if you want lowercase.

3. The prepositions chart drills the marked variants and omits the common ones.
You ship nad/pod/pred/među + INS for static position (Lampa je nad stolom, prepositions-data.js:52) but not one of iznad / ispod / ispred / između — which is what natives actually say for static position. Podižem lampu nad sto is grammatical and nobody has ever said it. Compounding it: iza (behind, GEN) is filed under "fixed", four groups away from za + INS (behind), so the two "behind" prepositions never meet. Add the iz- series as the primary static forms and demote nad/pod/pred + INS to a secondary note.

4. false-friends-data.js:186 — struka / стук is not a false-friend pair, and the real ones are missing.
struka and стук neither look nor sound alike; the row is noise in a chart whose only value is "these look identical." Meanwhile absent: nedelja (Sunday, not week — the single most common trap for a Russian speaker, and it's already in your own data), skupo (expensive vs. скупо = stingy), ljubiti. Also verify brusnica (:123) — botanically that's брусника, i.e. not a false friend at all; you've flagged it as клюква. Cite a source or cut it.

5. verbs-data.js:41 — the -em group hides the only hard part, and one member of it breaks the rule.
The bucket is lagati, pisati, zvati, brati, prati, peći, reći with endings -em/-eš/-e/…/-u and a single worked example (lagati → lažem). A learner will produce *pisem, *zvem, *brem — because pisati→pišem, zvati→zovem, brati→berem, prati→perem are stem mutations you never show. Worse, peći is 3pl peku, not *peče, and reći is perfective, so its "present" isn't a present — which your own aspect chart spends a whole panel explaining. Either show the stem column or drop peći/reći from a present-tense bucket.

6. aspect-data.js:29 presents an ungrammatical form as a form.
The perfective-present cell reads Napišem. — a bare sentence with a full stop. That form cannot stand alone; that is the entire lesson of the row. Render it as Kad napišem… so the shape on screen matches the rule you're teaching. Same class of error as Kad pogledam, reći ću. (:21) — no object, stilted.

7. styles.css:1612 — the pronouns table horizontally scrolls at every viewport, forever.
.pron-table { min-width: 28rem } inside a body capped at --max-w: 28rem (minus .shell padding). On a 1440px monitor the user swipes a table sideways while two-thirds of the screen is empty desk. The "one layout, no width variants" rule is well-argued and mostly correct, but you've followed it off a cliff in the one place it costs the reader. Either narrow the table (drop the redundant nje/ju variants out of object — pronouns-data.js:6's 'nju / nje, je / ju' crams two cases and four forms into one unlabeled cell) or let the sheet widen for this one pane.

8. Chart pages have no <main>, no skip link, no chart-to-chart navigation, and no <noscript>.
Nine chart pages ship <section> only — zero <main> landmarks; index.html:41's id="content" is a skip-link target with no skip link. Every <h1> is sr-only, so the sheet has no visible title. There is no way to get from cases.html to verbs.html except via the wordmark → home → card, which for a cheat-sheet site people flip between is the primary interaction. And with JS off, every chart is a blank page between a nav and a footer, with no explanation. Add <main>, a real skip link, a prev/next or chart strip in the footer, and one <noscript> line.

9. charts/false-friends.html:12 — a content page that silently teleports you home.
if(document.documentElement.lang!=='ru')location.replace('/'). Someone shares the link with an English-preferring friend; the page vanishes with no message. Serve the page and show a one-line "this chart is written for Russian speakers — switch to RU" banner instead.

10. app.js:355–357 — the script converter's source of truth is lossy and re-derived on every language switch.
applyI18n overwrites data-sr-source from the current (possibly already-Cyrillic) innerHTML, then applyScript converts it back. That only survives because toCyrillic/toLatin happen to be near-inverses. They aren't total inverses: toCyrillic (app.js:94) blindly maps every dž|lj|nj to џ|љ|њ, so the day someone adds nadživeti, injekcija, or konjugacija, it renders наџивети and the error becomes permanent after one language toggle. Two fixes, both one-liners: capture data-sr-source once (if (!node.hasAttribute('data-sr-source'))), and add a digraph-exception set to toCyrillic.

---

Smaller, but fix before launch

- numbers-data.js:110 vs pronouns.js:78 — ordinals render columns M F N, every pronoun/demonstrative/possessive table renders M N F. Same site, opposite order, no header on the ordinals row to warn you.
- pronouns-data.js whoWhat order is NOM·AKU·GEN·DAT·INS; the cases chart is NOM·GEN·DAT·AKU·VOK·INS·LOK. Pick one.
- i18n.js RU: card.prepositions.note = Падежи — identical to card.cases.title. On the index a Russian reader sees "Падежи" twice. English says "Case locks". Use Управление падежом or similar.
- cases-data.js:75 Idem k moru — bookish. prepositions-data.js:110 gets it right with Idem ka gradu. Same site, same preposition, two different verdicts.
- cases-data.js:158 VOK f.sg -o is immediately contradicted by its own example Marija, gde si? with no footnote. Add the -ice/-a note or change the example.
- numbers-data.js uses 1.000 / 2.345 — Serbian separators in an EN/RU UI, where 1.000 reads as one point zero.
- Missing the #1 numeral error learners make: verb agreement (dva grada su vs. pet gradova je). Not on the chart.
- .chip (styles.css:365) lands around 31px tall. The comment says "over 24px" — that's WCAG 2.5.8 minimum, not a targetsis is "phone in hand". Go to 44px.
- .settings-btn (styles.css:1295) has no :focus-visible — it's the primary control and it's the only one missing the house ring. And that ring is 1px dashed (:378), which is weak against every background you have. 2px solid.
- Nav and footer are copy-pasted across ten HTML files and have already drifted — index.html:135 says Ilya Akimov, all imov. You have bun and a validator; generate the shell.
