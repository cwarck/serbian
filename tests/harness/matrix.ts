/* The snapshot matrix, shared by the checker and the writer so they can never
   disagree about what is covered. */

import type { Lang } from '../../src/lib/negotiate.ts';
import type { Script } from './normalizers.ts';
import type { Rendered } from './render-build.ts';

export const CHARTS = [
  'alphabet', 'aspect', 'cases', 'false-friends', 'numbers',
  'pitch-stress', 'prepositions', 'pronouns', 'verbs',
] as const;

export const LANGS: readonly Lang[] = ['en', 'ru'];
export const SCRIPTS: readonly Script[] = ['lat', 'cyr'];

export function serialize(rendered: Rendered, normalize: (html: string) => string): string {
  const out: string[] = [];
  for (const [id, markup] of Object.entries(rendered.mounts)) {
    out.push(`### mount ${id}`, normalize(markup));
  }
  for (const key of Object.keys(rendered.popovers).sort()) {
    out.push(`### popover ${key}`, normalize(rendered.popovers[key]!));
  }
  return out.join('\n') + '\n';
}
