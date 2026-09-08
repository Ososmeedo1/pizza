# P10 — Pricing Overhaul (oldPrice removal, Sizes & Prices grid, category optgroups, home categories split, branch-only location link) · Final Report

Status: **COMPLETE**. Lint clean, production build passes (126 pages), Playwright verification **57/57 PASS** against the live `pizza` DB, QA data fully cleaned up (products back to 34, admin accounts 0), grep-zero for removed code/keys.

---

## 1. Files Changed

### Part 1 — `oldPrice` removal
| File | Change |
|---|---|
| `src/models/Product.js` | `oldPrice` field removed from schema |
| `src/components/storefront/ProductCard.jsx` | strikethrough + old-price row removed; `fromPrice`/`price` labels kept |
| `src/lib/data/products.js`, `src/lib/data/adminProducts.js` | `oldPrice` removed from both view mappers |

### Part 2–3 — Sizes & Prices
| File | Change |
|---|---|
| `src/lib/productSizes.js` — **NEW** | `SIZE_ORDER`, `SIZE_NAMES` (S/M/L ar+en), `sizePricesToOptions`, `deriveSizePricing`, `toBasePrice`; `toPrice` used directly (no premature `Number()` wrap, so blank stays blank) |
| `src/lib/validations/product.js` | optional non-negative `price` + `sizePrices.S/M/L`, `superRefine` `sizeOrBaseRequired` ("Set a base price or at least one size price.") |
| `src/app/api/admin/products/route.js` | POST: `deriveSizePricing(data.sizePrices, data.price)` → `Object.assign` → `delete data.sizePrices` |
| `src/app/api/admin/products/[id]/route.js` | PUT: same server-side derivation |
| `src/components/admin/products/ProductForm.jsx` | Grid replaced: base price input (`#product-price`) + 3 size inputs (`#size-price-S/M/L`, `min=0`) + hint; `sizePriceDefaults` prefill from existing options by key; category `<optgroup>`s; single-source-of-truth fix below |

**Key bug found & fixed:** the form originally derived pricing **client-side** and then deleted `sizePrices` from the body; the server then re-derived from `undefined`, wiping all options and treating the client's derived price as the base. Removed client derivation entirely — the form now sends the raw grid (`price` + `sizePrices`) and **only the server derives** via `deriveSizePricing`. Verified: edit L 100→210 persists server-side and re-renders the storefront pill.

### Part 4 — Messages (`en.json`, `ar.json`)
- `admin.productForm` rewritten: removed `oldPrice`, `sectionOptions`, `unit*` keys; added `labels.sizesPrices`, `labels.basePrice`, `sizeNames.{S,M,L}`, `placeholders.sizePrice`, `sizesPricesHint`, `optgroupPizzaTypes`, `optgroupOtherCategories`, `validation.sizeOrBaseRequired`.
- `home.categories` → `pizzaStylesTitle`, `moreCategoriesTitle`, `viewAll`, `ariaLabel` (old `title` key removed).
- Settings: `labels.locationLink` + `labels.locationLinkHint` removed; `placeholders.locationLink` kept (branch field).

### Part 5 — Home + admin optgroups
| File | Change |
|---|---|
| `src/app/[locale]/page.jsx` | passes `pizzaStyles` (5 sub-categories) + `moreCategories` (top-level minus `pizzas`, sorted by `sortOrder`) into home |
| `src/components/storefront/home/CategoriesSection.jsx` | rewritten: group 1 "Pizza Styles"/"أنواع البيتزا" (5 icon+name+desc subcards, 2/3/5-col, view-all arrow → `/categories/pizzas`, `rtl:rotate-180`); group 2 "More Categories"/"أقسام أخرى" (top-level, `mt-10`, grid) |
| `src/lib/data/adminProducts.js` | `getAdminCategoryOptions` now selects `parent` + `sortOrder` (fix: previously only `name slug`, which made the "Pizza types" optgroup empty) |

### Part 6 — Global location link removal
`settings.mapUrl` removed from: `src/lib/validations/settings.js`, `src/models/SiteSettings.js`, `src/app/api/admin/settings/route.js` (DEFAULT_SETTINGS, `toSettingsView`, PUT), `src/lib/data/settings.js`, `src/lib/data/adminSettings.js`, `src/components/admin/settings/SettingsForm.jsx` (input + emptyValues + defaultValues + hint), `src/components/storefront/contact/BranchesSection.jsx` (legacy card → `mapUrl: null`, address-only), `src/components/storefront/contact/ContactMap.jsx` (`resolveMapHref`), `scripts/seed.mjs` (global key only).
Per-branch `mapUrl` kept everywhere (model, validation, admin form `branches.{i}.mapUrl`, legacy/hasDirections logic, seed).

---

## 2. Derivation Behavior (verified)

| Input grid | Stored result |
|---|---|
| S=100, M=150, L=200 | options S/M/L (order kept), auto names (Small/صغير…), `price=100`, `hasMeasuringUnit=true`, `unitType="size"` |
| S blank, M=175, L=250 | options M,L, `price=175` |
| all blank, base=40 | `hasMeasuringUnit=false`, `options=[]`, `price=40` |
| base-only product, then S=120 on edit | converts to sized product: price 120, single S option |

- Edit page prefills S/M/L from existing option keys, base price empty for sized products.
- Blank size is never persisted as a 0-price option.
- Storefront pills show per-size prices; default total = selected-size price; card shows "From {min}".

---

## 3. Storefront / Admin Behavior Verified (Playwright, 57/57 PASS)

- New product form: 3 size inputs (`min=0`), base price input present, old measuring-unit select gone, old-price input gone.
- Optgroups: "Pizza types" (5 subs, incl. cheese-pizza), "Other categories" (4, no pizzas/add-ons).
- Empty submit → inline `sizeOrBaseRequired` error.
- API create/edit derivation (all 4 cases above), base→sized conversion, edit L→210 round trip through the UI, storefront pills (EN + AR labels), From-175 card, "100 EGP" default total, no pills on base product.
- Home EN: "Pizza Styles" + "More Categories" headings, 5 pizza subcards, no standalone pizzas card, "View all" → `/en/categories/pizzas`; home AR: headings + arrow `rtl:rotate-180`.
- Settings: global location-link input gone, branch location-link input present; contact page renders alpha+beta branch cards + 2 Directions buttons; empty branches → legacy single card (brand, Call button, global address, **no** Directions link); original settings restored.
- Cleaned up: QA products deleted, temp admin removed, product count back to **34**, settings doc restored to pre-test snapshot (global `mapUrl` field `$unset`).

---

## 4. Grep Verification (zero matches in `src/`)

- `oldPrice` — 0
- `sectionOptions`, `unitTypeRequired`, `measuringUnitHint`, old editor keys — 0
- `settings.mapUrl` / global `mapUrl` — 0 (remaining `mapUrl` hits are branch-only: model/validation branch schema, admin branch form, `BranchesSection` legacy `null` + `hasDirections`, seed branch)
- Message files: no `oldPrice`/`sectionOptions`/`unitType`-form keys; `branchLocationLink` + storefront `productDetails.unitType` (Select Size label) intentionally remain.

---

## 5. Cleanup / Verification Commands

- `npm run lint` — 0 warnings.
- `npm run build` — success, 126 pages, Next.js 16.3.4 (Turbopack), 2 stale pages noted (home revalidate 5m, contact 5m).
- Dev server stopped after verification; no lingering `node` processes.
- All temp Playwright scripts (`%TEMP%\opencode\p10-*`) and screenshots removed.

## 6. Deviations / Notes

- UI create-via-form still requires a primary image (`ImageUploadField` requirement, pre-existing) — not part of P10; create coverage used the admin API, edit coverage used the real UI form (same submit/derive pipeline as create's POST).
- `deriveSizePricing` no longer trusts any client-derived `measuringUnit`/`hasMeasuringUnit`/`price`; these are server-computed from `sizePrices` + `price` only.
- Home/"From" logic in `src/lib/catalog.js` (storefront card) intentionally unchanged per spec.