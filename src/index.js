/**
 * @fileoverview drop-the-raw - Mastered Edge Application
 * Clean modular architecture for Artificial Unintelligence lead capture
 * Refactored from One-Take SHIT Code into production-grade modules
 */

import { getSecurityHeaders, validateWAFRules } from './security/index.js';
import { routeRequest } from './core/router.js';

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

  // WAF protection - validate request
  const wafResult = await validateWAFRules(request);
  if (wafResult) {
    return new Response(JSON.stringify(wafResult.response), {
      status: wafResult.status,
      headers
    });
  }

  // Route request to appropriate handler
  const result = await routeRequest(path, method, request, env);
  
  // Handle special responses (like robots.txt)
  if (result instanceof Response) {
    return result;
  }

  // Return formatted JSON response
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
