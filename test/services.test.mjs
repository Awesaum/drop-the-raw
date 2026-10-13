import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRepoTarget, isSafeBranch } from '../src/services/repository.js';

test('Repository service tests', async (t) => {
  await t.test('parseRepoTarget handles various input formats', () => {
    // Full GitHub URL
    const fullUrl = parseRepoTarget('https://github.com/owner/repo');
    assert.equal(fullUrl.owner, 'owner');
    assert.equal(fullUrl.repo, 'repo');
    assert.equal(fullUrl.fullUrl, 'https://github.com/owner/repo');

    // Owner/repo format
    const ownerRepo = parseRepoTarget('owner/repo');
    assert.equal(ownerRepo.owner, 'owner');
    assert.equal(ownerRepo.repo, 'repo');

    // With .git suffix
    const withGit = parseRepoTarget('https://github.com/owner/repo.git');
    assert.equal(withGit.owner, 'owner');
    assert.equal(withGit.repo, 'repo');

    // Invalid input - should use defaults
    const invalid = parseRepoTarget('invalid');
    assert.equal(invalid.owner, 'Awesaum');
    assert.equal(invalid.repo, 'drop-the-raw');

    // Null input - should use defaults
    const nullInput = parseRepoTarget(null);
    assert.equal(nullInput.owner, 'Awesaum');
    assert.equal(nullInput.repo, 'drop-the-raw');

    // Empty string - should use defaults
    const empty = parseRepoTarget('');
    assert.equal(empty.owner, 'Awesaum');
    assert.equal(empty.repo, 'drop-the-raw');
  });

  await t.test('isSafeBranch validates branch names', () => {
    // Safe branches
    assert.equal(isSafeBranch('raw'), true);
    assert.equal(isSafeBranch('staging'), true);
    assert.equal(isSafeBranch('feature/new-thing'), true);
    assert.equal(isSafeBranch('dev'), true);

    // Unsafe branches
    assert.equal(isSafeBranch('main'), false);
    assert.equal(isSafeBranch('master'), false);
    assert.equal(isSafeBranch('MAIN'), false);
    assert.equal(isSafeBranch('Master'), false);
    assert.equal(isSafeBranch('feature/main'), false);

    // Invalid inputs
    assert.equal(isSafeBranch(''), false);
    assert.equal(isSafeBranch(null), false);
    assert.equal(isSafeBranch(undefined), false);
    assert.equal(isSafeBranch(123), false);
  });
});