import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDropRequest } from '../src/api/drop-validator.js';
import { executeWorkflowDispatch } from '../src/api/drop-dispatcher.js';

test('Drop refactored modules tests', async (t) => {
  await t.test('validateDropRequest rejects missing authentication', async () => {
    const request = new Request('https://example.com/api/drop', {
      method: 'POST',
      body: JSON.stringify({ repoUrl: 'https://github.com/test/repo' })
    });
    
    const result = await validateDropRequest(request, {});
    assert.ok(result.error);
    assert.equal(result.error.status, 401);
    assert.match(result.error.response.error, /Authentication Failure/);
  });

  await t.test('validateDropRequest rejects main branch', async () => {
    const request = new Request('https://example.com/api/drop', {
      method: 'POST',
      body: JSON.stringify({ 
        operatorKey: 'test-key',
        branch: 'main',
        repoUrl: 'https://github.com/test/repo'
      })
    });
    
    const env = { OPERATOR_KEY: 'test-key' };
    const result = await validateDropRequest(request, env);
    assert.ok(result.error);
    assert.equal(result.error.status, 400);
    assert.match(result.error.response.error, /Safety Gate Violation/);
  });

  await t.test('validateDropRequest accepts valid staging branch', async () => {
    const request = new Request('https://example.com/api/drop', {
      method: 'POST',
      body: JSON.stringify({ 
        operatorKey: 'test-key',
        branch: 'staging',
        repoUrl: 'https://github.com/test/repo'
      })
    });
    
    const env = { 
      OPERATOR_KEY: 'test-key',
      GITHUB_TOKEN: 'ghp_test123'
    };
    
    const result = await validateDropRequest(request, env);
    assert.ok(!result.error);
    assert.equal(result.branch, 'staging');
    assert.equal(result.owner, 'test');
    assert.equal(result.repo, 'repo');
  });

  await t.test('executeWorkflowDispatch handles GitHub errors', async () => {
    // Mock a failed GitHub API response
    const originalFetch = global.fetch;
    global.fetch = async () => ({
      ok: false,
      status: 404,
      text: async () => 'Repository not found'
    });
    
    const result = await executeWorkflowDispatch('test', 'nonexistent', 'staging', 'fake-token');
    assert.equal(result.status, 404);
    assert.match(result.response.error, /GitHub Dispatch Failed/);
    
    // Restore original fetch
    global.fetch = originalFetch;
  });
});