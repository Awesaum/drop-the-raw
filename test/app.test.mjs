import test from 'node:test';
import assert from 'node:assert/strict';
import { handleRequest } from '../src/index.js';

test('drop-the-raw core application tests', async (t) => {
  await t.test('GET /health returns 200 and healthy status', async () => {
    const req = new Request('https://drop-the-raw.company.help/health');
    const res = await handleRequest(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'healthy');
    assert.equal(data.service, 'drop-the-raw');
    assert.equal(data.author, 'Drew Saum (Awesaum)');
  });

  await t.test('GET /api/status returns 200 and One-Take ethos', async () => {
    const req = new Request('https://drop-the-raw.company.help/api/status');
    const res = await handleRequest(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.ready, true);
    assert.match(data.ethos, /One take/i);
    assert.deepEqual(data.squad, ['Architect', 'Coder', 'Auditor', 'Hacker']);
  });

  await t.test('POST /api/subscribe requires valid email', async () => {
    const req = new Request('https://drop-the-raw.company.help/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid-email' })
    });
    const res = await handleRequest(req);
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /valid email address/i);
  });

  await t.test('POST /api/subscribe succeeds with valid email and Turnstile token', async () => {
    const req = new Request('https://drop-the-raw.company.help/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cf-turnstile-response': 'staging-turnstile-token'
      },
      body: JSON.stringify({ email: 'operator@example.com' })
    });
    const res = await handleRequest(req);
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.match(data.message, /Artificial Unintelligence/i);
  });

  await t.test('POST /api/escalate logs emergency ticket for solo founder', async () => {
    const req = new Request('https://drop-the-raw.company.help/api/escalate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Edge runtime deployment timeout' })
    });
    const res = await handleRequest(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.escalation.status, 'DISPATCHED_TO_FOUNDER');
  });

  await t.test('GET /robots.txt blocks AI scrapers', async () => {
    const req = new Request('https://drop-the-raw.company.help/robots.txt');
    const res = await handleRequest(req);
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.match(text, /User-agent: GPTBot\nDisallow: \//);
    assert.match(text, /User-agent: ClaudeBot\nDisallow: \//);
  });
});
