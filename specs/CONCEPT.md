# CONCEPT: drop-the-raw

## 1. Objective & Positioning
- **Core Pipeline**: An autonomous "Creative Studio to Headless Foundry" software delivery pipeline where local creative prototyping is hardened and tested headlessly on GitHub Actions using top-tier LLM intelligence on pure pay-as-you-go usage.
- **Audience & Distribution**: Serves as a flagship open-source starter kit and top-of-funnel lead magnet for the **Artificial Unintelligence** newsletter by Drew Saum. Demonstrates how to replace human IT labor and expensive $200/mo SaaS seat subscriptions with headless, wholesale AI workflows.

## 2. Boundaries & Constraints
- **Stack**: Antigravity IDE (Local Creative Sandbox), GitHub Actions, Kilo Code CLI / Claude Code CLI, OpenRouter, Cloudflare Workers/Pages, Wrangler.
- **Out of Scope**: Monthly per-seat SaaS subscriptions, manual code review/CLI debugging by operator, persistent self-hosted server infrastructure.
- **Repository & Account**: Strictly owned and published under GitHub account `Awesaum` (`https://github.com/Awesaum/drop-the-raw`).
- **Integrations**: OpenRouter (multi-model wholesale routing), Cloudflare (Edge Workers, D1, Turnstile, WAF, DNS), GitHub Actions CI/CD.

## 3. Core Data Entities
- **Handoff Gate**: Workflow state tracking status (`PENDING` / `APPROVED`) and execution mode (`local` / `remote`) in `specs/APPROVAL.md`.
- **Engineering Specification**: Self-contained BDD acceptance criteria (`Given/When/Then`) and data contracts governing headless qualification.
- **Newsletter Lead Capture**: 1-click forkable repo template with newsletter CTA in README and automated CI summary reports.

## 4. Key Workflows
1. Operator -> Iterates on UI/UX in local creative sandbox (`npm run dev`) -> Marks `specs/APPROVAL.md` as `APPROVED` and commits.
2. GitHub Actions -> Triggers headless Kilo/Claude agent via OpenRouter -> Hardens code, passes automated regression test suites, and deploys to Cloudflare staging.
3. Subscriber Onboarding -> Reader forks repo, sets two repository secrets (`OPENROUTER_API_KEY`, `CLOUDFLARE_API_TOKEN`), and runs autonomous pipeline out-of-the-box.
