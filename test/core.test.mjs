import test from 'node:test';
import assert from 'node:assert/strict';
import { handleHealth, handleRobots, handle404 } from '../src/core/index.js';

test('Core module tests', async (t) => {
  await t.test('handleHealth returns healthy status', async () => {
    const req = new Request('https://test.com/health');
    const result = await handleHealth(req);
    
    assert.equal(result.status, 200);
    assert.equal(result.response.status, 'healthy');
    assert.equal(result.response.service, 'drop-the-raw');
    assert.equal(result.response.author, 'Drew Saum (Awesaum)');
    assert.equal(result.response.mode, 'edge');
    assert.match(result.response.timestamp, /^\d{4}-\d{2}-\d{2}T/);
  });

  await t.test('handleRobots returns AI scraper defense', async () => {
    const req = new Request('https://test.com/robots.txt');
    const response = await handleRobots(req);
    
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Content-Type'), 'text/plain');
    
    const text = await response.text();
    assert.match(text, /User-agent: GPTBot\nDisallow: \//);
    assert.match(text, /User-agent: ClaudeBot\nDisallow: \//);
    assert.match(text, /User-agent: \*\nAllow: \//);
  });

  await t.test('handle404 returns proper error response', () => {
    const result = handle404('/nonexistent');
    
    assert.equal(result.status, 404);
    assert.equal(result.response.error, 'Not Found');
    assert.match(result.response.message, /drop-the-raw endpoint not found/);
    assert.match(result.response.message, /\/nonexistent/);
  });
});