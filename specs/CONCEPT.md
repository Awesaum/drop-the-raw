# CONCEPT: headless-coding

## 1. Objective
- Build an autonomous "Creative Studio to Headless Foundry" software delivery pipeline where local creative prototyping is hardened and tested headlessly on GitHub Actions using top-tier LLM intelligence on pure pay-as-you-go usage.

## 2. Boundaries & Constraints
- **Stack**: Antigravity IDE (Local Creative Sandbox), GitHub Actions, Kilo Code CLI / Claude Code CLI, OpenRouter, Cloudflare Workers/Pages, Wrangler.
- **Out of Scope**: Monthly per-seat SaaS subscriptions, manual code review/CLI debugging by operator, persistent self-hosted server infrastructure.
- **Repository & Account**: Strictly owned and published under GitHub account `Awesaum` (`https://github.com/Awesaum/headless-coding`).
- **Integrations**: OpenRouter (multi-model wholesale routing), Cloudflare (Edge Workers, D1, Turnstile, WAF, DNS), GitHub Actions CI/CD.

## 3. Core Data Entities
- **Handoff Gate**: Workflow state tracking status (`PENDING` / `APPROVED`) and execution mode (`local` / `remote`) in `specs/APPROVAL.md`.
- **Engineering Specification**: Self-contained BDD acceptance criteria (`Given/When/Then`) and data contracts governing headless qualification.

## 4. Key Workflows
1. Operator -> Iterates on UI/UX in local creative sandbox (`npm run dev`) -> Marks `specs/APPROVAL.md` as `APPROVED` and commits.
2. GitHub Actions -> Triggers headless Kilo/Claude agent via OpenRouter -> Hardens code, passes automated regression test suites, and deploys to Cloudflare staging.
