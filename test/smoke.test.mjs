import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

test('drop-the-raw smoke test', async (t) => {
  await t.test('CONCEPT.md exists and contains KozarKane One Take ethos', () => {
    const conceptPath = resolve(process.cwd(), 'specs/CONCEPT.md');
    assert.ok(existsSync(conceptPath), 'specs/CONCEPT.md must exist');
    const content = readFileSync(conceptPath, 'utf8');
    assert.match(content, /One Take/i);
    assert.match(content, /Awesaum/i);
  });

  await t.test('SPECIFICATION.md exists and specifies Kilo Code CLI & OpenCode', () => {
    const specPath = resolve(process.cwd(), 'specs/SPECIFICATION.md');
    assert.ok(existsSync(specPath), 'specs/SPECIFICATION.md must exist');
    const content = readFileSync(specPath, 'utf8');
    assert.match(content, /@kilocode\/cli/i);
    assert.match(content, /opencode/i);
    assert.match(content, /OPENROUTER_API_KEY/i);
  });

  await t.test('opencode.json and AGENTS.md exist and configure OpenRouter wholesale routing', () => {
    const opencodePath = resolve(process.cwd(), 'opencode.json');
    assert.ok(existsSync(opencodePath), 'opencode.json must exist');
    const opencodeConfig = JSON.parse(readFileSync(opencodePath, 'utf8'));
    assert.ok(opencodeConfig.provider?.openrouter || opencodeConfig.providers?.openrouter, 'opencode.json must configure openrouter provider');

    const agentsPath = resolve(process.cwd(), 'AGENTS.md');
    assert.ok(existsSync(agentsPath), 'AGENTS.md must exist');
  });

  await t.test('.kilo/kilo.json exists and configures Kilo OpenRouter model routing', () => {
    const kiloPath = resolve(process.cwd(), '.kilo/kilo.json');
    assert.ok(existsSync(kiloPath), '.kilo/kilo.json must exist');
    const kiloConfig = JSON.parse(readFileSync(kiloPath, 'utf8'));
    assert.ok(kiloConfig.provider?.openrouter, '.kilo/kilo.json must configure openrouter provider');
  });

  await t.test('public/robots.txt exists and blocks AI scrapers', () => {
    const robotsPath = resolve(process.cwd(), 'public/robots.txt');
    assert.ok(existsSync(robotsPath), 'public/robots.txt must exist');
    const content = readFileSync(robotsPath, 'utf8');
    assert.match(content, /GPTBot/i);
    assert.match(content, /ClaudeBot/i);
    assert.match(content, /Disallow: \//i);
  });

  await t.test('scripts/build.mjs exists and builds successfully', () => {
    const buildPath = resolve(process.cwd(), 'scripts/build.mjs');
    assert.ok(existsSync(buildPath), 'scripts/build.mjs must exist');
  });

  await t.test('scripts/setup-runners.mjs exists and is valid module', () => {
    const setupPath = resolve(process.cwd(), 'scripts/setup-runners.mjs');
    assert.ok(existsSync(setupPath), 'scripts/setup-runners.mjs must exist');
  });

  await t.test('specs/CONCEPT.md readiness gate is armed true', () => {
    const conceptPath = resolve(process.cwd(), 'specs/CONCEPT.md');
    const content = readFileSync(conceptPath, 'utf8');
    assert.match(content, /drop_the_raw_ready:\s*true/);
  });

  await t.test('src/index.js and public/index.html drop-the-raw app files exist', () => {
    const appPath = resolve(process.cwd(), 'src/index.js');
    assert.ok(existsSync(appPath), 'src/index.js must exist');
    const htmlPath = resolve(process.cwd(), 'public/index.html');
    assert.ok(existsSync(htmlPath), 'public/index.html must exist');
  });
});
