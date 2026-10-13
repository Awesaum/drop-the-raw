/**
 * @fileoverview Request routing logic
 */

import { handleHealth, handleRobots, handle404 } from '../core/index.js';
import { handleSubscribe } from '../api/subscribe.js';
import { handleEscalate } from '../api/escalate.js';
import { handleStatus, handleDropStatus } from '../api/status.js';
import { handleDrop } from '../api/drop.js';
import { handleBranchCheck } from '../api/branch-check.js';
import { handleCreateBranch } from '../api/create-branch.js';

/**
 * Routes requests to appropriate handlers
 * @param {string} path - Request path
 * @param {string} method - HTTP method
 * @param {Request} request - HTTP request
 * @param {Object} env - Environment variables
 * @returns {Promise<Object|Response>} Handler result
 */
export async function routeRequest(path, method, request, env) {
  if (path === '/health' && method === 'GET') {
    return await handleHealth(request, env);
  } else if (path === '/api/status' && method === 'GET') {
    return await handleStatus(request, env);
  } else if (path === '/api/drop' && method === 'POST') {
    return await handleDrop(request, env);
  } else if (path === '/api/drop/status' && method === 'GET') {
    return await handleDropStatus(request, env);
  } else if (path === '/api/drop/branch-status' && method === 'GET') {
    return await handleBranchCheck(request, env);
  } else if (path === '/api/drop/create-branch' && method === 'POST') {
    return await handleCreateBranch(request, env);
  } else if (path === '/api/subscribe' && method === 'POST') {
    return await handleSubscribe(request, env);
  } else if (path === '/api/escalate' && method === 'POST') {
    return await handleEscalate(request, env);
  } else if (path === '/robots.txt' && method === 'GET') {
    // Special case: robots.txt returns Response directly
    return await handleRobots(request, env);
  } else {
    // 404 fallback
    return handle404(path);
  }
}