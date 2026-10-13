/**
 * @fileoverview drop-the-raw - Mastered Edge Application
 * Clean modular architecture for Artificial Unintelligence lead capture
 * Refactored from One-Take SHIT Code into production-grade modules
 */

import { getSecurityHeaders } from './security/index.js';
import { handleHealth, handleRobots, handle404 } from './core/index.js';
import { handleSubscribe } from './api/subscribe.js';
import { handleEscalate } from './api/escalate.js';
import { handleStatus } from './api/status.js';
import { handleDrop, handleDropStatus } from './api/drop.js';

/**
 * Primary edge fetch handler for Cloudflare Workers / Node runtime
 * @param {Request} request - HTTP request object
 * @param {Object} env - Environment variables
 * @returns {Promise<Response>} HTTP response
 */
export async function handleRequest(request, env = {}) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Get Zero Trust security headers
  const headers = getSecurityHeaders();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  let result;

  // Route requests to modular handlers
  if (path === '/health' && method === 'GET') {
    result = await handleHealth(request, env);
  } else if (path === '/api/status' && method === 'GET') {
    result = await handleStatus(request, env);
  } else if (path === '/api/drop' && method === 'POST') {
    result = await handleDrop(request, env);
  } else if (path === '/api/drop/status' && method === 'GET') {
    result = await handleDropStatus(request, env);
  } else if (path === '/api/subscribe' && method === 'POST') {
    result = await handleSubscribe(request, env);
  } else if (path === '/api/escalate' && method === 'POST') {
    result = await handleEscalate(request, env);
  } else if (path === '/robots.txt' && method === 'GET') {
    // Special case: robots.txt returns Response directly
    return await handleRobots(request, env);
  } else {
    // 404 fallback
    result = handle404(path);
  }

  // Return formatted response
  return new Response(JSON.stringify(result.response), {
    status: result.status,
    headers
  });
}

// Default export for Cloudflare Workers compatibility
export default {
  fetch(request, env, ctx) {
    return handleRequest(request, env);
  }
};
