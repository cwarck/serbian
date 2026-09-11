"""Verify the shipped Source Serif 4 subsets against the pitch table.

Reads a JSON spec on stdin: {"faces": [{"path", "range"}], "latin": [...], "cyr": [...]}
where each face is one @font-face block (its unicode-range is the eligibility
rule a browser applies) and the strings are what src/lib/script.ts can emit.
Prints one failure per line; exit 1 if any. Run through validate.mjs.

Per face: fvar must carry wght 200-900 and opsz 8-60 (the shipped Cyrillic cut
once lost opsz silently). Per string: every codepoint must live in ONE eligible
face — Chromium falls the whole cluster back when base and mark split — and
HarfBuzz must shape it there with no .notdef, every mark attached at a non-zero
offset, and a capital base taking a different (cap) mark glyph than its lowercase.
"""
import io, json, sys, unicodedata
from fontTools.ttLib import TTFont
import uharfbuzz as hb

spec = json.load(sys.stdin)
errors = []
AXES = {'wght': (200, 900), 'opsz': (8, 60)}
INSTANCES = [{'wght': 300, 'opsz': 8}, {'wght': 400, 'opsz': 20}, {'wght': 500, 'opsz': 60}]

def parse_range(text):
    out = set()
    for part in text.split(','):
        a, _, b = part.strip()[2:].partition('-')
        lo = int(a, 16); hi = int(b, 16) if b else lo
        out.update(range(lo, hi + 1))
    return out

faces = []
for f in spec['faces']:
    t = TTFont(f['path'])
    axes = {a.axisTag: (a.minValue, a.maxValue) for a in t['fvar'].axes} if 'fvar' in t else {}
    for tag, want in AXES.items():
        if axes.get(tag) != want:
            errors.append(f"{f['path']}: fvar {tag} is {axes.get(tag)}, want {want}")
    # HarfBuzz does not read WOFF2: hand it the decompressed sfnt.
    t.flavor = None; sfnt = io.BytesIO(); t.save(sfnt)
    faces.append({'path': f['path'], 'range': parse_range(f['range']), 'cmap': set(t.getBestCmap()), 'font': hb.Font(hb.Face(hb.Blob(sfnt.getvalue())))})

def eligible(text):
    cps = [ord(c) for c in text]
    return [f for f in faces if all(cp in f['range'] for cp in cps)]

def shape(font, text, inst):
    font.set_variations(inst)
    buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties(); buf.language = 'sr'
    hb.shape(font, buf)
    return list(zip((i.codepoint for i in buf.glyph_infos), buf.glyph_positions))

def check_string(text):
    hits = [f for f in eligible(text) if all(ord(c) in f['cmap'] for c in text)]
    if not hits:
        errors.append(f"{text!r}: no single face covers every codepoint (U+{' U+'.join(f'{ord(c):04X}' for c in text)})")
        return
    for f in hits:
        for inst in INSTANCES:
            glyphs = shape(f['font'], text, inst)
            if any(g == 0 for g, _ in glyphs):
                errors.append(f"{f['path']}: {text!r} shapes to .notdef at {inst}")
            for g, pos in glyphs[1:]:
                if pos.x_advance == 0 and pos.x_offset == 0 and pos.y_offset == 0:
                    errors.append(f"{f['path']}: {text!r} mark not attached at {inst}")
        # a capital base must swap in the cap mark; the lowercase cluster is the control
        lower = text[0].lower() + text[1:]
        if len(text) > 1 and lower != text:
            up = [g for g, p in shape(f['font'], text, INSTANCES[1])[1:] if p.x_advance == 0]
            lo = [g for g, p in shape(f['font'], lower, INSTANCES[1])[1:] if p.x_advance == 0]
            if up and up == lo:
                errors.append(f"{f['path']}: {text!r} uses the lowercase mark glyph on a capital")

for s in spec['latin'] + spec['cyr']:
    check_string(unicodedata.normalize('NFC', s))

for e in errors:
    print(e)
sys.exit(1 if errors else 0)
