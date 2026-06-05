# ResumeReady — Claude Code Context

## What this is
AI resume builder for Grade 9–12 students applying to their first job (Tim Hortons, Walmart, McDonald's, etc). Live at resumeready-five.vercel.app. Built to make money — simple product, real Stripe payments.

## Repo structure
```
resumeready/
├── api/
│   ├── generate.js         ← Vercel serverless function — resume generation
│   └── stripe-webhook.js   ← Vercel serverless function — Stripe event handler
├── app.html                ← The builder (3-step form → AI resume)
├── index.html              ← Landing page
├── privacy.html            ← Privacy Policy
├── terms.html              ← Terms of Service
├── CLAUDE.md               ← This file (excluded from deploy via .vercelignore)
├── package.json            ← Has stripe dependency
└── vercel.json             ← Routes /app, /privacy, /terms + security headers
```

## Stack
- Hosting: Vercel (free tier) — auto-deploys on every push to main
- Backend: api/generate.js + api/stripe-webhook.js — both CommonJS
- Storage: Vercel KV (Upstash) — rate limit state, paid session cache, refund flags
- Frontend: vanilla HTML/CSS/JS — no framework, intentional
- AI: claude-sonnet-4-6, temperature: 0, max_tokens: 1500, prompt caching enabled
- Payments: Stripe (live, real money)

## CRITICAL: api/ functions must be CommonJS
Both files use `module.exports` — NOT `export default`. Vercel requires this for the standard Node runtime in /api functions. Do not convert.

## Environment variables (Vercel → Settings → Environment Variables)
- `ANTHROPIC_API_KEY` — Anthropic Console API key
- `STRIPE_SECRET_KEY` — Stripe `sk_live_...` for session lookups
- `STRIPE_WEBHOOK_SECRET` — `whsec_...` from Stripe webhook endpoint settings
- `KV_REST_API_URL` — auto-set by Vercel KV integration
- `KV_REST_API_TOKEN` — auto-set by Vercel KV integration

## Payment + abuse protection flow
1. Customer pays via Stripe checkout link
2. Stripe redirects to /app.html?session={CHECKOUT_SESSION_ID}
3. Stripe fires `checkout.session.completed` webhook → api/stripe-webhook.js stores session in KV
4. Frontend sends session ID with every /api/generate request
5. generate.js validates against KV (fast) or Stripe API (fallback)
6. Per-session rate limits: 1 request per 5s (burst), 8 generations per week total
7. On refund/dispute: Stripe fires `charge.refunded` or `charge.dispute.created` → webhook marks session as refunded → generate.js rejects future requests
8. Required env vars: see list above

## Stripe links
- Starter $9: https://buy.stripe.com/dRmaEXc0YeHEcfT16u9Ve04
  Success URL: https://resumeready-five.vercel.app/app.html?session={CHECKOUT_SESSION_ID}
- Pro $19: https://buy.stripe.com/eVq3cv9SQ0QO4Nr4iG9Ve02
  Success URL: https://resumeready-five.vercel.app/app.html?plan=pro&session={CHECKOUT_SESSION_ID}

## Stripe webhook
Endpoint: `/api/stripe-webhook`
Events: `checkout.session.completed`, `charge.refunded`, `charge.dispute.created`
Signing secret: `STRIPE_WEBHOOK_SECRET` env var

## KV key conventions
- `sess:{cs_xxx}` — { paid, refunded, email, amount, plan, paid_at } per session, 30-day TTL
- `pi:{pi_xxx}` — cross-reference payment_intent → session_id, 30-day TTL
- `rlb:{cs_xxx}` — burst rate limit flag, 5s TTL
- `gens:{cs_xxx}` — generation counter per session, 7-day TTL
- `log:paid` — list of "{ts}|{sess}|{amount}|{email}" entries
- `log:refunded` — list of "{ts}|{sess}|{reason}" entries

## Support email
hello@myresumeready.ca

## Current version: v21

## Core product rules (NON-NEGOTIABLE)
1. Believability > impressiveness — resumes must sound like a real student wrote them
2. No fake counters, fake testimonials, fake scarcity — ever
3. No feature bloat — default answer to new features is no
4. Mobile-first — most users are on phones

## AI prompt rules (hardcoded in api/generate.js system prompts + app.html user prompt)
- temperature: 0 — kills non-determinism
- Resume prompt has 14 rules + few-shot example (RESUME_SYSTEM_PROMPT)
- Separate COVER_SYSTEM_PROMPT for cover letters
- type param routes to correct prompt
- VERBATIM SKILLS, VERBATIM AVAILABILITY, PRESERVE PERSONAL REFS, etc — see file

## Known non-bugs (do not fix)
- localStorage errors in console = Claude in Chrome extension. Real users unaffected.

## Fixed bugs (do not re-introduce)
- ES module export default → CommonJS module.exports
- BETA coupon failing payment validation → accept 'no_payment_required' status
- generate.js missing from /api folder → must live at /api/generate.js
- Cover letter XSS → escapeHtml() on all student data injected into innerHTML
- Template literal injection → sanitize() on all v() calls in prompts
- Stripe success URLs missing {CHECKOUT_SESSION_ID} → both links updated
- Session ID infinite reuse → 8-generation cap per session via KV
- Refunded customer keeps access → webhook marks refunded, generate.js rejects

## QA persona — Maya Chen
Use this to test after any change:
- Name: Maya Chen | City: Ottawa, ON | Email: maya.chen2009@gmail.com
- Phone: (613) 555-0284 | School: Gloucester High School | Grade: Grade 10
- Bilingual: YES — "basic French, learned in school"
- Job: Cashier at Shoppers Drug Mart
- Availability: after school weekdays, all day Saturday and Sunday
- Why: I walk past this Shoppers every day on my way home
- Skills: good with people, responsible, fast learner, I help my mom run her small business so I know how to handle money
- Activities: volleyball (school team, 2 years), babysit my neighbour's kids every Friday, student council secretary

## Deployment
Push to main → Vercel auto-deploys. Check Vercel dashboard for errors.

## Analytics
Plausible script in index.html and app.html with data-domain="myresumeready.ca".
(Note: domain not yet purchased — analytics will need domain reconfig once domain is set up.)
