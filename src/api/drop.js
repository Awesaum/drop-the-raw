/**
 * @fileoverview drop-the-raw - Protected Drop Dispatcher API
 * Enforces non-main safety gate and triggers the Headless Mastering Foundry
 */

import { createErrorResponse, createSuccessResponse } from '../utils/index.js';

/**
 * Parses GitHub repository URL or owner/repo string into clean owner and repo components
 * @param {string} inputRepo - e.g. "https://github.com/Awesaum/drop-the-raw" or "Awesaum/drop-the-raw"
 * @param {string} defaultOwner
 * @param {string} defaultRepo
 */
export function parseRepoTarget(inputRepo, defaultOwner = 'Awesaum', defaultRepo = 'drop-the-raw') {
  if (!inputRepo || typeof inputRepo !== 'string') {
    return { owner: defaultOwner, repo: defaultRepo, fullUrl: `https://github.com/${defaultOwner}/${defaultRepo}` };
  }
  const clean = inputRepo.trim()
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/^\/+|\/+$/g, '');
  const parts = clean.split('/');
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return { 
      owner: parts[0], 
      repo: parts[1], 
      fullUrl: `https://github.com/${parts[0]}/${parts[1]}` 
    };
  }
  return { owner: defaultOwner, repo: defaultRepo, fullUrl: `https://github.com/${defaultOwner}/${defaultRepo}` };
}

/**
 * Dispatches a headless mastering run on a non-main staging/raw branch
 * @param {Request} request
 * @param {Object} env
 * @returns {Promise<{response: Object, status: number}>}
 */
export async function handleDrop(request, env = {}) {
  try {
    const body = await request.json();
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

    // 2. Branch Resolution (Defaults to 'raw')
    const branch = (body.branch && typeof body.branch === 'string' && body.branch.trim()) 
      ? body.branch.trim() 
      : 'raw';

    // 3. Strict Non-Main Circuit Breaker
    if (branch === 'main' || branch === 'master' || branch.toLowerCase().endsWith('/main')) {
      return createErrorResponse(
        'Safety Gate Violation',
        'CRITICAL: Refusing to master directly on MAIN branch. Raw code must be submitted via an isolated staging or raw branch (e.g. "staging", "raw/vibe-1").',
        400
      );
    }

    const token = env.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
    const defaultOwner = env.GITHUB_OWNER || process.env.GITHUB_OWNER || 'Awesaum';
    const defaultRepo = env.GITHUB_REPO || process.env.GITHUB_REPO || 'drop-the-raw';
    const { owner, repo, fullUrl } = parseRepoTarget(body.repoUrl, defaultOwner, defaultRepo);

    if (!token) {
      return createErrorResponse(
        'Configuration Error',
        'GITHUB_TOKEN not configured in environment bindings.',
        500
      );
    }

    // 4. Dispatch GitHub Actions Workflow
    const dispatchUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/mastering.yml/dispatches`;
    const dispatchHeaders = {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'drop-the-raw-studio/1.0',
      'Content-Type': 'application/json'
    };

    let ghRes = await fetch(dispatchUrl, {
      method: 'POST',
      headers: dispatchHeaders,
      body: JSON.stringify({
        ref: branch,
        inputs: { branch }
      })
    });

    // If branch doesn't exist yet on remote, auto-create it from main and retry
    if (!ghRes.ok && ghRes.status === 422) {
      const errText = await ghRes.clone().text();
      if (errText.includes('No ref found for')) {
        const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/main`, {
          headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'drop-the-raw-studio/1.0'
          }
        });

        if (refRes.ok) {
          const refData = await refRes.json();
          const mainSha = refData.object?.sha;
          if (mainSha) {
            const createRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
              method: 'POST',
              headers: dispatchHeaders,
              body: JSON.stringify({
                ref: `refs/heads/${branch}`,
                sha: mainSha
              })
            });

            if (createRefRes.ok) {
              ghRes = await fetch(dispatchUrl, {
                method: 'POST',
                headers: dispatchHeaders,
                body: JSON.stringify({
                  ref: branch,
                  inputs: { branch }
                })
              });
            }
          }
        }
      }
    }

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
    const url = new URL(request.url);
    const paramRepo = url.searchParams.get('repoUrl') || '';
    const defaultOwner = env.GITHUB_OWNER || process.env.GITHUB_OWNER || 'Awesaum';
    const defaultRepo = env.GITHUB_REPO || process.env.GITHUB_REPO || 'drop-the-raw';
    const { owner, repo, fullUrl } = parseRepoTarget(paramRepo, defaultOwner, defaultRepo);

    const token = env.GITHUB_TOKEN || process.env.GITHUB_TOKEN;

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
