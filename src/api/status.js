/**
 * @fileoverview API status handler for pipeline metadata
 * Project status and headless squad information
 */

import { getSubscriberCount } from './subscribe.js';
import { getEscalationCount } from './escalate.js';
import { createSuccessResponse } from '../utils/index.js';

/**
 * Handles API status requests
 * @param {Request} request - HTTP request object
 * @param {Object} env - Environment variables
 * @returns {Promise<{response: Object, status: number}>} Status information
 */
export async function handleStatus(request, env = {}) {
  const statusData = {
    project: 'drop-the-raw',
    ethos: 'One take. No script. Drop the raw into the booth and let the mastering house turn it into platinum.',
    newsletter: 'Artificial Unintelligence (https://company.help)',
    ready: true,
    subscribersCount: getSubscriberCount(),
    escalationsCount: getEscalationCount(),
    squad: ['Architect', 'Coder', 'Auditor', 'Hacker']
  };

  return createSuccessResponse('Status retrieved successfully', statusData, 200);
}