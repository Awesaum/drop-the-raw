/**
 * @fileoverview WAF (Web Application Firewall) protection middleware
 */

import { createErrorResponse } from '../utils/index.js';

/**
 * Rate limiting storage (in-memory for prototype)
 * In production, this should use KV storage or Redis
 */
const rateLimitStore = new Map();

/**
 * Suspicious patterns for request analysis
 */
const suspiciousPatterns = [
  /(?:union|select|insert|update|delete|drop|create|alter|exec|script|javascript|vbscript)/i,
  /<script[^>]*>.*?<\/script>/gi,
  /(?:\.\.\/|\.\.\\)/g,
  /(?:etc\/passwd|boot\.ini|win\.ini)/i,
  /(?:base64_decode|eval\(|system\()/i
];

/**
 * Validates request against WAF rules
 * @param {Request} request - HTTP request
 * @returns {Promise<Object|null>} Error response or null if valid
 */
export async function validateWAFRules(request) {
  const clientIP = request.headers.get('CF-Connecting-IP') || 
                   request.headers.get('X-Forwarded-For') || 
                   'unknown';
  
  // Rate limiting (100 requests per minute per IP)
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window
  
  if (!rateLimitStore.has(clientIP)) {
    rateLimitStore.set(clientIP, []);
  }
  
  const requests = rateLimitStore.get(clientIP);
  const recentRequests = requests.filter(time => time > windowStart);
  
  if (recentRequests.length >= 100) {
    return createErrorResponse(
      'Rate Limit Exceeded',
      'Too many requests. Please wait before trying again.',
      429
    );
  }
  
  recentRequests.push(now);
  rateLimitStore.set(clientIP, recentRequests);
  
  // Check request body for suspicious patterns
  if (request.body && request.method === 'POST') {
    try {
      const body = await request.clone().text();
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(body)) {
          return createErrorResponse(
            'Security Violation',
            'Request blocked by WAF protection.',
            403
          );
        }
      }
    } catch (err) {
      // Ignore body parsing errors for WAF
    }
  }
  
  return null; // Valid request
}