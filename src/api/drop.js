/**
 * @fileoverview Drop dispatcher - Main workflow trigger handler
 */

import { createErrorResponse } from '../utils/index.js';
import { validateDropRequest } from './drop-validator.js';
import { executeWorkflowDispatch } from './drop-dispatcher.js';

/**
 * Dispatches a headless mastering run on a non-main staging/raw branch
 * @param {Request} request
 * @param {Object} env
 * @returns {Promise<{response: Object, status: number}>}
 */
export async function handleDrop(request, env = {}) {
  try {
    const validation = await validateDropRequest(request, env);
    
    if (validation.error) {
      return validation.error;
    }
    
    const { owner, repo, branch, token } = validation;
    return await executeWorkflowDispatch(owner, repo, branch, token);
  } catch (err) {
    return createErrorResponse(
      'Malformed Request',
      err.message || 'Invalid JSON payload received.',
      400
    );
  }
}