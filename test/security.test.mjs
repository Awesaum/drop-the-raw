import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyTurnstile, getSecurityHeaders, getRobotsTxt } from '../src/security/index.js';

test('Security module tests', async (t) => {
  await t.test('verifyTurnstile validates staging tokens', async () => {
    assert.equal(await verifyTurnstile('staging-turnstile-token'), true);
    assert.equal(await verifyTurnstile('turnstile_abc123'), true);
    assert.equal(await verifyTurnstile(''), false);
    assert.equal(await verifyTurnstile(null), false);
  });

  await t.test('verifyTurnstile validates token length', async () => {
    assert.equal(await verifyTurnstile('short'), false);
    assert.equal(await verifyTurnstile('long-enough-token'), true);
  });

  await t.test('getSecurityHeaders returns Zero Trust headers', () => {
    const headers = getSecurityHeaders();
    assert.equal(headers['X-Content-Type-Options'], 'nosniff');
    assert.equal(headers['X-Frame-Options'], 'DENY');
    assert.equal(headers['X-XSS-Protection'], '1; mode=block');
    assert.match(headers['Strict-Transport-Security'], /max-age=31536000/);
    assert.equal(headers['Access-Control-Allow-Origin'], '*');
  });

  await t.test('getRobotsTxt blocks AI scrapers', () => {
    const robots = getRobotsTxt();
    assert.match(robots, /User-agent: GPTBot\nDisallow: \//);
    assert.match(robots, /User-agent: ClaudeBot\nDisallow: \//);
    assert.match(robots, /User-agent: CCBot\nDisallow: \//);
    assert.match(robots, /User-agent: anthropic-ai\nDisallow: \//);
    assert.match(robots, /User-agent: \*\nAllow: \//);
  });
});