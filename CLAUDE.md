# ResumeReady — Claude Code Context

## What this is
AI resume builder for Grade 9–12 students applying to their first job (Tim Hortons, Walmart, McDonald's, etc ). Live at resumeready-five.vercel.app (myresumeready.ca pending). Built to make money — simple product, real Stripe payments.

## Repo structure
```
resumeready/
├── api/
│   └── generate.js   ← Vercel serverless function — CommonJS, MUST stay in api/
├── app.html          ← The builder (3-step form → AI resume)
├── index.html        ← Landing page
├── privacy.html      ← Privacy Policy (routed via vercel.json)
├── terms.html        ← Terms of Service (routed via vercel.json)
├── CLAUDE.md         ← This file
├── package.json      ← Required — must exist, no "type": "module"
└── vercel.json       ← Routes /app, /privacy, /terms
```

## Stack
- Hosting: Vercel (free tier) — auto-deploys on every push to main
- Backend: api/generate.js — CommonJS serverless function, keeps API keys secure
- Frontend: vanilla HTML/CSS/JS — no framework, intentional
- AI: claude-sonnet-4-6, temperature: 0, max_tokens: 1000
- Payments: Stripe (live, real money)

## CRITICAL: generate.js must be CommonJS
generate.js uses `module.exports = async function handler(req, res)` — NOT `export default`.
Do NOT convert to ES module syntax. The Vercel free tier requires CommonJS for serverless functions unless explicitly configured otherwise.

## API configuration (generate.js)
- Model: claude-sonnet-4-6
- max_tokens: 1000
- temperature: 0
- Prompt caching: enabled via cache_control (no beta header needed — caching is GA)
- Request timeout: 8000ms (AbortController — fires before Vercel free tier 10s hard limit)
- Input validation: type check, empty check, 4000 char max, allowlist on type param
- Error cases handled: overloaded_error, rate_limit_error, invalid_api_key, AbortError, 403 paywall

## Payment gate (generate.js + app.html)
- Every /api/generate request requires a valid Stripe session ID
- Session ID comes from URL param: /app.html?session={CHECKOUT_SESSION_ID}
- generate.js calls Stripe API to verify session.payment_status === 'paid'
- Invalid/missing session → 403 response → app.html redirects to homepage
- app.html shows paywall screen if no session param in URL
- Required env vars: ANTHROPIC_API_KEY, STRIPE_SECRET_KEY (set in Vercel → Settings → Environment Variables)

## Stripe links
- Starter $9: https://buy.stripe.com/dRmaEXc0YeHEcfT16u9Ve04
  Success URL: https://resumeready-five.vercel.app/app.html?session={CHECKOUT_SESSION_ID}
- Pro $19: https://buy.stripe.com/eVq3cv9SQ0QO4Nr4iG9Ve02
  Success URL: https://resumeready-five.vercel.app/app.html?plan=pro&session={CHECKOUT_SESSION_ID}
- IMPORTANT: {CHECKOUT_SESSION_ID} is a Stripe variable — type it exactly like that in the success URL

## Support email
hello@myresumeready.ca

## Current version: v18

## Core product rules (NON-NEGOTIABLE)
1. Believability > impressiveness — resumes must sound like a real student wrote them
2. No fake counters, fake testimonials, fake scarcity — ever
3. No feature bloat — default answer to new features is no
4. Mobile-first — most users are on phones

## AI prompt rules (hardcoded in api/generate.js system prompt + app.html user prompt)
- temperature: 0 — kills non-determinism
- System prompt has 14 rules + few-shot example (RESUME_SYSTEM_PROMPT)
- Separate COVER_SYSTEM_PROMPT for cover letters
- type param ('resume' or 'cover') routes to correct system prompt
- VERBATIM SKILLS: never add words to what student wrote
- VERBATIM AVAILABILITY: "Saturday and Sunday" can never become "weekends"
- PRESERVE PERSONAL REFS: "mom's small business" never becomes "family business"
- COMPOUND SENTENCE = ONE BULLET: "so" → "and", every clause needs subject
- PHONE: omit entirely if blank, never invent
- NO GRADUATION YEAR: never calculate or invent one
- LANGUAGES: separate JSON array, never in skills, preserve exact words including qualifiers
- NO ACADEMIC INVENTION: no GPA, honour roll, awards unless student wrote them

## sanitize() in app.html
All v() calls in the resume and cover letter prompts are wrapped with sanitize() to prevent backtick injection in template literals. Never remove these.

## escapeHtml() in app.html
Used before injecting any student data into innerHTML (cover letter preview, PDF). Never bypass this.

## Resume JSON structure (what api/generate.js returns)
```json
{
  "name": "string",
  "contact": "City | email | phone (omit phone if not provided)",
  "availability": "verbatim from student",
  "objective": "1-2 sentences: 'Seeking X at Y.' + student's why verbatim. ONE sentence only if why is blank.",
  "skills": ["verbatim from skills input only"],
  "languages": ["exact student description if bilingual, else []"],
  "education": { "school": "string", "grade": "Grade X", "highlights": [] },
  "activities": ["from activities input only"]
}
```

## Known non-bugs (do not fix)
- localStorage errors in console: Claude in Chrome extension environment. Real users unaffected.
- Non-deterministic output: was an issue, fixed with temperature: 0
- First→third person conversion in skills: accepted as resume convention, disclosed in helper text

## Fixed bugs (do not re-introduce)
- Start Over crash → null checks on all elements
- Hallucinated phone numbers → prompt rule 1
- "basic French" upgraded → prompt rule + system prompt
- Graduation year invented → removed from JSON schema
- Skills embellished → Rule 2 + Rule 2B in prompt
- Non-deterministic output → temperature: 0 in generate.js
- Template literal injection → sanitize() on all v() calls in prompts
- Full Pack $39 → removed entirely (features were not built)
- Privacy/Terms 404 → vercel.json rewrites + actual pages added
- Cover letter XSS risk → escapeHtml() on all student data injected into innerHTML
- Vercel maxDuration error → removed functions block (free tier doesn't support it)
- /app accessible without payment → Stripe session gate added
- "Check your email for your access link" → removed false claim from paywall screen
- Blur overlay "$10 more" vs button "$19" → both now say "Upgrade to Pro — $19"
- ES module export default → converted to CommonJS module.exports (fixes Vercel 404)
- Dead domain redirect → fixed to resumeready-five.vercel.app

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
Environment variables (Vercel → Settings → Environment Variables):
- ANTHROPIC_API_KEY
- STRIPE_SECRET_KEY (sk_live_...)

## Analytics
Plausible script is included in index.html and app.html with data-domain="myresumeready.ca".
Plausible account must be registered with domain "myresumeready.ca" (not the Vercel URL).

## What's next (priority order)
1. ✅ STRIPE_SECRET_KEY in Vercel env vars
2. ✅ Stripe payment link success URLs with {CHECKOUT_SESSION_ID}
3. ✅ Plausible account created
4. Fix Plausible site domain → change from resumeready-five.vercel.app to myresumeready.ca in Plausible settings
5. Create og-image.png (1200×630) in Canva → add to repo root
6. Get 3 real testimonials from classmates — give free access, ask for one honest sentence
7. Buy myresumeready.ca domain and point to Vercel
8. Submit to AI directories: theresanaiforthat.com, futurepedia.io, toolify.ai
9. DM 30 classmates: "yo are you trying to get a job? i built something that writes your resume in 60 sec — $9, refund if it sucks"
