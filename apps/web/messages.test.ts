import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const keys = (o: unknown, prefix = ''): string[] =>
  typeof o === 'object' && o !== null
    ? Object.entries(o).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k))
    : [prefix];

const load = (locale: string, file: string) => JSON.parse(readFileSync(new URL(`./messages/${locale}/${file}`, import.meta.url), 'utf8'));

describe('messages', () => {
  for (const file of readdirSync(new URL('./messages/en', import.meta.url))) {
    it(`de/${file} has exactly the keys of en/${file}`, () => {
      expect(keys(load('de', file)).sort()).toEqual(keys(load('en', file)).sort());
    });
  }
});
