# ResumeReady — Claude Code Context

## What this is
AI resume builder for Grade 9–12 students applying to their first job (Tim Hortons, Walmart, McDonald's, etc). Live at myresumeready.ca. Built to make money — simple product, real Stripe payments.

## Repo structure
```
resumeready/
├── api/
│   └── generate.js   ← Vercel serverless function — proxies Claude API, MUST stay in api/
├── app.html          ← The builder (3-step form → AI resume)
├── index.html        ← Landing page
├── privacy.html      ← Privacy Policy (routed via vercel.json)
├── terms.html        ← Terms of Service (routed via vercel.json)
├── package.json
└── vercel.json       ← Routes /app, /privacy, /terms
```

## Stack
- Hosting: Vercel (free tier) — auto-deploys on every push to main
- Backend: api/generate.js — serverless, keeps ANTHROPIC_API_KEY secure
- Frontend: vanilla HTML/CSS/JS — no framework, intentional
- AI: claude-sonnet-4-20250514, temperature: 0, max_tokens: 2000
- Payments: Stripe (live, real money)

## Stripe links
- Starter $9: https://buy.stripe.com/dRmaEXc0YeHEcfT16u9Ve04 → /app
- Pro $19: https://buy.stripe.com/eVq3cv9SQ0QO4Nr4iG9Ve02 → /app?plan=pro

## Support email
hello@myresumeready.ca

## Current version: v15

## Core product rules (NON-NEGOTIABLE)
1. Believability > impressiveness — resumes must sound like a real student wrote them
2. No fake counters, fake testimonials, fake scarcity — ever
3. No feature bloat — default answer to new features is no
4. Mobile-first — most users are on phones

## AI prompt rules (hardcoded in api/generate.js system prompt + app.html user prompt)
- temperature: 0 — kills non-determinism
- System prompt has 13 rules + few-shot example (RESUME_SYSTEM_PROMPT)
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
Environment variable: ANTHROPIC_API_KEY (set in Vercel → Settings → Environment Variables)

## Analytics
Plausible script is included in index.html and app.html. Edwin needs to create an account at plausible.io and add the domain to activate tracking. Data-domain is currently set to myresumeready.ca — update to custom domain once purchased.

## What's next (priority order)
1. Set up Plausible account at plausible.io — script is live, just needs account activation
2. Get 3 real testimonials from classmates — give free access, ask for one honest sentence
3. Buy resumeready.co on Namecheap ($12) — every audit flagged the vercel.app domain
4. Set up custom email (hello@resumeready.co) via Cloudflare email routing — free
5. Update Plausible data-domain once custom domain is live
6. Submit to AI directories (free traffic): theresanaiforthat.com, futurepedia.io, toolify.ai
7. DM 30 classmates: "yo are you trying to get a job? i built something that writes your resume in 60 sec — $9, refund if it sucks"
