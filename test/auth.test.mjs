import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOperatorAuth, getGitHubConfig } from '../src/services/auth.js';

test('Authentication service tests', async (t) => {
  await t.test('validateOperatorAuth validates operator keys', () => {
    const mockRequest = {
      headers: {
        get: (name) => name === 'x-operator-key' ? 'header-key' : null
      }
    };

    // Valid key in body
    const validBody = validateOperatorAuth(mockRequest, { operatorKey: 'test-key' }, { OPERATOR_KEY: 'test-key' });
    assert.equal(validBody.isValid, true);
    assert.equal(validBody.error, undefined);

    // Valid key in header
    const validHeader = validateOperatorAuth(mockRequest, {}, { OPERATOR_KEY: 'header-key' });
    assert.equal(validHeader.isValid, true);

    // Invalid key
    const invalid = validateOperatorAuth(mockRequest, { operatorKey: 'wrong-key' }, { OPERATOR_KEY: 'test-key' });
    assert.equal(invalid.isValid, false);
    assert.match(invalid.error, /Invalid or missing operator passcode/);

    // Missing key
    const missing = validateOperatorAuth({ headers: { get: () => null } }, {}, { OPERATOR_KEY: 'test-key' });
    assert.equal(missing.isValid, false);
    assert.match(missing.error, /Invalid or missing operator passcode/);

    // Empty key
    const empty = validateOperatorAuth(mockRequest, { operatorKey: '' }, { OPERATOR_KEY: 'test-key' });
    assert.equal(empty.isValid, false);
  });

  await t.test('getGitHubConfig extracts configuration', () => {
    const config = getGitHubConfig({
      GITHUB_TOKEN: 'test-token',
      GITHUB_OWNER: 'test-owner',
      GITHUB_REPO: 'test-repo'
    });

    assert.equal(config.token, 'test-token');
    assert.equal(config.owner, 'test-owner');
    assert.equal(config.repo, 'test-repo');

    // Default values
    const defaults = getGitHubConfig({});
    assert.equal(defaults.token, null);
    assert.equal(defaults.owner, 'Awesaum');
    assert.equal(defaults.repo, 'drop-the-raw');
  });
});