import { expect, test } from 'bun:test';
import { html, raw, escape, sr, srHTML, srAttr, srGrammarHTML, attrs } from '../src/lib/html.ts';

test('interpolation escapes by default', () => {
  expect(html`<p>${'<script>&"'}</p>`.value).toBe('<p>&lt;script&gt;&amp;&quot;</p>');
});

test('raw() opts out, and nesting composes without double-escaping', () => {
  const inner = html`<em>${'a & b'}</em>`;
  expect(html`<p>${inner}</p>`.value).toBe('<p><em>a &amp; b</em></p>');
  expect(html`<p>${raw('<em>x</em>')}</p>`.value).toBe('<p><em>x</em></p>');
});

test('arrays join, null and false vanish', () => {
  expect(html`${[1, 2, 3]}`.value).toBe('123');
  expect(html`a${null}b${false}c${undefined}d`.value).toBe('abcd');
});

test('sr() dual-emits both alphabets under class="s", never class="sr"', () => {
  const out = sr('žena').value;
  expect(out).toBe('<span class="s"><i data-s="lat">žena</i><i data-s="cyr">жена</i></span>');
  expect(out).not.toContain('class="sr"');
});

test('sr() escapes the specimen', () => {
  expect(sr('a<b').value).toContain('a&lt;b');
});

test('srHTML() keeps nested markup inside each variant', () => {
  const out = srHTML('<mark>Žena</mark> peva.').value;
  expect(out).toContain('<i data-s="lat"><mark>Žena</mark> peva.</i>');
  expect(out).toContain('<i data-s="cyr"><mark>Жена</mark> пева.</i>');
});

test('srGrammarHTML() flips only <i>-marked tokens and tags them lang="sr"', () => {
  const out = srGrammarHTML('These soften before <i>-i</i>.').value;
  expect(out).toStartWith('These soften before <i lang="sr">');
  expect(out).toContain('<i data-s="lat">-i</i>');
  expect(out).toContain('<i data-s="cyr">-и</i>');
  expect(out).toEndWith('.');
});

test('srAttr() bakes one script — an aria-label cannot dual-emit', () => {
  expect(srAttr('žena')).toBe('žena');
  expect(srAttr('a"b')).toBe('a&quot;b');
});

test('attrs() drops null/false and renders bare booleans', () => {
  expect(attrs({ id: 'x', hidden: true, tone: null, open: false }).value).toBe(' id="x" hidden');
  expect(attrs({}).value).toBe('');
});

test('escape covers the five', () => {
  expect(escape(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
});
