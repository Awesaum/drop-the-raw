import test from 'node:test';
import assert from 'node:assert/strict';
import { createGitHubHeaders } from '../src/services/github.js';

test('GitHub service tests', async (t) => {
  await t.test('createGitHubHeaders creates proper headers', () => {
    // With token
    const withToken = createGitHubHeaders('test-token');
    assert.equal(withToken['Accept'], 'application/vnd.github+json');
    assert.equal(withToken['User-Agent'], 'drop-the-raw-studio/1.0');
    assert.equal(withToken['Content-Type'], 'application/json');
    assert.equal(withToken['Authorization'], 'Bearer test-token');

    // Without token
    const withoutToken = createGitHubHeaders();
    assert.equal(withoutToken['Accept'], 'application/vnd.github+json');
    assert.equal(withoutToken['User-Agent'], 'drop-the-raw-studio/1.0');
    assert.equal(withoutToken['Content-Type'], 'application/json');
    assert.equal(withoutToken['Authorization'], undefined);

    // With null token
    const nullToken = createGitHubHeaders(null);
    assert.equal(nullToken['Authorization'], undefined);
  });

  // Note: Other GitHub service functions require real API calls
  // These would need mocking for comprehensive testing
});