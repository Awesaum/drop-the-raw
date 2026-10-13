/**
 * @fileoverview Emergency escalation handler for solo founder operations
 * Routes critical issues directly to Drew Saum (Founder/CEO)
 */

import { createErrorResponse, createSuccessResponse } from '../utils/index.js';

// In-memory escalation storage
const ESCALATIONS = [];

/**
 * Handles emergency escalation requests
 * @param {Request} request - HTTP request object
 * @param {Object} env - Environment variables
 * @returns {Promise<{response: Object, status: number}>} Escalation result
 */
export async function handleEscalate(request, env = {}) {
  try {
    const body = await request.json();
    const reason = body.reason || 'General emergency escalation';
    const context = body.context || {};

    // Create escalation ticket
    const escalation = {
      id: `esc_${Date.now()}`,
      reason,
      context,
      timestamp: new Date().toISOString(),
      status: 'DISPATCHED_TO_FOUNDER'
    };

    ESCALATIONS.push(escalation);

    return createSuccessResponse(
      'Escalation ticket registered. Routed directly to Drew Saum (Founder/CEO).',
      { escalation },
      200
    );

  } catch (err) {
    return createErrorResponse(
      'Bad Request',
      'Invalid escalation payload.',
      400
    );
  }
}

/**
 * Gets current escalation count for status endpoint
 * @returns {number} Number of escalations
 */
export function getEscalationCount() {
  return ESCALATIONS.length;
}