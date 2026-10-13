/**
 * @fileoverview Validation utilities for drop-the-raw application
 * Input validation and sanitization helpers
 */

/**
 * Validates email address format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  const trimmed = email.trim().toLowerCase();
  
  // Basic email validation
  if (!trimmed.includes('@') || !trimmed.includes('.')) return false;
  
  // Reject obviously invalid formats
  if (trimmed.startsWith('@') || trimmed.endsWith('@')) return false;
  if (trimmed.includes('..') || trimmed.includes('@.') || trimmed.includes('.@')) return false;
  
  // Length validation
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  
  return true;
}

/**
 * Sanitizes and normalizes email address
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email) {
  if (!validateEmail(email)) return '';
  return email.trim().toLowerCase();
}

/**
 * Validates request body for required fields
 * @param {Object} body - Request body object
 * @param {string[]} requiredFields - Array of required field names
 * @returns {{valid: boolean, missing: string[]}} Validation result
 */
export function validateRequiredFields(body, requiredFields) {
  const missing = [];
  
  for (const field of requiredFields) {
    if (!body || !body[field] || body[field].toString().trim() === '') {
      missing.push(field);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Creates standardized error response
 * @param {string} error - Error type
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {Object} Formatted error response
 */
export function createErrorResponse(error, message, status = 400) {
  return {
    response: { error, message },
    status
  };
}

/**
 * Creates standardized success response  
 * @param {string} message - Success message
 * @param {Object} data - Response data
 * @param {number} status - HTTP status code
 * @returns {Object} Formatted success response
 */
export function createSuccessResponse(message, data = {}, status = 200) {
  return {
    response: { success: true, message, ...data },
    status
  };
}