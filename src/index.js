// drop-the-raw: Unfiltered vibe code in. Mastered production software out.
// Core Edge Application & Lead Capture Handler for Artificial Unintelligence
// Written in One-Take SHIT Code style for the Headless Mastering Foundry to refactor & harden.

const SUBSCRIBERS = [];
const ESCALATIONS = [];

/**
 * Validates Cloudflare Turnstile token stub
 * TODO(mastering): Bind to Cloudflare secret and verify with challenges.cloudflare.com/turnstile/v0/siteverify
 */
async function verifyTurnstile(token) {
  if (!token) return false;
  // Local/staging bypass stub for development
  if (token === 'staging-turnstile-token' || token.startsWith('turnstile_')) {
    return true;
  }
  return token.length > 10;
}

/**
 * Primary edge fetch handler for Cloudflare Workers / Node runtime
 */
export async function handleRequest(request, env = {}) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Set default security & CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, cf-turnstile-response',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY'
  };

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  // Health check endpoint
  if (path === '/health' && method === 'GET') {
    return new Response(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'drop-the-raw',
      author: 'Drew Saum (Awesaum)',
      mode: 'edge'
    }), { status: 200, headers });
  }

  // Pipeline Status & Spec metadata
  if (path === '/api/status' && method === 'GET') {
    return new Response(JSON.stringify({
      project: 'drop-the-raw',
      ethos: 'One take. No script. Drop the raw into the booth and let the mastering house turn it into platinum.',
      newsletter: 'Artificial Unintelligence (https://company.help)',
      ready: true,
      subscribersCount: SUBSCRIBERS.length,
      escalationsCount: ESCALATIONS.length,
      squad: ['Architect', 'Coder', 'Auditor', 'Hacker']
    }), { status: 200, headers });
  }

  // Newsletter lead capture endpoint for Artificial Unintelligence
  if (path === '/api/subscribe' && method === 'POST') {
    try {
      const body = await request.json();
      const email = (body.email || '').trim().toLowerCase();
      const turnstileToken = request.headers.get('cf-turnstile-response') || body.turnstileToken || '';

      // Validation
      if (!email || !email.includes('@') || !email.includes('.')) {
        return new Response(JSON.stringify({
          error: 'Validation Error',
          message: 'A valid email address is required.'
        }), { status: 400, headers });
      }

      const isBotFree = await verifyTurnstile(turnstileToken);
      if (!isBotFree) {
        return new Response(JSON.stringify({
          error: 'Security Gate Rejected',
          message: 'Cloudflare Turnstile token verification failed. Automated bots blocked.'
        }), { status: 403, headers });
      }

      // Check duplicate
      const exists = SUBSCRIBERS.find(s => s.email === email);
      if (exists) {
        return new Response(JSON.stringify({
          success: true,
          message: 'You are already registered on the Drop The Raw / Artificial Unintelligence dispatch list.',
          email
        }), { status: 200, headers });
      }

      const subscriber = {
        id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        email,
        subscribedAt: new Date().toISOString(),
        source: 'drop-the-raw-landing'
      };

      SUBSCRIBERS.push(subscriber);

      return new Response(JSON.stringify({
        success: true,
        message: 'Welcome to Artificial Unintelligence. Raw drop confirmed.',
        subscriber: { id: subscriber.id, email: subscriber.email }
      }), { status: 201, headers });
    } catch (err) {
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: err.message || 'Malformed JSON payload.'
      }), { status: 400, headers });
    }
  }

  // Escalate to Human IT Support Endpoint (Solo Builder Safety Protocol)
  if (path === '/api/escalate' && method === 'POST') {
    try {
      const body = await request.json();
      const reason = body.reason || 'General emergency escalation';
      const context = body.context || {};

      const escalation = {
        id: `esc_${Date.now()}`,
        reason,
        context,
        timestamp: new Date().toISOString(),
        status: 'DISPATCHED_TO_FOUNDER'
      };

      ESCALATIONS.push(escalation);

      return new Response(JSON.stringify({
        success: true,
        message: 'Escalation ticket registered. Routed directly to Drew Saum (Founder/CEO).',
        escalation
      }), { status: 200, headers });
    } catch (err) {
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: 'Invalid escalation payload.'
      }), { status: 400, headers });
    }
  }

  // AI scraper defense block on robots.txt
  if (path === '/robots.txt' && method === 'GET') {
    const robotsTxt = `User-agent: *\nDisallow:\n\nUser-agent: GPTBot\nDisallow: /\n\nUser-agent: ClaudeBot\nDisallow: /\n\nUser-agent: Bytespider\nDisallow: /\n\nUser-agent: CCBot\nDisallow: /\n`;
    return new Response(robotsTxt, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  // Fallback 404
  return new Response(JSON.stringify({
    error: 'Not Found',
    path,
    message: 'drop-the-raw endpoint not found. Use /health or /api/status.'
  }), { status: 404, headers });
}

// Default export for Cloudflare Workers
export default {
  fetch(request, env, ctx) {
    return handleRequest(request, env);
  }
};
