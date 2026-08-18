---
name: Deployment port binding
description: The port the production run command must bind to, and why the wrong port caused silent 500 health-check failures.
---

## Rule
The deployment run command must bind to **port 5238**, not 5000.

**Why:** `.replit` has `[[ports]] localPort = 5238, externalPort = 80`. Replit's deployment infrastructure reads this and forwards external HTTP traffic to port 5238. The health check also probes 5238. If the app binds to any other port (e.g. 5000), health checks get a 500 from the infrastructure placeholder — not from the app — and the deployment fails with "expected port never opened".

**How to apply:** The `[deployment]` run command in `.replit` must always include `ASPNETCORE_URLS=http://0.0.0.0:5238`. Local dev keeps port 5238 too (the Backend API workflow). Do not change the run command to a different port without also updating the `[[ports]]` block.
