/**
 * @fileoverview Core application handlers for drop-the-raw
 * Health checks, robots.txt, and basic application services
 */

import { getRobotsTxt } from '../security/index.js';
import { createSuccessResponse, createErrorResponse } from '../utils/index.js';

/**
 * Handles health check requests
 * @param {Request} request - HTTP request object
 * @param {Object} env - Environment variables
 * @returns {Promise<{response: Object, status: number}>} Health status
 */
export async function handleHealth(request, env = {}) {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'drop-the-raw',
    author: 'Drew Saum (Awesaum)',
    mode: 'edge'
  };

  return createSuccessResponse('Service is healthy', healthData, 200);
}

/**
 * Handles robots.txt requests with AI scraper defense
 * @param {Request} request - HTTP request object  
 * @param {Object} env - Environment variables
 * @returns {Promise<Response>} Robots.txt response
 */
export async function handleRobots(request, env = {}) {
  const robotsTxt = getRobotsTxt();
  
  return new Response(robotsTxt, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  });
}

/**
 * Handles 404 Not Found responses
 * @param {string} path - Requested path
 * @returns {{response: Object, status: number}} 404 response
 */
export function handle404(path) {
  return createErrorResponse(
    'Not Found',
    `drop-the-raw endpoint not found. Use /health or /api/status. Requested: ${path}`,
    404
  );
}