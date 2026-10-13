/**
 * @fileoverview Type definitions for drop-the-raw application
 * Core TypeScript-style interfaces for Cloudflare Workers runtime
 */

/**
 * @typedef {Object} Subscriber
 * @property {string} id - Unique subscriber identifier
 * @property {string} email - Email address
 * @property {string} subscribedAt - ISO timestamp
 * @property {string} source - Registration source
 */

/**
 * @typedef {Object} Escalation
 * @property {string} id - Unique escalation identifier  
 * @property {string} reason - Escalation reason
 * @property {Object} context - Additional context data
 * @property {string} timestamp - ISO timestamp
 * @property {string} status - Escalation status
 */

/**
 * @typedef {Object} APIResponse
 * @property {boolean} [success] - Success indicator
 * @property {string} [error] - Error type
 * @property {string} [message] - Response message
 * @property {*} [data] - Response data payload
 */

/**
 * @typedef {Object} SecurityHeaders
 * @property {string} Content-Type - Response content type
 * @property {string} Access-Control-Allow-Origin - CORS origin
 * @property {string} Access-Control-Allow-Methods - CORS methods
 * @property {string} Access-Control-Allow-Headers - CORS headers
 * @property {string} X-Content-Type-Options - Security header
 * @property {string} X-Frame-Options - Security header
 */

export {
  // Types are exported as JSDoc comments for runtime compatibility
};