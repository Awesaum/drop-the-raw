/**
 * @fileoverview drop-the-raw - Protected Drop Dispatcher API
 * Enforces non-main safety gate and triggers the Headless Mastering Foundry
 */

import { createErrorResponse, createSuccessResponse } from '../utils/index.js';

/**
 * Dispatches a headless mastering run on a non-main staging/raw branch
 * @param {Request} request
 * @param {Object} env
 * @returns {Promise<{response: Object, status: number}>}
 */
export async function handleDrop(request, env = {}) {
  try {
    const body = await request.json();
    const branch = (body.branch || '').trim();
    const providedKey = (body.operatorKey || request.headers.get('x-operator-key') || '').trim();
    const validKey = env.OPERATOR_KEY || process.env.OPERATOR_KEY || 'raw-drop-operator-2026';

    // 1. Operator Passcode Authentication Guard
    if (!providedKey || providedKey !== validKey) {
      return createErrorResponse(
        'Authentication Failure',
        'Invalid or missing operator passcode. Access denied.',
        401
      );
    }

    // 2. Branch Input Validation
    if (!branch) {
      return createErrorResponse(
        'Validation Error',
        'Target staging/raw branch is required (e.g., "staging" or "raw/feature-auth").',
        400
      );
    }

    // 3. Strict Non-Main Circuit Breaker
    if (branch === 'main' || branch === 'master' || branch.toLowerCase().endsWith('/main')) {
      return createErrorResponse(
        'Safety Gate Violation',
        'CRITICAL: Refusing to master directly on MAIN branch. Raw code must be submitted via an isolated staging or raw branch (e.g. "staging", "raw/vibe-1").',
        400
      );
    }

    const token = env.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
    const owner = env.GITHUB_OWNER || process.env.GITHUB_OWNER || 'Awesaum';
    const repo = env.GITHUB_REPO || process.env.GITHUB_REPO || 'drop-the-raw';

    if (!token) {
      return createErrorResponse(
        'Configuration Error',
        'GITHUB_TOKEN not configured in environment bindings.',
        500
      );
    }

    // 4. Dispatch GitHub Actions Workflow
    const dispatchUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/mastering.yml/dispatches`;
    const ghRes = await fetch(dispatchUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'drop-the-raw-studio/1.0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ref: branch,
        inputs: { branch }
      })
    });

    if (!ghRes.ok) {
      const errText = await ghRes.text();
      return createErrorResponse(
        'GitHub Dispatch Failed',
        `GitHub API returned ${ghRes.status}: ${errText}. Ensure branch "${branch}" exists in the repository.`,
        ghRes.status
      );
    }

    return createSuccessResponse(
      {
        dispatched: true,
        branch,
        repository: `${owner}/${repo}`,
        message: `Headless Mastering Squad dispatched on branch "${branch}". Changes will be qualified with tests and opened as a Pull Request targeting main.`
      },
      202
    );
  } catch (err) {
    return createErrorResponse(
      'Malformed Request',
      err.message || 'Invalid JSON payload received.',
      400
    );
  }
}

/**
 * Queries active mastering runs and open Pull Requests for operator review
 * @param {Request} request
 * @param {Object} env
 * @returns {Promise<{response: Object, status: number}>}
 */
export async function handleDropStatus(request, env = {}) {
  try {
    const token = env.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
    const owner = env.GITHUB_OWNER || process.env.GITHUB_OWNER || 'Awesaum';
    const repo = env.GITHUB_REPO || process.env.GITHUB_REPO || 'drop-the-raw';

    const headers = {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'drop-the-raw-studio/1.0'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Fetch recent workflow runs
    const runsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=5`, { headers });
    const runsData = runsRes.ok ? await runsRes.json() : { workflow_runs: [] };

    // Fetch open pull requests
    const prsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=5`, { headers });
    const prsData = prsRes.ok ? await prsRes.json() : [];

    const runs = (runsData.workflow_runs || []).map(r => ({
      id: r.id,
      name: r.name,
      status: r.status,
      conclusion: r.conclusion,
      branch: r.head_branch,
      commitSha: r.head_sha?.slice(0, 7),
      commitMessage: r.head_commit?.message?.split('\n')[0] || '',
      htmlUrl: r.html_url,
      createdAt: r.created_at
    }));

    const pullRequests = (prsData || []).map(pr => ({
      number: pr.number,
      title: pr.title,
      branch: pr.head?.ref,
      author: pr.user?.login,
      htmlUrl: pr.html_url,
      createdAt: pr.created_at
    }));

    return createSuccessResponse({
      repository: `${owner}/${repo}`,
      runs,
      pullRequests,
      nonMainSafetyEnforced: true
    }, 200);
  } catch (err) {
    return createErrorResponse('Status Query Failed', err.message, 500);
  }
}
