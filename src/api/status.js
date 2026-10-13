/**
 * @fileoverview API Status handlers - General project status and drop status
 */

import { createErrorResponse, createSuccessResponse } from '../utils/index.js';
import { parseRepoTarget } from '../services/repository.js';
import { getGitHubConfig } from '../services/auth.js';
import { createGitHubHeaders } from '../services/github.js';
import { getSubscriberCount } from './subscribe.js';
import { getEscalationCount } from './escalate.js';

/**
 * General project status endpoint
 * @param {Request} request
 * @param {Object} env
 * @returns {Promise<{response: Object, status: number}>}
 */
export async function handleStatus(request, env = {}) {
  const statusData = {
    project: 'drop-the-raw',
    ethos: 'One take. No script. Drop the raw into the booth and let the mastering house turn it into platinum.',
    newsletter: 'Artificial Unintelligence (https://company.help)',
    ready: true,
    subscribersCount: getSubscriberCount(),
    escalationsCount: getEscalationCount(),
    squad: ['Architect', 'Coder', 'Auditor', 'Hacker']
  };

  return createSuccessResponse(statusData, 200);
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