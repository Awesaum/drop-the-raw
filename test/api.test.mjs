import test from 'node:test';
import assert from 'node:assert/strict';
import { handleSubscribe, getSubscriberCount } from '../src/api/subscribe.js';
import { handleEscalate, getEscalationCount } from '../src/api/escalate.js';
import { handleStatus } from '../src/api/status.js';

test('API modules tests', async (t) => {
  await t.test('handleSubscribe validates email', async () => {
    const req = new Request('https://test.com/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid-email' })
    });

    const result = await handleSubscribe(req);
    assert.equal(result.status, 400);
    assert.match(result.response.message, /valid email address/i);
  });

  await t.test('handleSubscribe requires Turnstile token', async () => {
    const req = new Request('https://test.com/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    });

    const result = await handleSubscribe(req);
    assert.equal(result.status, 403);
    assert.match(result.response.message, /Turnstile token verification failed/i);
  });

  await t.test('handleSubscribe succeeds with valid data', async () => {
    const req = new Request('https://test.com/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cf-turnstile-response': 'staging-turnstile-token'
      },
      body: JSON.stringify({ email: 'test@example.com' })
    });

    const result = await handleSubscribe(req);
    assert.equal(result.status, 201);
    assert.equal(result.response.success, true);
    assert.match(result.response.message, /Artificial Unintelligence/i);
  });

  await t.test('handleEscalate creates escalation ticket', async () => {
    const req = new Request('https://test.com/api/escalate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Test emergency', context: { urgent: true } })
    });

    const result = await handleEscalate(req);
    assert.equal(result.status, 200);
    assert.equal(result.response.success, true);
    assert.match(result.response.message, /Drew Saum/i);
    assert.equal(result.response.escalation.status, 'DISPATCHED_TO_FOUNDER');
  });

  await t.test('handleStatus returns project metadata', async () => {
    const req = new Request('https://test.com/api/status');
    const result = await handleStatus(req);
    
    assert.equal(result.status, 200);
    assert.equal(result.response.project, 'drop-the-raw');
    assert.match(result.response.ethos, /One take/i);
    assert.deepEqual(result.response.squad, ['Architect', 'Coder', 'Auditor', 'Hacker']);
    assert.equal(result.response.ready, true);
  });

  await t.test('getSubscriberCount and getEscalationCount work', () => {
    // These functions access in-memory arrays, counts may vary during test runs
    assert.equal(typeof getSubscriberCount(), 'number');
    assert.equal(typeof getEscalationCount(), 'number');
    assert(getSubscriberCount() >= 0);
    assert(getEscalationCount() >= 0);
  });
});