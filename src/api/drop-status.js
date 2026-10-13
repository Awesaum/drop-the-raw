/**
 * @fileoverview Drop status query handler for workflows and PRs
 */

import { createErrorResponse, createSuccessResponse } from '../utils/index.js';
import { parseRepoTarget } from '../services/repository.js';
import { getGitHubConfig } from '../services/auth.js';
import { createGitHubHeaders } from '../services/github.js';

/**
 * Transforms workflow run data for client consumption
 * @param {Array} workflowRuns - Raw GitHub workflow runs
 * @returns {Array} Formatted run data
 */
function formatWorkflowRuns(workflowRuns) {
  return (workflowRuns || []).map(r => ({
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
}

/**
 * Transforms pull request data for client consumption
 * @param {Array} pullRequests - Raw GitHub pull requests
 * @returns {Array} Formatted PR data
 */
function formatPullRequests(pullRequests) {
  return (pullRequests || []).map(pr => ({
    number: pr.number,
    title: pr.title,
    branch: pr.head?.ref,
    author: pr.user?.login,
    htmlUrl: pr.html_url,
    createdAt: pr.created_at
  }));
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
    const { token, owner: defaultOwner, repo: defaultRepo } = getGitHubConfig(env);
    const { owner, repo } = parseRepoTarget(paramRepo, defaultOwner, defaultRepo);
    
    const headers = createGitHubHeaders(token);
    
    // Fetch recent workflow runs and open PRs in parallel
    const [runsRes, prsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=5`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=5`, { headers })
    ]);
    
    const runsData = runsRes.ok ? await runsRes.json() : { workflow_runs: [] };
    const prsData = prsRes.ok ? await prsRes.json() : [];
    
    return createSuccessResponse({
      repository: `${owner}/${repo}`,
      runs: formatWorkflowRuns(runsData.workflow_runs),
      pullRequests: formatPullRequests(prsData),
      nonMainSafetyEnforced: true
    }, 200);
  } catch (err) {
    return createErrorResponse('Status Query Failed', err.message, 500);
  }
}