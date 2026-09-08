# P12 — Unit-Label removal, global-address removal, Contact Us rebuild · Final Report

Status: **COMPLETE**. Lint clean, production build passes (126 pages), Playwright E2E **30/30 PASS** on the live `pizza` DB, QA data fully cleaned (products 34, admins 0, settings doc snapshot-equal and address-free, ImageKit test upload purged).

---

## 1. Part 1 — Unit Label identification (before)

| Item | Findings |
|---|---|
| Field key | `unitLabel` (`{ar, en}` object) |
| Translation keys | `admin.productForm.labels.unitLabelAr` / `unitLabelEn`, `admin.productForm.placeholders.unitLabelAr` / `unitLabelEn` |
| Rendered labels | EN: **"Unit Label (Arabic)" / "Unit Label (English)"** · AR: **"وحدة القياس (بالعربية)" / "وحدة القياس (بالإنجليزية)"** |
| Locations | `ProductForm.jsx:529-545` (inputs `#product-unit-ar` / `#product-unit-en`), defaults at `:251-254` + `:285`; `lib/validations/product.js:59-62`; `models/Product.js:48`; `lib/data/products.js:38`; `lib/data/adminProducts.js:44`; en/ar messages |
| Purpose (legacy) | leftover manual per-option label editor from the old measuring-unit editor — obsolete since P10 auto-derives names from `SIZE_NAMES` server-side |

Removed everywhere; edit/create now rely solely on derived `S/Small`, `M/Medium`, `L/Large` names.

## 2. Part 3 — Contact page audit (before / after)

| Component (`src/components/storefront/contact/`) | Settings fields read (before) | After |
|---|---|---|
| `ContactHero` | none (static messages) | unchanged |
| `ContactInfo` | `phone`, `address` (global), `openingHours`, `instagram`, `facebook` | `phone`, `email`, `openingHours` only |
| `BranchesSection` | `branches[]` (`name/address/phone/mapUrl`), global `address` (legacy fallback), global `phone`, `brandName` | `branches[]`, global `phone`, `brandName`, `contactMessage` (legacy fallback only); **no global address** |
| `ContactMap` (deleted) | `address` (global), `mapLatitude`/`mapLongitude`/`mapEmbedUrl` → google maps directions URL | **file deleted** |
| `contactMessage` banner | `contactMessage` | moved to page intro lead |

Also fixed hidden global-address readers: `Footer.jsx` (`firstBranch?.address || settings?.address` → first-branch only) and home `ContactCTASection.jsx` (`settings?.address` → `settings?.branches?.[0]?.address`).

## 3. Files modified / deleted + keys removed

**Part 1 (unit label):**
- `src/components/admin/products/ProductForm.jsx` — inputs + prefill/create defaults removed
- `src/lib/validations/product.js` — `unitLabel` schema entry removed
- `src/models/Product.js` — schema field removed
- `src/lib/data/products.js`, `src/lib/data/adminProducts.js` — view mappers cleaned
- messages `labels.unitLabelAr/En`, `placeholders.unitLabelAr/En` removed (en + ar)

**Part 2 (global address / email):**
- `src/components/admin/settings/SettingsForm.jsx` — global address inputs + emptyValues + defaultValues removed; **Email input added** (Contact & Social)
- `src/lib/validations/settings.js` — global `address` object removed; `email` added
- `src/models/SiteSettings.js` — `address` path removed (kept `openingHours`, `branches[].address`, pre-existing `email`)
- `src/app/api/admin/settings/route.js` — `address` removed from DEFAULT_SETTINGS + `toSettingsView`; `email` added to both
- `src/lib/data/adminSettings.js` — global `address` removed; `email` added
- `src/lib/data/settings.js` — global `address` removed; `email` exposed
- `src/components/layout/Footer.jsx` — first-branch address only; hidden when no branches
- `src/components/storefront/home/ContactCTASection.jsx` — address reads first branch
- `scripts/seed.mjs` — global `address` value removed (branch address kept)
- settings messages: `labels.addressAr/En` + `placeholders.addressAr/En` removed; `labels.email` + `placeholders.email` added

**Part 3 (contact):**
- `src/app/[locale]/contact/page.jsx` — ContactMap removed; contactMessage becomes intro lead (no duplicate bottom banner)
- `src/components/storefront/contact/ContactInfo.jsx` — rewritten to Phone/Email/Opening-Hours cards (social block + big Call button + address card removed)
- `src/components/storefront/contact/BranchesSection.jsx` — rewritten legacy fallback (no global address)
- `src/components/storefront/contact/ContactMap.jsx` — **deleted** (unused elsewhere)
- contact messages: `info.address`, `info.callToOrder`, `info.followUs`, `map.*` removed; `info.email` added (en + ar)

## 4. Contact page final structure (top → bottom)

1. `ContactHero` — static title/subtitle
2. Intro lead — `contactMessage` (localized), centered surface card
3. Global info row — 3 cards: **Phone** (`tel:` link), **Email** (`mailto:` link), **Opening Hours** (text); "unavailable" placeholder when none set
4. Branches — "Our Branches"/"فروعنا" heading + responsive grid (1-col mobile, 2-col `md+`): per-branch h3 name, muted multi-line address, button row **Directions → branch.mapUrl** (`_blank` noopener, MapPin icon, hidden when empty) and **Call → tel: branch.phone || settings.phone** (hidden when no phone anywhere)
5. Empty-branches fallback — single card: brand name + `contactMessage` + Call button; **no address, no Directions**
6. No ContactMap anywhere; no global address/map-link text on the page

## 5. Verification results (30/30 PASS)

- **Part 1**: EN + AR `/admin/products/new` have no `#product-unit-ar/en` and no "Unit Label"/"وحدة القياس" label; core sections intact (name AR/EN, category, base price, `#size-price-S/M/L`, image upload, ingredients, isNew).
- **UI create**: QA P12 created via the form (with a real uploaded 1×1 PNG) → stored: S/M/L Small/Medium/Large 100/150/200, `price=100`, `hasMeasuringUnit=true`; detail pills show "Small 100 / Medium 150 / Large 200"; edit prefills 100/150/200; deleted afterwards.
- **Settings**: no `#address.ar/en` inputs; `#email`, `#phone`, `#openingHours.*`, and branch fields (`branches.0.address.*`, `branches.0.mapUrl`) present; GET has no `address`, has `email`; PUT persists 2 branches (own address + mapUrl + phone) + hours.
- **Contact EN/AR × light/dark × 375/1280**: hours exactly once; each branch card shows its own address; Directions href == that branch's mapUrl; Call href == branch phone; email mailto present; no `google.com/maps/dir` / `maps.app.goo.gl` on the page; AR shows الاتجاهات/اتصل correctly; dark-mode surface cards render.
- **Empty branches**: contact renders single legacy card (PIZZATO + message + Call, hours once, no address, no Directions); footer address line hidden (hours row kept); after restore, footer shows first-branch address again.
- **Restore**: settings doc snapshot-equal for branches/hours/email; stale `address` field `$unset` from DB.

## 6. Cleanup counts

- Products: **34 → 34** (QA P12 created via UI, deleted)
- Admins: **0** (temp `qa-admin-p12@...` deleted; never counted in baseline)
- Settings: restored to snapshot; `address` key removed from stored doc (`$unset` via raw collection — note: mongoose model `updateOne` silently strips `$unset` of unknown schema paths under `strict` mode, so the raw-collection path was used)
- ImageKit: the UI-create placeholder PNG (`upload-…-of4jmnwp…png`) **deleted** from the account (`DELETE` confirmed)

## 7. Lint + build

- `npm run lint` — 0 warnings, 0 errors.
- `npm run build` — ✓ Compiled successfully (Turbopack, Next.js 16.3.4), TypeScript clean, 126 pages generated; contact + home remain SSG with revalidate.

## 8. Deviations / notes

- **Email surfaced**: the model already had `settings.email` (used by nothing before); added it to public/admin views + settings form + validation so the mandated Email card is editable. Global address and global map-link/coordinates are untouched scope-wise except address; the unused `mapEmbedUrl`/`mapLatitude`/`mapLongitude` fields were **left in place** (they are embedded-map config, never rendered in the admin form; no global address/map link on any page).
- "Contact CTA banner (existing) unchanged" interpreted as **home `ContactCTASection`** (the only CTA banner in the app) — kept visually identical, only its address source switched to `branches[0].address` for the no-global-address invariant; the former contact page's bottom `contactMessage` banner was folded into the intro lead (step 1) so the message renders once.
- Legacy fallback card shows `contactMessage` inside the card; opening hours appear **only** in the global info card (per the consistency check) — not repeated in branches or the fallback card.
- Product images on create still require a real upload (pre-existing ImageUpload requirement, unchanged); verified end-to-end with a real mock-buffer upload.