# P1 — Theme-Only Rebrand to PIZZATO · Final Report

Status: **COMPLETE**. Lint clean, production build passes (90 pages), contrast verified, old palette grep-zero, 24 screenshots captured.

---

## 1. Final Design Token Table

### Raw CSS variables (`src/app/globals.css`)

| Token | Light | Dark |
|---|---|---|
| `--background` | `#fbebdb` | `#000101` |
| `--surface` | `#fff6ec` | `#151110` |
| `--foreground` | `#000101` | `#fbebdb` |
| `--muted` | `#f3ddcb` | `#2a2320` |
| `--muted-foreground` | `#5c5248` | `#b9aca0` |
| `--primary` | `#6b010f` | `#6b010f` |
| `--primary-foreground` | `#fbebdb` | `#fbebdb` |
| `--primary-bright` | `#e0565f` (unused in light) | `#e0565f` |
| `--secondary` | `#e4d3c3` | `#2a2320` |
| `--secondary-foreground` | `#5c5248` | `#e4d3c3` |
| `--brand` | `#6b010f` | `#e0565f` |
| `--brand-foreground` | `#fbebdb` | `#fbebdb` |
| `--border` | `#e4d3c3` | `#2a2320` |
| `--input` | `#dfcbb8` | `#3a312e` |
| `--ring` | `#6b010f` | `#e0565f` |
| `--success` / `--warning` / `--error` | keep old functional values | keep old functional values |

### Clay shadows (`--clay-*` → `--shadow-*`)

| Shadow | Light (warm `rgb(10,5,4)`) | Dark (`rgb(0,0,0)`) |
|---|---|---|
| `--clay-soft` | `0 2px 12px rgba(10,5,4,.07)` | `0 2px 12px rgba(0,0,0,.3)` |
| `--clay` | `0 8px 24px .11, 0 2px 8px .055` | `0 8px 24px .4, 0 2px 8px .22` |
| `--clay-sm` | `0 2px 8px .07, 0 1px 3px .05` | `0 2px 8px .32, 0 1px 3px .2` |
| `--clay-md` | `0 4px 16px .11, 0 2px 6px .07` | `0 4px 16px .4, 0 2px 6px .24` |
| `--clay-lg` | `0 8px 32px .15, 0 4px 12px .09` | `0 8px 32px .5, 0 4px 12px .3` |

Mapped into `@theme inline` as `--shadow-*`, so class names (`shadow-soft`, `shadow-clay-md`, …) stayed identical.

### Gradient tokens

| Token | Light | Dark |
|---|---|---|
| `--wash-hero` | `to bottom, rgba(107,1,15,.16) → rgba(251,235,219,.45) 55% → rgba(255,246,236,.65)` | `to bottom, rgba(107,1,15,.3) → rgba(21,17,16,.6) 60%` |
| `--wash-panel` | `120deg, rgba(107,1,15,.07) → rgba(255,246,236,.55) 45% → rgba(251,235,219,.2)` | `120deg, rgba(107,1,15,.22) → rgba(21,17,16,.5) 50% → rgba(21,17,16,.25)` |

Wired via `--background-image-hero-wash` / `--background-image-panel-wash` → **new utilities `bg-hero-wash`, `bg-panel-wash`** (confirmed emitted in the compiled CSS bundle).

Type scale kept fluid; display/h1/h2 tuned ~10% down to suit the single-weight Rye face.

---

## 2. Font Mapping

Loaded in `src/app/[locale]/layout.jsx` via `next/font/google` (self-hosted, no new deps):

| Role | Latin | Arabic |
|---|---|---|
| Display (hero h1, section h2, wordmark) | **Rye** 400, line-height 1.25, `latin` | **Cairo** 900, line-height 1.3, `letter-spacing: 0` |
| Body / UI | **Montserrat** 400–800 (`latin`) | **Cairo** 400–900 (`arabic`+`latin`) |
| Overlines / badges / buttons | `font-extrabold uppercase tracking-wide` | Cairo 800–900, tracking zeroed |

Applied mechanics:
- `--font-display: var(--font-rye)…` in `@theme inline`; override blocks `html[lang="en"] .font-display` / `html[lang="ar"] .font-display` pin family/weight. Arabic never renders Rye.
- All AR tracking zeroed via `html[lang="ar"] { --tracking-tight:0; --tracking-wide:0 }` (Cairo diacritics).
- Old `Plus_Jakarta_Sans` removed; Cairo weight list extended with `"900"`.
- `font-display` added to: HeroSection/AboutHero/ContactHero h1, products & category & product-detail h1, section h2s (Categories, Featured, BrandStory, WhyChooseUs, Social, ContactCTA, AboutContent, AboutCTA, related), 404 h1, Header wordmark, Footer wordmarks (2).
- Titles bumped to 700 (ProductCard, ContactCard, CardTitle, WhyChooseUs h3, ContactInfo h3, AboutContent h3s, admin list h3s, EmptyState).
- Buttons converted to `font-extrabold uppercase tracking-wide`: Button base, Badge base, Hero + admin + storefront CTAs, secondary form buttons, row-action buttons, SkipLink, social buttons, "View all" link.

---

## 3. Brand-as-Text Split (reused `--brand` token)

`--brand` is a new per-mode token (light `#6b010f`, dark `#e0565f`) surfaced as `--color-brand` in `@theme inline`. All **text/fill** brand accents moved off `text-primary`/`fill-primary`:

| File | Element |
|---|---|
| ProductDetailsClient.jsx | price span, CTA handled |
| admin/login + admin/register page | auth link |
| ContactMap.jsx / ContactInfo.jsx / ContactCard.jsx | icon chips |
| AboutContent.jsx | CakeSlice accent |
| admin/page.jsx | stat icon |
| FeaturedProductsSection.jsx | "View all" link |
| WhyChooseUsSection.jsx | icon chip |
| ProductRowActions.jsx | featured star |
| ImageUpload.jsx | Loader2 spinner (2×) |
| BrandStorySection.jsx | CakeSlice accent |
| Button.jsx | `link` variant |

Fills/borders/focus states (`bg-primary`, `border-primary`, `ring-primary`, `bg-primary/NN`, `text-primary-foreground`) intentionally remain `--primary` in both modes.

`rg -P 'text-primary(?!-foreground)' src` → **zero**.

### Gradient replacements
- HeroSection hero visual `bg-gradient-to-b from-primary/25 to-secondary/40` → `bg-hero-wash`
- AboutContent panel `bg-gradient-to-br from-secondary via-surface to-background` → `bg-panel-wash`

### Placeholder SVG recolor (29 files)
Content-preserving 4-hex swap across `public/placeholders/products/` + `categories/`:

| Old | New |
|---|---|
| `#fff7f9` | `#fff6ec` (surface) |
| `#f9d3db` | `#f3ddcb` (muted) |
| `#c95d78` | `#6b010f` (primary) |
| `#a54863` | `#45030b` (deep primary shade) |

Final placeholder palette: `{#6b010f, #45030b, #fff6ec, #f3ddcb, #ffffff}`. No extra mappings were needed beyond the agreed four. `#ffffff` decorative circles kept (not old brand). File names/paths/viewBox/structure/order untouched (P4 seed paths intact). Brand SVG assets (`logo.svg`, `favicon.svg`, `icon.svg`) redesigned as red `#6b010f` "P" mark on `#fbebdb` (64×64, 480×360).

---

## 4. Contrast Results (scripted, WCAG)

| Mode | Pair | Ratio | Verdict |
|---|---|---|---|
| light | fg on bg | 17.92 | ✓ |
| light | muted-fg on bg | 6.54 | ✓ |
| light | muted-fg on surface | 7.13 | ✓ |
| light | muted-fg on muted | 5.81 | ✓ |
| light | primary-fg on primary | 11.00 | ✓ |
| light | brand on bg | 11.00 | ✓ |
| light | brand on surface | 12.01 | ✓ |
| light | secondary-fg on secondary | 5.23 | ✓ |
| light | primary-fg on primary/90 hover | 9.15 | ✓ |
| dark | fg on bg | 17.92 | ✓ |
| dark | muted-fg on bg | 9.43 | ✓ |
| dark | muted-fg on surface | 8.46 | ✓ |
| dark | primary-fg on primary | 11.00 | ✓ |
| dark | brand on bg | 5.64 | ✓ |
| dark | secondary-fg on secondary | 10.59 | ✓ |
| dark | muted-fg on muted | 6.97 | ✓ |
| dark | primary-fg on primary/90 hover | 11.94 | ✓ |
| dark | brand on surface | 5.06 | ✓ |

All ≥ 4.5. Warm `#5c5248` muted-fg keeps ≥ 4.5 on every cream surface; dark brand `#e0565f` passes even on surface.

---

## 5. Grep Proof — Old Palette Removed

`rg -i 'f9b2c0|ffd4dd|f08ca3|3ec6c5|0e8c8b|f9d3db|c95d78|a54863|fff7f9' src public` → **0 matches** (`src` + `public` combined).
Old chocolate/cream neutrals (`#3b2622`, `#2b1f1a`, `#382a22`, `#331f1c`, `#faf3ea`, `#fffaf3`) and `text-zinc`/`bg-zinc`/`text-slate`/`text-neutral` → **0 matches** in `src`.

---

## 6. Screenshots

`D:\Full_stack\CommonProjects\pizza_store\screenshots\` — 24 PNGs, `fullPage`, viewport heights 812/800:

Matrix: home | product detail (`/en/…/products/nutella-cono-tagine`) | admin login × EN/AR × light/dark × 375/1280.

Captured with the **self-hosted production server** (`next start`, port 3100) driving Playwright's bundled Chromium; theme forced via `localStorage.theme` before render. Headless-verified (this model cannot view raster images):

- `light` → computed bg `rgb(251,235,219)` = `#fbebdb` ✓
- `dark` → computed bg `rgb(0,1,1)` = `#000101` ✓
- EN h1 weights 400 (Rye), AR h1 weights 900 (Cairo); `document.fonts.check("40px Rye")` = true on all pages and locales ✓ (so English display text is never synthetic-bolded)
- Cairo 900 present for AR ✓
- Horizontal overflow = 0 at both 1280 and 375 (incl. Rye/Cairo h1 at 2–3 wrapped lines) — no clipping ✓

---

## 7. Lint + Build

```
> npm run lint
> eslint              → 0 errors, 0 warnings

> npm run build       → Next.js 16.3.4 (Turbopack), .env.local
✓ Compiled successfully in 2.7s
✓ Finished TypeScript
✓ Generating static pages (90/90) in 6.0s
Route table: /ar + /en static (SSG, revalidate 5m), admin routes dynamic (ƒ),
/api/* dynamic, proxies via middleware.
```

Turbopack emits `bg-hero-wash`, `bg-panel-wash`, `shadow-soft/clay(-sm/-md/-lg)` — new utilities confirmed compiled.

---

## 8. Deviations & Notes

1. **Admin h2s stay Montserrat**, not Rye — internal tool, only storefront display type reskinned.
2. **Seed/copy unchanged** — products and categories still show old dessert copy (P1 theme-only; P4 owns copy/seed).
3. **`#ffffff` kept** in placeholder decorations (agreed: not old brand).
4. **CategoriesSection scrim** `bg-gradient-to-t from-foreground/70…` kept — functional text-legibility overlay, not a brand color; and its caption h3 uses `text-background` (existing legibility pattern).
5. **Status colors** (`--success/--warning/--error`) kept old functional values.
6. **Hero `text-ring` decorative sparkle** kept — ring is the brand red in both modes; legibility verified (contrast ≥ 5.64).
7. **`--brand-foreground`** added as a paired token even though no component needed inverse brand text (future-proofing, zero usage).
8. **Placeholder fill mapping needed no extra swaps** beyond the agreed four — the fourth target `#45030b` (deep primary) is a new derived shade, not a published token.
9. `.env.local` untouched (DB creds preserved); no schema, route, API, or data changes; JS/CSS/SVG only; no new dependencies added to the project.