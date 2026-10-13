import test from 'node:test';
import assert from 'node:assert/strict';
import { routeRequest } from '../src/core/router.js';

test('Router module tests', async (t) => {
  await t.test('routeRequest handles health endpoint', async () => {
    const request = new Request('https://example.com/health');
    const result = await routeRequest('/health', 'GET', request, {});
    
    assert.equal(result.status, 200);
    assert.equal(result.response.status, 'healthy');
  });

  await t.test('routeRequest handles status endpoint', async () => {
    const request = new Request('https://example.com/api/status');
    const result = await routeRequest('/api/status', 'GET', request, {});
    
    assert.equal(result.status, 200);
    assert.equal(result.response.project, 'drop-the-raw');
    assert.match(result.response.ethos, /One take/);
  });

  await t.test('routeRequest handles 404 for unknown paths', async () => {
    const request = new Request('https://example.com/unknown');
    const result = await routeRequest('/unknown', 'GET', request, {});
    
    assert.equal(result.status, 404);
    assert.match(result.response.error, /Not Found/);
  });

  await t.test('routeRequest handles robots.txt specially', async () => {
    const request = new Request('https://example.com/robots.txt');
    const result = await routeRequest('/robots.txt', 'GET', request, {});
    
    // robots.txt returns a Response object directly
    assert.ok(result instanceof Response);
  });
});