/**
 * @fileoverview Authentication middleware - Operator key validation
 */

/**
 * Extracts and validates operator authentication
 * @param {Request} request - HTTP request object
 * @param {Object} body - Parsed request body
 * @param {Object} env - Environment variables
 * @returns {{isValid: boolean, error?: string}}
 */
export function validateOperatorAuth(request, body, env) {
  const providedKey = (body.operatorKey || request.headers.get('x-operator-key') || '').trim();
  const validKey = env.OPERATOR_KEY || process.env.OPERATOR_KEY || 'raw-drop-operator-2026';
  
  if (!providedKey || providedKey !== validKey) {
    return {
      isValid: false,
      error: 'Invalid or missing operator passcode. Access denied.'
    };
  }
  
  return { isValid: true };
}

/**
 * Extracts GitHub configuration from environment
 * @param {Object} env - Environment variables
 * @returns {{token: string|null, owner: string, repo: string}}
 */
export function getGitHubConfig(env) {
  return {
    token: env.GITHUB_TOKEN || process.env.GITHUB_TOKEN || null,
    owner: env.GITHUB_OWNER || process.env.GITHUB_OWNER || 'Awesaum',
    repo: env.GITHUB_REPO || process.env.GITHUB_REPO || 'drop-the-raw'
  };
}