"""Add Serbian pitch marks to a Source Serif 4 variable TTF.

usage: extend-source-serif.py <in.ttf> <out.ttf>

Source Serif 4 (4.004 and 4.005 alike) has no U+030F (double grave), no U+0311
(inverted breve) and none of the 24 precomposed letters U+0200-0217, so a
browser falls back to a system serif for every pitch-marked specimen. Nothing
here is drawn: every new glyph is assembled from outlines the font ships, so
the wght and opsz design space is inherited rather than re-mastered.

  uni030F      two grave components at +/-dx; dx tracks the grave's width per tuple.
  uni0311      the breve mirrored about its own vertical band, per tuple.
  .cap forms   the same, from the capital-height marks; they ride the existing
               ccmp chain that swaps marks after capitals, so А̏ gets a cap mark.
  U+0200-0217  the base letter's grave/breve composite with the mark swapped,
               component-offset gvar included.

Mark anchors, VariationIndex records included, are cloned from the grave and
breve. Marks stay advance 0 and GDEF class 3. mkmk is untouched: no specimen
stacks marks.
"""
import copy, sys
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables._g_l_y_f import Glyph, GlyphComponent
from fontTools.ttLib.tables.TupleVariation import TupleVariation
from fontTools.varLib.iup import iup_delta
from fontTools.ttLib.tables import otTables as ot

SRC, DST = sys.argv[1], sys.argv[2]
t = TTFont(SRC)
glyf, hmtx, gvar, gdef, gpos = t['glyf'], t['hmtx'], t['gvar'], t['GDEF'].table, t['GPOS'].table
hvar = t['HVAR'].table
order = list(t.getGlyphOrder())
cmap_tables = t['cmap'].tables
cmap = t.getBestCmap()
rev = {v: k for k, v in cmap.items()}

def add(name, glyph, adv, variations, unicode=None, gclass=1):
    order.append(name)
    glyf.glyphs[name] = glyph
    glyph.recalcBounds(glyf)
    hmtx.metrics[name] = (adv, getattr(glyph, 'xMin', 0))
    if variations:
        gvar.variations[name] = variations
    if unicode is not None:
        for st in cmap_tables:
            st.cmap[unicode] = name
    gdef.GlyphClassDef.classDefs[name] = gclass

def full_deltas(tv, coords, ends):
    """Resolve sparse (IUP) deltas on the ORIGINAL outline, phantom points included."""
    d = list(tv.coordinates)
    n = len(coords)
    if any(x is None for x in d):
        d = list(iup_delta(d, list(coords) + [(0, 0)] * 4, ends))
    return [(int(round(x)), int(round(y))) for x, y in d]

# ---- uni0311 / uni0311.cap : mirrored breve ---------------------------------
def inverted_breve(src_name, dst_name):
    g = copy.deepcopy(glyf[src_name])
    coords, ends, flags = g.getCoordinates(glyf)
    coords = list(coords)
    ys = [y for _, y in coords]
    ymin, ymax = min(ys), max(ys); i_min, i_max = ys.index(ymin), ys.index(ymax)
    c2 = ymin + ymax
    new_coords = [(x, c2 - y) for x, y in coords]
    # reverse each contour so winding stays outward after the mirror
    perm = []
    start = 0
    for e in ends:
        perm += list(range(e, start - 1, -1)) if start else list(range(e, -1, -1))
        start = e + 1
    g.coordinates = type(g.coordinates)([new_coords[i] for i in perm])
    g.flags = type(g.flags)([flags[i] for i in perm]) if hasattr(g.flags, '__iter__') else g.flags
    vars_ = []
    for tv in gvar.variations[src_name]:
        d = full_deltas(tv, coords, ends)
        n = len(coords)
        # band shift at the tuple peak, from bounds, so a tie between extremal points cannot bias it
        peak = [y + d[i][1] for i, (_, y) in enumerate(coords)]
        shift = (min(peak) - ymin) + (max(peak) - ymax)
        pts = [(d[i][0], -d[i][1] + shift) for i in perm]
        vars_.append(TupleVariation(tv.axes, pts + d[n:]))
    add(dst_name, g, 0, vars_, gclass=3)

# ---- uni030F / uni030F.cap : two graves --------------------------------------
def double_grave(src_name, dst_name, ratio=0.5):
    g0 = glyf[src_name]
    coords, ends, _ = g0.getCoordinates(glyf)
    xs = [x for x, _ in coords]
    w = max(xs) - min(xs); i_min, i_max = xs.index(min(xs)), xs.index(max(xs))
    dx = round(w * ratio)
    g = Glyph(); g.numberOfContours = -1; g.components = []
    for off in (-dx, dx):
        c = GlyphComponent(); c.glyphName = src_name; c.x, c.y = off, 0
        c.flags = 0x0004 | 0x0002  # ROUND_XY_TO_GRID | ARGS_ARE_XY_VALUES
        g.components.append(c)
    vars_ = []
    for tv in gvar.variations[src_name]:
        d = full_deltas(tv, coords, ends)
        dw = d[i_max][0] - d[i_min][0]
        h = round(dw * ratio)
        vars_.append(TupleVariation(tv.axes, [(-h, 0), (h, 0), (0, 0), (0, 0), (0, 0), (0, 0)]))
    add(dst_name, g, 0, vars_, gclass=3)

# Resolve source marks through cmap and composites: the Google Fonts build drops
# production names (uni0300.cap becomes glyphNNNNN), Adobe's keeps them.
GRAVE, BREVE = cmap[0x0300], cmap[0x0306]
GRAVE_CAP = glyf[cmap[0x00C0]].components[1].glyphName
BREVE_CAP = glyf[cmap[0x0102]].components[1].glyphName
inverted_breve(BREVE, 'uni0311'); inverted_breve(BREVE_CAP, 'uni0311.cap')
double_grave(GRAVE, 'uni030F'); double_grave(GRAVE_CAP, 'uni030F.cap')
for st in cmap_tables:
    st.cmap[0x030F] = 'uni030F'; st.cmap[0x0311] = 'uni0311'

# ---- GPOS mark anchors: clone the grave / breve records ----------------------
def subtables(lookup):
    for st in lookup.SubTable:
        yield st.ExtSubTable if lookup.LookupType == 9 else st
pairs = {GRAVE: 'uni030F', BREVE: 'uni0311', GRAVE_CAP: 'uni030F.cap', BREVE_CAP: 'uni0311.cap'}
for lk in gpos.LookupList.Lookup:
    if (lk.LookupType if lk.LookupType != 9 else lk.SubTable[0].ExtSubTable.LookupType) != 4:
        continue
    for st in subtables(lk):
        for src, dst in pairs.items():
            if src in st.MarkCoverage.glyphs:
                i = st.MarkCoverage.glyphs.index(src)
                st.MarkCoverage.glyphs.append(dst)
                st.MarkArray.MarkRecord.append(copy.deepcopy(st.MarkArray.MarkRecord[i]))
                st.MarkArray.MarkCount = len(st.MarkArray.MarkRecord)
        gid = {n: i for i, n in enumerate(order)}
        z = sorted(zip(st.MarkCoverage.glyphs, st.MarkArray.MarkRecord), key=lambda p: gid[p[0]])
        st.MarkCoverage.glyphs = [p[0] for p in z]; st.MarkArray.MarkRecord = [p[1] for p in z]
gsub = t['GSUB'].table
def sort_cov(cov):
    gid = {n: i for i, n in enumerate(order)}
    cov.glyphs.sort(key=gid.__getitem__)
caps = {GRAVE: ('uni030F', GRAVE_CAP, 'uni030F.cap'), BREVE: ('uni0311', BREVE_CAP, 'uni0311.cap')}
for lk in gsub.LookupList.Lookup:
    for st in subtables(lk):
        if hasattr(st, 'mapping'):
            for src, (new, src_cap, new_cap) in caps.items():
                if st.mapping.get(src) == src_cap:
                    st.mapping[new] = new_cap
        for attr in ('InputCoverage', 'BacktrackCoverage', 'LookAheadCoverage'):
            for cov in getattr(st, attr, None) or []:
                for src, (new, src_cap, new_cap) in caps.items():
                    if src in cov.glyphs and new not in cov.glyphs:
                        cov.glyphs.append(new); sort_cov(cov)
                    if src_cap in cov.glyphs and new_cap not in cov.glyphs:
                        cov.glyphs.append(new_cap); sort_cov(cov)
if gdef.MarkAttachClassDef:
    for src, dst in pairs.items():
        if src in gdef.MarkAttachClassDef.classDefs:
            gdef.MarkAttachClassDef.classDefs[dst] = gdef.MarkAttachClassDef.classDefs[src]

# ---- precomposed U+0200-0217 -------------------------------------------------
LOW = {'a': 0x201, 'e': 0x205, 'i': 0x209, 'o': 0x20D, 'r': 0x211, 'u': 0x215}   # double grave; +2 = inverted breve
UP = {'A': 0x200, 'E': 0x204, 'I': 0x208, 'O': 0x20C, 'R': 0x210, 'U': 0x214}
TEMPLATE_MARKS = {0x30F: [0x300, 0x301, 0x304, 0x302, 0x306], 0x311: [0x306, 0x302, 0x300, 0x301, 0x304]}
def template_for(base_char, mark_cp):
    import unicodedata
    for m in TEMPLATE_MARKS[mark_cp]:
        cp = unicodedata.normalize('NFC', base_char + chr(m))
        if len(cp) == 1 and ord(cp) in cmap:
            g = glyf[cmap[ord(cp)]]
            if g.isComposite() and len(g.components) == 2:
                return cmap[ord(cp)]
    raise SystemExit(f'no composite template for {base_char}')
def precomposed(base_char, unicode, mark, mark_cp):
    tpl = template_for(base_char, mark_cp)
    g = copy.deepcopy(glyf[tpl])
    g.components[1].glyphName = mark
    name = f'uni{unicode:04X}'
    add(name, g, hmtx.metrics[tpl][0], copy.deepcopy(gvar.variations.get(tpl)), unicode)
    if hvar.AdvWidthMap:
        hvar.AdvWidthMap.mapping[name] = hvar.AdvWidthMap.mapping[tpl]
for ch, cp in LOW.items():
    precomposed(ch, cp, 'uni030F', 0x30F); precomposed(ch, cp + 2, 'uni0311', 0x311)
for ch, cp in UP.items():
    precomposed(ch, cp, 'uni030F.cap', 0x30F); precomposed(ch, cp + 2, 'uni0311.cap', 0x311)
if hvar.AdvWidthMap:
    for m in ['uni030F', 'uni0311', 'uni030F.cap', 'uni0311.cap']:
        hvar.AdvWidthMap.mapping[m] = hvar.AdvWidthMap.mapping[GRAVE]

for rec in t['name'].names:
    if rec.nameID == 5:
        rec.string = rec.toUnicode() + ';serbian.fyi pitch marks'
t.setGlyphOrder(order); glyf.glyphOrder = order
t['maxp'].recalc(t) if hasattr(t['maxp'], 'recalc') else None
t.save(DST)
print('saved', DST, 'glyphs', len(order))
