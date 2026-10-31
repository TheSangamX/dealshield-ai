# CLAUDE.md — DealShield AI

> **Single source of truth for code generation.** Read this file before creating or modifying any code in this repository. If code and this document disagree, update one of them so they agree again.

---

## 1. Project Overview

**DealShield AI** — A Chrome Extension for real-time sales negotiation inside Gmail.

The extension runs inside Gmail, reads the email thread the user is working on, and sends it to a backend that uses Groq (GPT-OSS 120B) to give negotiation guidance in real time: suggested replies, warnings about concessions, pricing and objection handling.

### High-level flow

```
Gmail (DOM)
   │  content script reads the thread / compose box
   ▼
Chrome Extension (React UI in sidebar/popup)
   │  HTTPS + Supabase JWT
   ▼
Backend API (Node.js / Express)
   │  ├── verifies the user with Supabase Auth
   │  ├── reads and writes data in Supabase (Postgres)
   │  └── calls the Groq API
   ▼
Response → Extension UI → user inserts the suggestion into Gmail
```

### Ground rules

- **The extension never calls the Groq API directly.** All AI calls go through the backend so the API key stays server-side.
- The extension authenticates with Supabase and sends the user's access token (JWT) to the backend on every request.
- Secrets (`GROQ_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) live only in `backend/.env`. Never commit them and never bundle them into the extension.

---

## 2. Tech Stack

| Layer           | Technology                                   | Notes                                                    |
| --------------- | -------------------------------------------- | -------------------------------------------------------- |
| Frontend        | **React**                                    | Functional components and hooks only                     |
| Build tool      | **Vite**                                     | Multi-entry build (popup, sidebar, content, background)  |
| Styling         | **Tailwind CSS**                             | Use the design tokens in §3; no hard-coded hex in JSX    |
| Extension       | **Chrome Manifest V3**                       | Service-worker background, content scripts on Gmail      |
| Backend         | **Node.js + Express**                        | REST API, JSON in/out                                    |
| Database / Auth | **Supabase**                                 | Postgres + Supabase Auth; Row Level Security (RLS) on    |
| AI              | **Groq API**, `openai/gpt-oss-120b`           | Called from the backend only via `groq-sdk`              |

The Groq model ID is read from `GROQ_MODEL` (default `openai/gpt-oss-120b`), never hard-coded in route files. Responses use strict `json_schema` output generated from the Zod schema, so any replacement model must support strict structured outputs on Groq (`llama-3.3-70b-versatile` does not, and is not enabled on this account).

Every analysis is two Groq calls: the strategies, then a fact-check pass (`verify.prompt.js`, toggle with `VERIFY_DRAFTS`) that rewrites anything the email doesn't support (seller deadlines, price changes, start dates, durations) into `[placeholders]`. If the fact-check call fails, the unchecked drafts are returned and a warning is logged. The current Groq free tier allows 8,000 tokens/minute, roughly one analysis per minute in total.

---

## 3. Design Token Architecture

All colors come from these tokens. They are defined once in `extension/tailwind.config.js` and mirrored as CSS variables in `extension/src/styles/tokens.css`.

| Token         | Name    | Hex       | Tailwind class examples                    | Use for                                          |
| ------------- | ------- | --------- | ------------------------------------------ | ------------------------------------------------ |
| `primary`     | Indigo  | `#4F46E5` | `bg-primary`, `text-primary`, `ring-primary` | Main actions, brand accents, active states, links |
| `secondary`   | Emerald | `#10B981` | `bg-secondary`, `text-secondary`           | Success, "good deal" signals, positive guidance  |
| `background`  | Slate   | `#F8FAFC` | `bg-background`                            | App and panel backgrounds                        |

### Tailwind config

```js
// extension/tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#10B981',
        background: '#F8FAFC',
      },
    },
  },
  plugins: [],
};
```

### CSS variables

```css
/* extension/src/styles/tokens.css */
:root {
  --ds-primary: #4F46E5;
  --ds-secondary: #10B981;
  --ds-background: #F8FAFC;
}
```

### Token rules

- Use token classes (`bg-primary`), never raw hex values (`bg-[#4F46E5]`) in components.
- Neutral text and borders use Tailwind's built-in `slate-*` scale.
- UI injected into Gmail must be isolated (Shadow DOM) so Gmail's styles and ours don't affect each other.

---

## 4. Folder Structure

```
dealshield-ai/
├── CLAUDE.md                      # This file — single source of truth
├── README.md                      # Setup, tests, billing, deploy and publishing steps
├── render.yaml                    # Render Blueprint for the backend
├── docs/
│   ├── privacy-policy.md          # Privacy policy (host publicly for the Chrome Web Store)
│   └── chrome-web-store.md        # Store listing copy, permission justifications, submit checklist
├── .gitignore / .gitattributes
│
├── extension/                     # Chrome Extension (React + Vite + Tailwind, MV3)
│   ├── public/
│   │   ├── manifest.json          # Manifest V3 definition (backend origin is added at build time)
│   │   └── icons/
│   │       ├── icon16.png
│   │       ├── icon48.png
│   │       └── icon128.png
│   ├── src/
│   │   ├── background/
│   │   │   └── service-worker.js  # MV3 background: messaging, auth token refresh, API relay
│   │   ├── content/
│   │   │   ├── index.jsx          # Content-script entry, injected into mail.google.com
│   │   │   ├── gmail-observer.js  # MutationObserver: detects open threads / compose windows
│   │   │   ├── gmail-parser.js    # Extracts sender, subject, thread text from Gmail DOM
│   │   │   ├── gmail-composer.js  # Inserts a draft into Gmail's reply box (opens Reply if needed)
│   │   │   └── inject.jsx         # Mounts the React sidebar inside a Shadow DOM root
│   │   ├── popup/
│   │   │   ├── index.html
│   │   │   ├── main.jsx
│   │   │   ├── Popup.jsx          # Active email, analyze, plan usage, settings, account footer
│   │   │   ├── AuthPanel.jsx      # Email + password sign-in / sign-up (Supabase Auth)
│   │   │   ├── PlanCard.jsx       # Upgrade to Pro (Razorpay checkout) / cancel at period end
│   │   │   └── HistoryCard.jsx    # Recent analyses: reopen saved strategies, delete
│   │   ├── sidebar/
│   │   │   ├── Sidebar.jsx        # Main in-Gmail negotiation panel
│   │   │   └── sections/
│   │   │       ├── DealSummary.jsx
│   │   │       └── Strategies.jsx # Tabs: Firm offer / Trade-off / Urgency drafts, Copy + Insert
│   │   ├── components/            # Reusable UI primitives (token-styled)
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Logo.jsx           # Shield brand mark (solid / glass variants)
│   │   │   ├── Spinner.jsx
│   │   │   └── Toggle.jsx         # Accessible on/off switch
│   │   ├── hooks/
│   │   │   ├── useAccount.js      # Plan + monthly usage from GET /api/me
│   │   │   ├── useAuth.js         # Supabase session, signIn / signUp / signOut
│   │   │   ├── useCopyToClipboard.js
│   │   │   ├── useDeals.js        # History from /api/deals: list, open, delete
│   │   │   ├── useGmailThread.js  # Current thread context from the content script
│   │   │   └── useNegotiation.js  # Calls the backend for analysis / suggestions
│   │   ├── lib/
│   │   │   ├── supabase.js        # Supabase client (anon key only)
│   │   │   ├── api.js             # Backend calls via the background worker (analyze, me, deals, billing)
│   │   │   └── messaging.js       # chrome.runtime message helpers + message type constants
│   │   ├── styles/
│   │   │   ├── tokens.css         # Design-token CSS variables (§3)
│   │   │   └── index.css          # Tailwind directives (@tailwind base/components/utilities)
│   │   └── utils/
│   │       └── constants.js
│   ├── scripts/package.js         # npm run package → dealshield-extension-v<version>.zip (blocks localhost builds)
│   ├── index.html                 # Dev-only popup preview (`npm run dev:ui`, sample data)
│   ├── package.json
│   ├── vite.config.js             # Two passes: popup + background (ESM), then content (IIFE)
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example               # VITE_API_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
│                                  # (.env.production for the store build)
│
└── backend/                       # API server (Node.js + Express)
    ├── src/
    │   ├── server.js              # Starts the HTTP server
    │   ├── app.js                 # Express app: middleware, raw-body Razorpay webhook, routes, errors
    │   ├── config/
    │   │   ├── env.js             # Loads and validates environment variables
    │   │   ├── supabase.js        # Supabase admin client (service role key)
    │   │   ├── groq.js            # Lazily created Groq client
    │   │   └── razorpay.js        # Razorpay client (null until keys are set)
    │   ├── routes/
    │   │   ├── index.js           # Mounts all routers under /api
    │   │   ├── health.routes.js   # GET  /api/health
    │   │   ├── me.routes.js       # GET  /api/me      — current user, plan, monthly usage
    │   │   ├── analyze.routes.js  # POST /api/analyze — analyze an email thread
    │   │   ├── deals.routes.js    # GET/DELETE /api/deals — analysis history
    │   │   └── billing.routes.js  # POST /api/billing/subscribe, /cancel (webhook lives in app.js)
    │   ├── controllers/
    │   │   ├── analyze.controller.js
    │   │   ├── deals.controller.js
    │   │   └── billing.controller.js
    │   ├── services/
    │   │   ├── groq.service.js    # All Groq API calls + output schema
    │   │   ├── deals.service.js   # Supabase reads/writes for analysis history
    │   │   ├── billing.service.js # Razorpay subscriptions + webhook → subscriptions table
    │   │   ├── subscription.service.js # Plan limits + account status (plan, used, remaining)
    │   │   └── usage.service.js   # Records / counts usage_events per month
    │   ├── prompts/
    │   │   ├── analyze.prompt.js  # System prompt + template for thread analysis
    │   │   └── verify.prompt.js   # Fact-check pass: rewrites claims the email does not support into [placeholders]
    │   ├── middleware/
    │   │   ├── auth.js            # Verifies the Supabase JWT, sets req.user
    │   │   ├── rateLimit.js       # Per-user (or IP) limit on AI routes
    │   │   ├── subscription.js    # requireQuota: 402 QUOTA_EXCEEDED when the monthly limit is used
    │   │   ├── validate.js        # Request body validation (Zod)
    │   │   └── errorHandler.js
    │   └── utils/
    │       └── logger.js
    ├── supabase/
    │   └── migrations/            # SQL migrations (tables + RLS policies), applied in order
    │       ├── 20261031000000_auth_subscriptions.sql # profiles, subscriptions, usage_events + new-user trigger
    │       └── 20261031090000_analyses_razorpay.sql  # analyses (history) + Razorpay columns on subscriptions
    ├── scripts/test-analyze.js     # npm run test:analyze — health, 401, and a real 200 analyze via Groq
    ├── package.json
    └── .env.example               # PORT, GROQ_*, VERIFY_DRAFTS, SUPABASE_*, FREE_MONTHLY_ANALYSES,
                                   # RAZORPAY_KEY_ID/_SECRET/_PLAN_ID/_WEBHOOK_SECRET, ALLOWED_ORIGINS
```

### Where code goes

| If you are writing…                         | Put it in…                                   |
| ------------------------------------------- | -------------------------------------------- |
| Code that reads or changes the Gmail DOM    | `extension/src/content/`                     |
| Chrome API calls (storage, tabs, messaging) | `extension/src/background/` or `lib/messaging.js` |
| A reusable UI element                       | `extension/src/components/`                  |
| Calls from the extension to the backend     | `extension/src/lib/api.js` (via hooks)       |
| A new API endpoint                          | `backend/src/routes/` → `controllers/` → `services/` |
| Anything that calls Groq                    | `backend/src/services/groq.service.js`       |
| A prompt                                    | `backend/src/prompts/`                       |
| A database schema change                    | `backend/supabase/migrations/`               |

---

## 5. Conventions

- **Language:** JavaScript (ES modules, `"type": "module"`) in both packages.
- **Naming:** React components `PascalCase.jsx`; hooks `useThing.js`; backend files `name.layer.js` (e.g. `deals.controller.js`).
- **Backend layering:** routes only wire URLs → controllers handle req/res → services hold business logic and external calls. Controllers never call Supabase or Groq directly.
- **API responses:** `{ data: ... }` on success, `{ error: { message, code } }` on failure, with the right HTTP status.
- **`POST /api/analyze` contract:** requires a signed-in user (`Authorization: Bearer <supabase jwt>`) with quota left. Body `{ emailText }` or `{ thread }` (the extension's captured thread), plus optional `context`. Returns `{ data: { firmOffer, creativeTradeoff, urgencyDraft }, meta: { analysisId } }`; each strategy has `headline`, `psychology`, `draft`, and `creativeTradeoff` also has `give` / `get`. Only successful analyses count toward usage and are saved to history.
- **History (`/api/deals`):** `GET /api/deals` lists the 20 most recent analyses (`id, subject, counterpart_name, counterpart_email, created_at`), `GET /api/deals/:id` adds `result`, `DELETE /api/deals/:id` removes one. The email body is never stored, only the subject, the counterpart and the generated strategies.
- **Plans:** `free` gets `FREE_MONTHLY_ANALYSES` per calendar month (UTC), `pro` with `status = 'active'` is unlimited. Plans live in `public.subscriptions` and are written only by the backend (service role); clients can only read their own rows (RLS).
- **Billing (Razorpay):** `POST /api/billing/subscribe` creates a subscription on `RAZORPAY_PLAN_ID` (Pro, ₹499/month INR; `/api/me` returns its price as `proPriceLabel`) and returns `{ checkoutUrl }`, Razorpay's hosted page, which the popup opens in a tab. The plan changes only from the signed `POST /api/billing/webhook` (`subscription.*` events; raw body, verified with `RAZORPAY_WEBHOOK_SECRET`): `active` → Pro, `pending`/`halted`/`paused` → past_due (Free limits), `cancelled`/`completed`/`expired` → Free. `POST /api/billing/cancel` cancels at the end of the period (`razorpay_status = 'cancelling'`, Pro stays until then). Without Razorpay keys, billing routes return 503 and the popup hides the upgrade card (`account.billingEnabled`).
- **Manifest V3:** minimal permissions; `host_permissions` is `https://mail.google.com/*` in `public/manifest.json`, and the build adds the `VITE_API_URL` origin. No remote code execution. Gmail selectors avoid aria-labels and tooltips (Gmail localizes them) where a class or attribute works.
- **Env vars:** extension vars use the `VITE_` prefix and are public. Anything secret belongs in the backend.
