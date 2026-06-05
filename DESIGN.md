# DESIGN.md — ResumeReady

> Visual design system extracted from the live codebase (v21). Any agent building
> UI for this product reads this file first, then generates code that obeys it.
>
> **Rule:** reference tokens via CSS variables. Do not invent new colors, fonts,
> or radii. If a surface isn't covered here, add it as a token first.

---

## 1. Identity

**Trustworthy, clean, calm, editorial.** A parent should look at this and believe
a real product made it. Motion is subtle and fast. No bounce, no confetti, no
fake urgency, no dark patterns.

Anti-vibe: dark-mode SaaS, neon gradients, glassmorphism, dense dashboards.

---

## 2. Color

```css
:root {
  --black: #0A0A0A;
  --white: #FAFAF8;      /* warm off-white, NOT #fff */
  --green: #16A34A;      /* brand / CTA / success */
  --gl: #DCFCE7;         /* green-light fills */
  --gm: #86EFAC;         /* green-medium accents */
  --muted: #52525B;      /* secondary text — darkened from #6B7280 for WCAG 4.5:1 on warm bg */
  --border: #E5E7EB;     /* hairlines, dividers */
  --red: #DC2626;        /* errors only */
  --red-bg: #FEF2F2;     /* error field bg */
  --shadow: 0 4px 16px rgba(0,0,0,.06);
}
```

- Green = brand + CTA + success. Never body text.
- Red = errors only. Never decorative.
- Amber (`#FFF7ED` / `#FED7AA`) = "for parents" empathy callouts only.
- Cards: `#fff` on the warm `--white` bg so they lift.

---

## 3. Typography

```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500&display=swap" rel="stylesheet">
```

| Role | Font | Weights |
|------|------|---------|
| Headings / buttons / big numbers | Bricolage Grotesque | 400, 700, 800 |
| Body / UI / inputs | Plus Jakarta Sans | 400, 500 |

- Hero h1: clamp(32px, 4vw, 50px), 800, letter-spacing -0.03em, text-wrap: balance
- Section titles: clamp(24px, 3.2vw, 36px), 800, -0.025em, text-wrap: balance
- Body: 13-15.5px, line-height 1.6-1.75, text-wrap: pretty
- Eyebrows: uppercase, 700, letter-spacing .06-.12em, --green
- All motion must include `prefers-reduced-motion: reduce` fallback

---

## 4. Spacing

- Page gutter: 40px desktop, 20px mobile
- Card padding: 16-24px
- Section rhythm: ~56-64px vertical
- Touch targets: >= 44px (enforced)
- Mobile-first: everything collapses under 768px

---

## 5. Radius & Elevation

- Buttons/inputs: 8px
- Cards: 10-12px
- Pills/badges: 99px
- Shadows: borders do the work. Max shadow = `var(--shadow)`.

---

## 6. Motion

- Standard: .15s on opacity, border-color, transform
- Toggles: .2s. Progress: .3s. Spinner: .7s linear
- Hover: opacity .85-.9 or translateY(-1px)
- Focus: border → --green + box-shadow 0 0 0 3px rgba(22,163,74,.1)
- No parallax, no scroll-pin, no GSAP. L1 product.

---

## 7. Do's & Don'ts

**Do:** use CSS variables, keep two-font split, stay flat, mobile-first.

**Don't:** hardcode hex, add a third font, add gradients/dark mode, use green
for body text, add fake counters/testimonials/scarcity, add heavy animation.

---

*Update this file in the same commit when changing the visual system.*
