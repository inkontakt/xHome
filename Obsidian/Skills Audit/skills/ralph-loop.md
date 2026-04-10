---
title: "ralph-loop"
tags:
  - skills
  - security-audit
  - onetab
audited: 2026-04-10
---

# ralph-loop

> [!note] About this snapshot
> Public `skills.sh` security snapshot dated **2026-04-10** in the parent audit. Install commands mirror the skills.sh **Installation** block (`npx skills add …`). This is **not** a manual source-code audit of the repository.

**Skill page (skills.sh):** [ralph-loop](https://skills.sh/cursor/plugins/ralph-loop)

**Upstream repository:** [cursor/plugins](https://github.com/cursor/plugins)

**Session match:** No

**Weekly installs (public):** `30 (skills.sh)`

> [!success] Overall security signal
> Snapshot: **Success** — clean pass across all three auditors at extraction time.

> [!abstract] Summary
> Iterative Ralph loop: repeat the same task prompt each turn with visible prior work (uses `.cursor/ralph/` state).

### INSTALLATION

---

```bash
npx skills add https://github.com/cursor/plugins --skill ralph-loop
```

### SECURITY AUDITS

---

Order: **Gen Agent Trust Hub** → **Socket** → **Snyk**.

| Audit | Result |
| :--- | :--- |
| Gen Agent Trust Hub | **PASS** [Details](https://skills.sh/cursor/plugins/ralph-loop/security/agent-trust-hub) |
| Socket | **PASS** [Details](https://skills.sh/cursor/plugins/ralph-loop/security/socket) |
| Snyk | **PASS** [Details](https://skills.sh/cursor/plugins/ralph-loop/security/snyk) |
