/**
 * @fileoverview Newsletter subscription handler for Artificial Unintelligence
 * Lead capture with Turnstile protection
 */

import { verifyTurnstile } from '../security/index.js';
import { validateEmail, sanitizeEmail, createErrorResponse, createSuccessResponse } from '../utils/index.js';

// In-memory storage for demo (replace with persistent storage)
const SUBSCRIBERS = [];

/**
 * Handles newsletter subscription requests
 * @param {Request} request - HTTP request object
 * @param {Object} env - Environment variables
 * @returns {Promise<{response: Object, status: number}>} Subscription result
 */
export async function handleSubscribe(request, env = {}) {
  try {
    const body = await request.json();
    const email = sanitizeEmail(body.email || '');
    const turnstileToken = request.headers.get('cf-turnstile-response') || body.turnstileToken || '';

    // Email validation
    if (!validateEmail(email)) {
      return createErrorResponse(
        'Validation Error',
        'A valid email address is required.',
        400
      );
    }

    // Turnstile verification (Zero Trust gate)
    const isBotFree = await verifyTurnstile(turnstileToken, env);
    if (!isBotFree) {
      return createErrorResponse(
        'Security Gate Rejected',
        'Cloudflare Turnstile token verification failed. Automated bots blocked.',
        403
      );
    }

    // Check for existing subscription
    const exists = SUBSCRIBERS.find(s => s.email === email);
    if (exists) {
      return createSuccessResponse(
        'You are already registered on the Drop The Raw / Artificial Unintelligence dispatch list.',
        { email },
        200
      );
    }

    // Create new subscriber
    const subscriber = {
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      email,
      subscribedAt: new Date().toISOString(),
      source: 'drop-the-raw-landing'
    };

    SUBSCRIBERS.push(subscriber);

    return createSuccessResponse(
      'Welcome to Artificial Unintelligence. Raw drop confirmed.',
      { subscriber: { id: subscriber.id, email: subscriber.email } },
      201
    );

  } catch (err) {
    return createErrorResponse(
      'Bad Request',
      err.message || 'Malformed JSON payload.',
      400
    );
  }
}

/**
 * Gets current subscriber count for status endpoint
 * @returns {number} Number of subscribers
 */
export function getSubscriberCount() {
  return SUBSCRIBERS.length;
}