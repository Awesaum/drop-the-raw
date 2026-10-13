/**
 * @fileoverview Branch operations - Create and manage branches
 */

import { createGitHubHeaders, getMainBranchSha } from './github.js';

/**
 * Creates a new branch from the main branch
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} branch - New branch name
 * @param {string} token - GitHub token
 * @returns {Promise<{ok: boolean, alreadyExists?: boolean, error?: string}>}
 */
export async function createBranch(owner, repo, branch, token) {
  const headers = createGitHubHeaders(token);
  
  // Get main branch SHA
  const mainSha = await getMainBranchSha(owner, repo, token);
  if (!mainSha) {
    return { ok: false, error: 'Could not determine commit SHA for main branch' };
  }
  
  // Create branch reference
  const createRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      ref: `refs/heads/${branch}`,
      sha: mainSha
    })
  });
  
  if (!createRes.ok) {
    const errText = await createRes.text();
    if (createRes.status === 422 && errText.includes('Reference already exists')) {
      return { ok: true, alreadyExists: true };
    }
    return { ok: false, error: errText };
  }
  
  return { ok: true };
}

/**
 * Checks if a branch exists in the repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} branch - Branch name to check
 * @param {string} token - GitHub token
 * @returns {Promise<boolean>}
 */
export async function branchExists(owner, repo, branch, token) {
  const headers = createGitHubHeaders(token);
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches/${branch}`, { headers });
  return response.ok;
}