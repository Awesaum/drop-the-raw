import test from 'node:test';
import assert from 'node:assert/strict';
import { validateWAFRules } from '../src/security/waf.js';

test('WAF protection tests', async (t) => {
  await t.test('validateWAFRules blocks suspicious SQL injection patterns', async () => {
    const maliciousRequest = new Request('https://example.com/api/drop', {
      method: 'POST',
      body: JSON.stringify({ query: "SELECT * FROM users; DROP TABLE users;" }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await validateWAFRules(maliciousRequest);
    assert.notEqual(result, null);
    assert.equal(result.status, 403);
    assert.match(result.response.error, /Security Violation/);
  });

  await t.test('validateWAFRules blocks XSS script patterns', async () => {
    const xssRequest = new Request('https://example.com/api/drop', {
      method: 'POST',
      body: JSON.stringify({ content: "<script>alert('xss')</script>" }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await validateWAFRules(xssRequest);
    assert.notEqual(result, null);
    assert.equal(result.status, 403);
  });

  await t.test('validateWAFRules allows legitimate requests', async () => {
    const legitimateRequest = new Request('https://example.com/api/drop', {
      method: 'POST',
      body: JSON.stringify({ branch: 'feature/new-awesome-feature', repoUrl: 'https://github.com/user/repo' }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await validateWAFRules(legitimateRequest);
    assert.equal(result, null); // Should pass validation
  });

  await t.test('validateWAFRules enforces rate limiting', async () => {
    // Create many requests from same IP to trigger rate limit
    const requests = [];
    for (let i = 0; i < 101; i++) { // Exceeds the 100 request limit
      const req = new Request('https://example.com/api/test', {
        method: 'GET',
        headers: { 'CF-Connecting-IP': '192.168.1.100' }
      });
      requests.push(validateWAFRules(req));
    }
    
    const results = await Promise.all(requests);
    const rateLimitedRequests = results.filter(r => r && r.status === 429);
    assert.ok(rateLimitedRequests.length > 0, 'Should have rate-limited requests');
  });
});