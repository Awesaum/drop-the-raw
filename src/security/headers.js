/**
 * @fileoverview Enhanced Zero Trust security headers with WAF protection
 */

/**
 * Comprehensive Zero Trust security headers with WAF protection
 * @returns {Object} Enhanced security headers object
 */
export function getSecurityHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, cf-turnstile-response, Authorization',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.github.com; frame-src challenges.cloudflare.com; object-src 'none'; base-uri 'self'",
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
}

/**
 * Enhanced AI scraper protection robots.txt content
 * @returns {string} Comprehensive robots.txt blocking AI crawlers and scrapers
 */
export function getRobotsTxt() {
  return `# AI Scraping Protection Gate (Zero Trust)
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: Baiduspider
Disallow: /

User-agent: Meta-ExternalAgent
Disallow: /

User-agent: FacebookBot
Disallow: /

User-agent: PiplBot
Disallow: /

User-agent: *
Allow: /`;
}