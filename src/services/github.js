/**
 * @fileoverview GitHub API Client - Core GitHub operations
 */

/**
 * Creates authenticated GitHub API headers
 * @param {string} token - GitHub token
 * @returns {Object} Headers object
 */
export function createGitHubHeaders(token) {
  const headers = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'drop-the-raw-studio/1.0',
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Dispatches a GitHub Actions workflow
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} branch - Target branch
 * @param {string} token - GitHub token
 * @returns {Promise<Response>}
 */
export async function dispatchWorkflow(owner, repo, branch, token) {
  const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/mastering.yml/dispatches`;
  const headers = createGitHubHeaders(token);
  
  return await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      ref: branch,
      inputs: { branch }
    })
  });
}

/**
 * Gets the SHA of the main branch
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} token - GitHub token
 * @returns {Promise<string|null>}
 */
export async function getMainBranchSha(owner, repo, token) {
  const headers = createGitHubHeaders(token);
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/main`, { headers });
  
  if (!response.ok) return null;
  
  const data = await response.json();
  return data.object?.sha || null;
}