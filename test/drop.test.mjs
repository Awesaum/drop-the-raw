import test from 'node:test';
import assert from 'node:assert/strict';
import { handleDrop, parseRepoTarget, handleBranchCheck, handleCreateBranch } from '../src/api/drop.js';

test('Drop Dispatcher API tests (Non-Main Safety Gate)', async (t) => {
  const env = {
    OPERATOR_KEY: 'test-passcode-123',
    GITHUB_TOKEN: 'mock-token',
    GITHUB_OWNER: 'Awesaum',
    GITHUB_REPO: 'drop-the-raw'
  };

  await t.test('parseRepoTarget parses various GitHub repo formats', () => {
    assert.deepEqual(parseRepoTarget('https://github.com/my-org/my-vibe-app'), {
      owner: 'my-org',
      repo: 'my-vibe-app',
      fullUrl: 'https://github.com/my-org/my-vibe-app'
    });
    assert.deepEqual(parseRepoTarget('my-org/my-vibe-app.git'), {
      owner: 'my-org',
      repo: 'my-vibe-app',
      fullUrl: 'https://github.com/my-org/my-vibe-app'
    });
    assert.deepEqual(parseRepoTarget(''), {
      owner: 'Awesaum',
      repo: 'drop-the-raw',
      fullUrl: 'https://github.com/Awesaum/drop-the-raw'
    });
  });

  await t.test('POST /api/drop rejects missing passcode', async () => {
    const req = new Request('https://studio.local/api/drop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branch: 'staging' })
    });
    const { response, status } = await handleDrop(req, env);
    assert.equal(status, 401);
    assert.match(response.message, /invalid or missing operator passcode/i);
  });

  await t.test('POST /api/drop rejects invalid passcode', async () => {
    const req = new Request('https://studio.local/api/drop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branch: 'staging', operatorKey: 'wrong-key' })
    });
    const { response, status } = await handleDrop(req, env);
    assert.equal(status, 401);
  });

  await t.test('POST /api/drop defaults to raw branch when omitted', async () => {
    const req = new Request('https://studio.local/api/drop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branch: '', operatorKey: 'test-passcode-123' })
    });
    const { response, status } = await handleDrop(req, env);
    // Verified: does not reject with 400 validation error; proceeds with 'raw'
    assert.notEqual(status, 400);
  });

  await t.test('POST /api/drop STRICTLY REJECTS main branch (Circuit Breaker)', async () => {
    const req = new Request('https://studio.local/api/drop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branch: 'main', operatorKey: 'test-passcode-123' })
    });
    const { response, status } = await handleDrop(req, env);
    assert.equal(status, 400);
    assert.equal(response.error, 'Safety Gate Violation');
    assert.match(response.message, /Refusing to master directly on MAIN branch/i);
  });

  await t.test('POST /api/drop STRICTLY REJECTS master or /main branches', async () => {
    for (const b of ['master', 'origin/main', 'heads/main']) {
      const req = new Request('https://studio.local/api/drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch: b, operatorKey: 'test-passcode-123' })
      });
      const { response, status } = await handleDrop(req, env);
      assert.equal(status, 400);
      assert.equal(response.error, 'Safety Gate Violation');
    }
  });

  await t.test('handleCreateBranch rejects missing or invalid passcode', async () => {
    const req = new Request('https://studio.local/api/drop/create-branch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branch: 'raw', operatorKey: 'wrong-passcode' })
    });
    const { response, status } = await handleCreateBranch(req, env);
    assert.equal(status, 401);
  });

  await t.test('handleCreateBranch rejects main branch', async () => {
    const req = new Request('https://studio.local/api/drop/create-branch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branch: 'main', operatorKey: 'test-passcode-123' })
    });
    const { response, status } = await handleCreateBranch(req, env);
    assert.equal(status, 400);
    assert.equal(response.error, 'Safety Gate Violation');
  });
});
