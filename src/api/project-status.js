/**
 * @fileoverview General project status handler
 */

import { createSuccessResponse } from '../utils/index.js';
import { getSubscriberCount } from './subscribe.js';
import { getEscalationCount } from './escalate.js';

/**
 * General project status endpoint
 * @param {Request} request
 * @param {Object} env
 * @returns {Promise<{response: Object, status: number}>}
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

  return createSuccessResponse(statusData, 200);
}