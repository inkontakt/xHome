---
title: "continual-learning"
tags:
  - skills
  - security-audit
  - onetab
audited: 2026-04-10
---

# continual-learning

> [!note] About this snapshot
> Public `skills.sh` security snapshot dated **2026-04-10** in the parent audit. Install commands mirror the skills.sh **Installation** block (`npx skills add …`). This is **not** a manual source-code audit of the repository.

**Skill page (skills.sh):** [continual-learning](https://skills.sh/cursor/plugins/continual-learning)

**Upstream repository:** [cursor/plugins](https://github.com/cursor/plugins)

**Session match:** No

**Weekly installs (public):** `57 (skills.sh)`

> [!success] Overall security signal
> Snapshot: **Success** — clean pass across all three auditors at extraction time.

> [!abstract] Summary
> Keep AGENTS.md current by delegating the memory update flow to one subagent (orchestration-only parent skill).

### INSTALLATION

---

```bash
npx skills add https://github.com/cursor/plugins --skill continual-learning
```

### SECURITY AUDITS

---

Order: **Gen Agent Trust Hub** → **Socket** → **Snyk**.

| Audit | Result |
| :--- | :--- |
| Gen Agent Trust Hub | **PASS** [Details](https://skills.sh/cursor/plugins/continual-learning/security/agent-trust-hub) |
| Socket | **PASS** [Details](https://skills.sh/cursor/plugins/continual-learning/security/socket) |
| Snyk | **PASS** [Details](https://skills.sh/cursor/plugins/continual-learning/security/snyk) |
