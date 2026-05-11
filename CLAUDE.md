# ResumeReady — Claude Code Context

## What this is
AI resume builder for Grade 9–12 students applying to their first job (Tim Hortons, Walmart, McDonald's, etc). Live at resumeready-five.vercel.app. Built to make money — simple product, real Stripe payments.

## Repo structure
```
resumeready/
├── api/
│   └── generate.js   ← Vercel serverless function — proxies Claude API, MUST stay in api/
├── app.html          ← The builder (3-step form → AI resume)
├── index.html        ← Landing page
├── package.json
└── vercel.json
```

## Stack
- Hosting: Vercel (free tier) — auto-deploys on every push to main
- Backend: api/generate.js — serverless, keeps ANTHROPIC_API_KEY secure
- Frontend: vanilla HTML/CSS/JS — no framework, intentional
- AI: claude-sonnet-4-20250514, temperature: 0, max_tokens: 1500
- Payments: Stripe (live, real money)

## Stripe links
- Starter $9: https://buy.stripe.com/dRmaEXc0YeHEcfT16u9Ve04 → /app
- Pro $19: https://buy.stripe.com/eVq3cv9SQ0QO4Nr4iG9Ve02 → /app?plan=pro
- Full Pack $39: https://buy.stripe.com/dRmfZh0ig7fc0xb16u9Ve03 → /app?plan=full

## Support email
resumeready.help@gmail.com

## Current version: v14

## Core product rules (NON-NEGOTIABLE)
1. Believability > impressiveness — resumes must sound like a real student wrote them
2. No fake counters, fake testimonials, fake scarcity — ever
3. No feature bloat — default answer to new features is no
4. Mobile-first — most users are on phones

## AI prompt rules (hardcoded in generate.js + app.html prompt)
- temperature: 0 — kills non-determinism
- VERBATIM SKILLS: never add words to what student wrote
- VERBATIM AVAILABILITY: "Saturday and Sunday" can never become "weekends"
- PRESERVE PERSONAL REFS: "mom's small business" never becomes "family business"
- NO FIRST-PERSON → THIRD-PERSON: "I help my mom..." stays personal, never "Experience handling..."
- PHONE: omit entirely if blank, never invent
- NO GRADUATION YEAR: never calculate or invent one
- LANGUAGES: separate JSON array, never in skills, preserve exact words including qualifiers
- NO ACADEMIC INVENTION: no GPA, honour roll, awards unless student wrote them

## Resume JSON structure (what generate.js returns)
```json
{
  "name": "string",
  "contact": "City | email | phone (omit phone if not provided)",
  "availability": "verbatim from student",
  "objective": "2 sentences, names company, uses student's own words only",
  "skills": ["verbatim from skills input only"],
  "languages": ["exact student description if bilingual, else []"],
  "education": { "school": "string", "grade": "Grade X", "highlights": [] },
  "activities": ["from activities input only"]
}
```

## Known non-bugs (do not fix)
- localStorage errors in console: Claude in Chrome extension environment. Real users unaffected.
- Non-deterministic output: was an issue, fixed with temperature: 0

## Fixed bugs (do not re-introduce)
- Start Over crash → null checks on all elements
- Hallucinated phone numbers → prompt rule 1
- "basic French" upgraded → prompt rule + system prompt
- Graduation year invented → removed from JSON schema
- Skills embellished → Rule 2 + Rule 2B in prompt
- Non-deterministic output → temperature: 0 in generate.js

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

## What's next (priority order)
1. Get 3 real testimonials from classmates — give free access, ask for one honest sentence
2. Buy resumeready.co on Namecheap ($12) — every audit flagged the vercel.app domain
3. Submit to AI directories (free traffic): theresanaiforthat.com, futurepedia.io, toolify.ai
4. DM 30 classmates: "yo are you trying to get a job? i built something that writes your resume in 60 sec — $9, refund if it sucks"
