/**
 * @fileoverview Drop request validation and processing
 */

import { createErrorResponse } from '../utils/index.js';
import { parseRepoTarget, isSafeBranch } from '../services/repository.js';
import { validateOperatorAuth, getGitHubConfig } from '../services/auth.js';

/**
 * Validates and processes drop request
 * @param {Request} request - HTTP request
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} Validation result with config
 */
export async function validateDropRequest(request, env) {
  const body = await request.json();
  
  // Authenticate operator
  const authResult = validateOperatorAuth(request, body, env);
  if (!authResult.isValid) {
    return { 
      error: createErrorResponse('Authentication Failure', authResult.error, 401) 
    };
  }
  
  // Resolve branch (default to 'raw')
  const branch = (body.branch && typeof body.branch === 'string' && body.branch.trim()) 
    ? body.branch.trim() 
    : 'raw';
  
  // Enforce safety gate
  if (!isSafeBranch(branch)) {
    return {
      error: createErrorResponse(
        'Safety Gate Violation',
        'CRITICAL: Refusing to master directly on MAIN branch. Raw code must be submitted via an isolated staging or raw branch (e.g. "staging", "raw/vibe-1").',
        400
      )
    };
  }
  
  const { token, owner: defaultOwner, repo: defaultRepo } = getGitHubConfig(env);
  const { owner, repo } = parseRepoTarget(body.repoUrl, defaultOwner, defaultRepo);
  
  if (!token) {
    return {
      error: createErrorResponse(
        'Configuration Error',
        'GITHUB_TOKEN not configured in environment bindings.',
        500
      )
    };
  }
  
  return { owner, repo, branch, token };
}