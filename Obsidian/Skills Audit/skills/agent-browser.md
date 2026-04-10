---
title: "agent-browser"
tags:
  - skills
  - security-audit
  - onetab
audited: 2026-04-10
---

# agent-browser

> [!note] About this snapshot
> Public `skills.sh` security snapshot dated **2026-04-10** in the parent audit. Install commands mirror the skills.sh **Installation** block (`npx skills add …`). This is **not** a manual source-code audit of the repository.

**Skill page (skills.sh):** [agent-browser](https://skills.sh/vercel-labs/agent-browser/agent-browser)

**Upstream repository:** [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser)

**Session match:** No

**Weekly installs (public):** `171.7K`

> [!danger] Overall security signal
> Snapshot: **Danger** — at least one failure or high-risk signal; review before installing.

> [!abstract] Summary
> Fast, persistent browser automation with session continuity across sequential agent commands.

### INSTALLATION

---

```bash
npx skills add https://github.com/vercel-labs/agent-browser --skill agent-browser
```

### SECURITY AUDITS

---

Order: **Gen Agent Trust Hub** → **Socket** → **Snyk**.

| Audit | Result |
| :--- | :--- |
| Gen Agent Trust Hub | **PASS** [Details](https://skills.sh/vercel-labs/agent-browser/agent-browser/security/agent-trust-hub) |
| Socket | **WARN** [Details](https://skills.sh/vercel-labs/agent-browser/agent-browser/security/socket) |
| Snyk | **FAIL** [Details](https://skills.sh/vercel-labs/agent-browser/agent-browser/security/snyk) |
