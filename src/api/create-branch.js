/**
 * @fileoverview Create branch handler - Create new branches for raw operations
 */

import { createErrorResponse, createSuccessResponse } from '../utils/index.js';
import { parseRepoTarget, isSafeBranch } from '../services/repository.js';
import { validateOperatorAuth, getGitHubConfig } from '../services/auth.js';
import { createBranch } from '../services/branches.js';

/**
 * Creates the 'raw' branch from the default branch (main)
 * @param {Request} request
 * @param {Object} env
 * @returns {Promise<{response: Object, status: number}>}
 */
export async function handleCreateBranch(request, env = {}) {
  try {
    const body = await request.json();
    const branch = (body.branch || 'raw').trim();
    
    // Authenticate operator
    const authResult = validateOperatorAuth(request, body, env);
    if (!authResult.isValid) {
      return createErrorResponse('Authentication Failure', authResult.error, 401);
    }
    
    // Enforce safety gate
    if (!isSafeBranch(branch)) {
      return createErrorResponse(
        'Safety Gate Violation', 
        'Cannot create or target main branch as a raw sandbox.', 
        400
      );
    }
    
    const { token, owner: defaultOwner, repo: defaultRepo } = getGitHubConfig(env);
    const { owner, repo } = parseRepoTarget(body.repoUrl, defaultOwner, defaultRepo);
    
    if (!token) {
      return createErrorResponse('Configuration Error', 'GITHUB_TOKEN not configured.', 500);
    }
    
    const result = await createBranch(owner, repo, branch, token);
    
    if (!result.ok) {
      return createErrorResponse('Branch Creation Failed', result.error, 500);
    }
    
    if (result.alreadyExists) {
      return createSuccessResponse({
        created: false,
        alreadyExists: true,
        branch,
        repository: `${owner}/${repo}`,
        message: `Branch '${branch}' already exists.`
      }, 200);
    }
    
    return createSuccessResponse({
      created: true,
      branch,
      repository: `${owner}/${repo}`,
      message: `Branch '${branch}' created successfully from main. Ready for raw drops.`
    }, 201);
  } catch (err) {
    return createErrorResponse('Malformed Request', err.message, 400);
  }
}