/**
 * Core type definitions for drop-the-raw application
 */

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  source: string;
}

export interface Escalation {
  id: string;
  reason: string;
  context: Record<string, unknown>;
  timestamp: string;
  status: string;
}

export interface APIResponse<T = unknown> {
  success?: boolean;
  error?: string;
  message?: string;
  data?: T;
}

export interface SecurityHeaders {
  'Content-Type': string;
  'Access-Control-Allow-Origin': string;
  'Access-Control-Allow-Methods': string;
  'Access-Control-Allow-Headers': string;
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Strict-Transport-Security': string;
}

export interface GitHubConfig {
  token: string | null;
  owner: string;
  repo: string;
}

export interface RepoTarget {
  owner: string;
  repo: string;
  fullUrl: string;
}

export interface WorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  branch: string;
  commitSha: string;
  commitMessage: string;
  htmlUrl: string;
  createdAt: string;
}

export interface PullRequest {
  number: number;
  title: string;
  branch: string;
  author: string;
  htmlUrl: string;
  createdAt: string;
}