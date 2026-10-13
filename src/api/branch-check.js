/**
 * @fileoverview Branch check handler - Verify repository and branch existence
 */

import { createErrorResponse, createSuccessResponse } from '../utils/index.js';
import { parseRepoTarget } from '../services/repository.js';
import { getGitHubConfig } from '../services/auth.js';
import { createGitHubHeaders } from '../services/github.js';

/**
 * Checks whether the target repository and branch exist
 * @param {Request} request
 * @param {Object} env
 * @returns {Promise<{response: Object, status: number}>}
 */
export async function handleBranchCheck(request, env = {}) {
  try {
    const url = new URL(request.url);
    const paramRepo = url.searchParams.get('repoUrl') || '';
    const branch = url.searchParams.get('branch') || 'raw';
    const { token, owner: defaultOwner, repo: defaultRepo } = getGitHubConfig(env);
    const { owner, repo } = parseRepoTarget(paramRepo, defaultOwner, defaultRepo);
    
    const headers = createGitHubHeaders(token);
    
    // Check repository access
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      return createSuccessResponse({
        repoExists: false,
        rawExists: false,
        repository: `${owner}/${repo}`,
        defaultBranch: 'unknown',
        message: `Repository ${owner}/${repo} not found or not accessible.`
      }, 200);
    }
    
    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || 'main';
    
    // Check branch existence
    const branchRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches/${branch}`, { headers });
    const rawExists = branchRes.ok;
    
    return createSuccessResponse({
      repoExists: true,
      rawExists,
      branch,
      repository: `${owner}/${repo}`,
      defaultBranch,
      isDefaultBranch: branch === defaultBranch,
      message: rawExists 
        ? `Branch '${branch}' exists and is ready for raw drops.` 
        : `Branch '${branch}' does not exist on ${owner}/${repo}.`
    }, 200);
  } catch (err) {
    return createErrorResponse('Branch Check Failed', err.message, 500);
  }
}