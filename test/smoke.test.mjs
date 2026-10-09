import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

test('drop-the-raw smoke test', (t) => {
  t.test('CONCEPT.md exists and contains KozarKane One Take ethos', () => {
    const conceptPath = resolve(process.cwd(), 'specs/CONCEPT.md');
    assert.ok(existsSync(conceptPath), 'specs/CONCEPT.md must exist');
    const content = readFileSync(conceptPath, 'utf8');
    assert.match(content, /One Take/i);
    assert.match(content, /Awesaum/i);
  });

  t.test('SPECIFICATION.md exists and specifies Kilo Code CLI', () => {
    const specPath = resolve(process.cwd(), 'specs/SPECIFICATION.md');
    assert.ok(existsSync(specPath), 'specs/SPECIFICATION.md must exist');
    const content = readFileSync(specPath, 'utf8');
    assert.match(content, /@kilocode\/cli/i);
    assert.match(content, /OPENROUTER_API_KEY/i);
  });
});
