/**
 * @fileoverview Drop workflow dispatcher core logic
 */

import { createErrorResponse, createSuccessResponse } from '../utils/index.js';
import { dispatchWorkflow } from '../services/github.js';
import { createBranch } from '../services/branches.js';

/**
 * Dispatches GitHub workflow with auto-branch creation
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} branch - Target branch
 * @param {string} token - GitHub token
 * @returns {Promise<Object>} Response object
 */
export async function executeWorkflowDispatch(owner, repo, branch, token) {
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
}