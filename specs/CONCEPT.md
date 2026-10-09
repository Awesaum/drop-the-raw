# CONCEPT: drop-the-raw

> *"One take. No script. Drop the raw into the booth and let the mastering house turn it into platinum."*

---

## 1. Core Philosophy: The KozarKane "One Take" Ethos
- **The Studio Operator (Local Creative Sandbox)**: 
  The operator functions like a freestyle artist in the booth (embodying the KozarKane "one take" mentality). They move fast, hack with raw energy, and produce unvarnished **"SHIT Code"**—spontaneous prototypes, unvetted vibe code, and rapid UI/UX flows. The operator never apologizes for dirty syntax, never gets bogged down in refactor loops, and never babysits a terminal.
- **The Engineering Squad (Headless Foundry)**: 
  The headless autonomous engineering team on GitHub Actions is the elite studio mastering house. Their explicit mandate: **Expect raw takes, never ask the artist to fix imports, and drop something amazing on the world.** 
  The backend squad ingests the raw commit, refactors the architecture, writes automated BDD test suites, enforces Zero Trust edge security, and stamps out enterprise-grade software.

---

## 2. Objective & Positioning
- **Core Pipeline**: An autonomous "Freestyle Studio to Headless Mastering House" software delivery pipeline where local creative vibe code is hardened, tested, and deployed headlessly on GitHub Actions using top-tier LLM intelligence on pure pay-as-you-go usage.
- **Audience & Distribution**: Serves as a flagship open-source starter kit and top-of-funnel lead magnet for the **Artificial Unintelligence** newsletter by Drew Saum. Demonstrates how to replace human IT labor and expensive $200/mo SaaS seat subscriptions with headless, wholesale AI workflows.

---

## 3. Boundaries & Constraints
- **Stack**: Antigravity IDE (Local Creative Sandbox), GitHub Actions, Kilo Code CLI / Claude Code CLI, OpenRouter, Cloudflare Workers/Pages, Wrangler.
- **Out of Scope**: 
  - Monthly per-seat SaaS copilot subscriptions.
  - Manual code review, syntax policing, or CLI debugging by the operator.
  - Fragile local database configurations or persistent self-hosted server infrastructure.
- **Repository & Account**: Strictly owned and published under GitHub account `Awesaum` (`https://github.com/Awesaum/drop-the-raw`).
- **Integrations**: OpenRouter (multi-model wholesale routing), Cloudflare (Edge Workers, D1 SQL, Turnstile, WAF, DNS), GitHub Actions CI/CD.

---

## 4. Core Data Entities
- **Handoff Gate**: Workflow state tracking status (`PENDING` / `APPROVED`) and execution mode (`local` / `remote`) in `specs/APPROVAL.md`.
- **Engineering Specification**: Self-contained BDD acceptance criteria (`Given/When/Then`) and data contracts governing headless qualification.
- **Newsletter Lead Capture**: 1-click forkable repo template with newsletter CTA in README and automated CI summary reports.

---

## 5. Key Workflows
1. **The One-Take Drop**: Operator builds and iterates visually in local creative sandbox (`npm run dev`). Once the concept feels right, operator marks `specs/APPROVAL.md` as `APPROVED` and runs `git push`—dropping the raw.
2. **Headless Mastering**: GitHub Actions triggers headless Kilo/Claude agents via OpenRouter wholesale tokens. The agents refactor dirty code, generate automated regression test suites, enforce Zero Trust controls (robots.txt, WAF, Turnstile), and bind Cloudflare edge services.
3. **World Release (Staging Drop)**: CI deploys the hardened application to a live Cloudflare Staging URL and posts a clean verification report.
4. **Subscriber Onboarding**: Newsletter readers fork the repo, provide two repository secrets (`OPENROUTER_API_KEY`, `CLOUDFLARE_API_TOKEN`), and inherit the full autonomous pipeline out-of-the-box.
