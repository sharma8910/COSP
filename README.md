# Child Online Safety Platform

A Chrome extension that enforces a parent's website rules on a child's device in real time — backed by a full-stack system: a Node/Express API, a React dashboard, Redis caching, and a Python AI worker that classifies unlabeled domains using local embeddings, with no LLM API calls and no token costs.

Built as a hands-on learning project to go deep on browser extension development, caching strategy, system design, and applied ML, rather than to ship a polished product.

**Live:** https://cosp-1.onrender.com/

---

## 🧩 The Extension — the core of the system

**Live API:** https://cosp-server-9n60.onrender.com

The Chrome Manifest V3 extension is what actually runs on the child's device. It watches every site the child navigates to, checks it against the parent's rules (via the API below), and blocks disallowed sites immediately with a clear block page — not a generic browser error.

**Key design points:**
- **Fail-closed.** If the extension can't reach the API at all (network down, server unreachable), it blocks the site rather than defaulting to allow — the safer failure mode for a child-safety tool.
- **Client-side caching.** Decisions are cached in `chrome.storage.local` so repeat visits to the same site don't need a network round-trip at all, not even to hit a cache on the server.
- **Clear, reason-specific block pages.** A child sees *why* a site was blocked — a parent's explicit rule, an AI classification, or a temporary connectivity issue — not just a dead end.

**Try it:** `chrome://extensions` → enable Developer Mode → **Load unpacked** → select the `extension/` folder. Open the extension's options page, enter the API URL (`https://cosp-server-9n60.onrender.com` for the live API, or `http://localhost:4000` for local dev) and a device token generated from the dashboard.

---

## What it does, end to end

A parent registers, adds a child profile, registers that child's device, and sets allow/block rules for specific domains from a web dashboard. The extension enforces those rules live. If a site has no explicit rule, a Python worker classifies it (gambling, violence, adult content, drugs, phishing, etc. vs. safe) using sentence embeddings compared against labeled examples, so unknown sites get a reasonable, explainable decision instead of silently defaulting to "allow." Every blocked attempt is logged, and the parent can see an activity feed on the dashboard.

## Architecture

```
Parent ──► React Dashboard ──► Node/Express API ──► MongoDB Atlas
                                      │                (Users, Children,
Child's Browser ──► Chrome Extension ─┤                 Devices, Policies,
                                      │                 ActivityEvents)
                                      │
                                      ├──► Redis Cloud (decision caching,
                                      │     invalidated on policy changes)
                                      │
                                      └──► Python/FastAPI AI Worker
                                            (sentence-transformers +
                                             ChromaDB, local-only)
```

**Decision priority on every domain check:**
1. Explicit allowlist rule → ALLOW
2. Explicit blocklist rule → BLOCK
3. No rule exists → ask the AI worker to classify the domain
4. AI worker unreachable → default to ALLOW (documented tradeoff, see below)

## Tech stack

| Component | Stack |
|---|---|
| **Extension** | **Chrome Manifest V3, vanilla JS** |
| Backend API | Node.js, Express, MongoDB (Atlas), Redis (Redis Cloud) |
| Dashboard | React, React Router, Vite, Tailwind CSS |
| AI worker | Python, FastAPI, `sentence-transformers` (`all-MiniLM-L6-v2`), ChromaDB |
| Deployment | Render (API + dashboard), local-only (AI worker — see below) |

## Repo structure

```
extension/        Chrome Manifest V3 extension — the core of the system
server/           Node/Express API
dashboard/        React parent dashboard
ai-worker/        Python FastAPI classification service
```

Each of `server/`, `dashboard/`, and `ai-worker/` is independently deployable.

## Running it locally

### Extension
`chrome://extensions` → Developer Mode → **Load unpacked** → select `extension/`. Enter the API URL and a device token in the options page.

### Server
```bash
cd server
npm install
# create .env with MONGODB_URI, REDIS_URL, JWT_SECRET, COOKIE_NAME
node src/server.js
```

### Dashboard
```bash
cd dashboard
npm install
npm run dev
```

### AI worker
```bash
cd ai-worker
uv sync
uv run uvicorn main:app --reload --port 8000
```

## Notable engineering decisions

- **Redis caching with explicit invalidation.** Policy decisions are cached per `(device, domain)` for 5 minutes. Adding or deleting a policy immediately invalidates the relevant cache keys across all of that child's devices, rather than waiting out the TTL — this was a real bug caught during testing (a newly-blocked site stayed accessible for minutes without it).

- **Fail-closed extension design.** If the extension can't reach the API, it blocks the site rather than allowing it by default — the opposite default from the AI worker's own uncertainty handling, a deliberate asymmetry: "can't verify at all" is treated more cautiously than "verified, but the AI wasn't confident."

- **Local embeddings instead of an LLM API for classification.** Deliberately chosen over calling a hosted LLM for every unknown domain — no per-request cost, no rate limits, and classification runs entirely on CPU via a small (~90MB) sentence-transformer model compared against a labeled example set in a local vector database (ChromaDB).

- **Two-layer caching.** The extension caches decisions client-side to avoid network round-trips entirely on repeat visits; Redis caches server-side to avoid redundant MongoDB queries across devices. They solve different bottlenecks (network latency vs. database load) and were deliberately kept separate.

## Known limitations

- **The AI worker is not deployed.** It depends on PyTorch + a loaded embedding model, which exceeds Render's free-tier 512MB RAM limit. It runs and is fully tested locally; the deployed API gracefully falls back to `ALLOW` with a distinct `ai_help_unavailable` reason when it can't reach the worker, rather than failing the request.
- **Render's free tier spins down after 15 minutes of inactivity.** The first request after idle time can take 30–60 seconds (cold start).
- **The extension is not published to the Chrome Web Store** — it's loaded locally via Developer Mode.
- **MV3 blocking has a brief "flash"** — since Manifest V3 doesn't support synchronous request blocking, a blocked page can briefly start loading before the extension redirects to the block page. A `declarativeNetRequest`-based approach would eliminate this, noted as a future improvement.

## What's next

- Migrate blocking to `declarativeNetRequest` for instant blocks with no flash
- Permanent MongoDB caching of AI classifications (currently only cached in Redis for 5 minutes, despite a domain's category rarely changing)
- Chrome Web Store submission
