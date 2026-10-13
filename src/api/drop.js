/**
 * @fileoverview Drop dispatcher - Main workflow trigger handler
 */

import { createErrorResponse, createSuccessResponse } from '../utils/index.js';
import { parseRepoTarget, isSafeBranch } from '../services/repository.js';
import { validateOperatorAuth, getGitHubConfig } from '../services/auth.js';
import { dispatchWorkflow, getMainBranchSha, createGitHubHeaders } from '../services/github.js';
import { createBranch } from '../services/branches.js';

/**
 * Dispatches a headless mastering run on a non-main staging/raw branch
 * @param {Request} request
 * @param {Object} env
 * @returns {Promise<{response: Object, status: number}>}
 */
export async function handleDrop(request, env = {}) {
  try {
    const body = await request.json();
    
    // Authenticate operator
    const authResult = validateOperatorAuth(request, body, env);
    if (!authResult.isValid) {
      return createErrorResponse('Authentication Failure', authResult.error, 401);
    }
    
    // Resolve branch (default to 'raw')
    const branch = (body.branch && typeof body.branch === 'string' && body.branch.trim()) 
      ? body.branch.trim() 
      : 'raw';
    
    // Enforce safety gate
    if (!isSafeBranch(branch)) {
      return createErrorResponse(
        'Safety Gate Violation',
        'CRITICAL: Refusing to master directly on MAIN branch. Raw code must be submitted via an isolated staging or raw branch (e.g. "staging", "raw/vibe-1").',
        400
      );
    }
    
    const { token, owner: defaultOwner, repo: defaultRepo } = getGitHubConfig(env);
    const { owner, repo } = parseRepoTarget(body.repoUrl, defaultOwner, defaultRepo);
    
    if (!token) {
      return createErrorResponse(
        'Configuration Error',
        'GITHUB_TOKEN not configured in environment bindings.',
        500
      );
    }
    
    // Dispatch workflow
    let ghRes = await dispatchWorkflow(owner, repo, branch, token);
    
    // Auto-create branch if it doesn't exist
    if (!ghRes.ok && ghRes.status === 422) {
      const errText = await ghRes.clone().text();
      if (errText.includes('No ref found for')) {
        const branchResult = await createBranch(owner, repo, branch, token);
        if (branchResult.ok) {
          ghRes = await dispatchWorkflow(owner, repo, branch, token);
        }
      }
    }
    
    if (!ghRes.ok) {
      const errText = await ghRes.text();
      return createErrorResponse(
        'GitHub Dispatch Failed',
        `GitHub API returned ${ghRes.status}: ${errText}. Ensure branch "${branch}" exists in the repository.`,
        ghRes.status
      );
    }
    
    return createSuccessResponse({
      dispatched: true,
      branch,
      repository: `${owner}/${repo}`,
      message: `Headless Mastering Squad dispatched on branch "${branch}". Changes will be qualified with tests and opened as a Pull Request targeting main.`
    }, 202);
  } catch (err) {
    return createErrorResponse(
      'Malformed Request',
      err.message || 'Invalid JSON payload received.',
      400
    );
  }
}