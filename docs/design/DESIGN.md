# NutriPilot Design System

Pulled from the Claude Design project **"NutriPilot design system"**
(`https://claude.ai/design/p/b3b2cda3-047b-4af9-803e-196b24324156`) so the
tokens and component contracts live in-repo instead of only in the hosted
design project. This is a reference snapshot, not generated code — nothing
in `src/` was changed to consume it yet.

NutriPilot is a nutrition-tracking app for people optimizing muscle-building
nutrition — users log meals throughout the day and track progress against
daily macro targets (protein, carbs, fats, calories).

## Sources

- **Style source of truth (approved, shipped code):** this repo's own
  `src/index.css`, `src/components/auth/*`, `src/components/profile/*`.
  Every color, spacing, radius, shadow, and type value in this system is
  copied verbatim from that shipped code (Tailwind utility classes resolved
  to their default hex/rgba values, CSS custom properties copied as-is).
- **Layout reference only (mockups, NOT a style source):** early Dashboard,
  Meal Logging, Settings and Weekly Overview mockups referenced by the
  design project. Only their content structure and element arrangement were
  reused in the design project's screen recreations — visual styling always
  comes from the tokens below, never from the mockups' own styling.
- **Logo:** `nutripilot-mark.png` (mark) and `nutripilot-lockup.png`
  (lockup) live in the design project's `assets/` folder. They were **not**
  copied into this repo — the design-sync tool caps file reads at 256 KiB
  and both PNGs exceed that, so pulling them here would silently write a
  truncated/corrupt image. Fetch them directly from the design project
  (`assets/nutripilot-mark.png`, `assets/nutripilot-mark-transparent.png`,
  `assets/nutripilot-lockup.png`) when they're actually needed, e.g. via
  `DesignSync.get_file` or the claude.ai project UI.

## Index

- `tokens/index.css` — token entry point (`@import`s everything below).
- `tokens/colors.css`, `tokens/typography.css`, `tokens/spacing.css`,
  `tokens/effects.css` — CSS custom properties, copied verbatim from the
  design project. **Not wired into the app build** — `src/index.css`
  currently defines its own (smaller) set of tokens inline. See
  "Relationship to existing repo styles" below before importing these.
- This file — component contracts, content rules, visual foundations,
  accessibility notes, responsive rules, extracted from the design
  project's Design Component (`.dc.html`) files and its `readme.md`.

## Relationship to existing repo styles

`src/index.css` already defines a subset of these tokens directly (see its
`:root` block: `--macro-*`, `--auth-*`). Those in-repo values match this
token set exactly (e.g. `--auth-bg: #0b0f14` ≡ `--color-bg`,
`--macro-protein: #22c55e` ≡ `--color-macro-protein`) — this system is a
superset with fuller naming, not a divergent one.

**Known inconsistency (documented, not fixed here):** `tailwind.config.cjs`
defines a separate light-theme palette (`surface: '#F5F7FB'`, `ink:
'#0F172A'`, etc.) that isn't used anywhere in the shipped dark-theme UI —
`src/index.css`'s hardcoded dark tokens are what's actually applied. Any
future work that consumes `tailwind.config.cjs`'s `bg-surface`/`text-ink`
utilities should either update those to the dark values here or remove them
to avoid two conflicting palettes.

## Content fundamentals

- **Tone:** calm, direct, coach-like — not hype-y. Copy from the shipped
  code: "Sign in to keep your macro targets on track.", "Start tracking
  macros with calm, minimal guidance."
- **Voice:** second person ("Update your profile and recalculate macro
  targets."), no exclamation-point marketing voice.
- **Casing:** sentence case for headings and body copy ("Welcome back",
  "Current Profile" is an exception as a card title / proper noun-like
  label). Uppercase + wide letter-spacing is reserved for eyebrows/labels
  only (`AUTH-EYEBROW`, targets labels), never for full sentences.
- **Numbers:** grams and kcal are always shown with units inline (`156g`,
  `2,850 kcal`), macro values are never shown without their unit.
- **Emoji:** none. Icons are text labels, not glyphs.
- **Errors:** short, specific, actionable ("Password must be 8+ chars with
  uppercase, lowercase, number.", "Unable to load profile.").

## Visual foundations

- **Theme:** single dark theme. Background `#0b0f14`, no light mode in the
  source.
- **Surfaces:** glass cards — `rgba(255,255,255,0.05)` fill, `1px solid
  rgba(255,255,255,0.1)` border, `border-radius:24px`, `backdrop-filter:
  blur(16px)`, `box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4)`. Inputs sit
  one level down: `rgba(15,23,42,0.6)` fill, `border-radius:16px`.
- **Color:** mint→emerald accent (`#7ff0cc` → `#38e7b1`, used as a 120°
  gradient on primary buttons) on a near-black neutral scale (slate). Macro
  nutrients have a **fixed** color mapping — never remix: calories blue
  `#3b82f6`, protein green `#22c55e`, carbs amber `#f59e0b`, fat red
  `#ef4444`. Semantic feedback uses emerald for success and rose for
  error/warning (border/bg/text triplets at 30%/10%/solid opacity).
- **Type:** Sora (300–700) with a system-sans fallback stack. Headings are
  semibold, never bold-900. Eyebrows/labels are uppercase with wide
  tracking (0.2–0.3em); body and card copy is never uppercase.
- **Spacing/radius:** two radii only — 16px (inputs, buttons, small tiles,
  pills use 9999px) and 24px (cards/shells). Card padding is generous (32px
  desktop, 16–20px mobile tiles).
- **Shadows/blur:** cards use a soft, large-radius black shadow plus 16px
  backdrop blur (true glassmorphism, not a flat dark box). Primary buttons
  get a colored glow shadow instead of a neutral one (`0 18px 40px -20px
  rgba(127,240,204,0.5)`).
- **Backgrounds:** the auth shell has two large, slowly-drifting blurred
  radial-gradient orbs (mint top-left, slate bottom-right) behind the
  content — the only decorative/ambient motif in the system. App/dashboard
  screens are flat `#0b0f14`, no orbs.
- **Animation:** entrance-only. `authFadeUp` (translateY 24px → 0, opacity
  0 → 1, 0.8s ease-out, staggered 120ms/240ms across intro → card) on auth
  screens; `authFloat` (18px drift + 5% scale, 16–18s ease-in-out infinite)
  on the background orbs. No hover-scale, no bounce, no page-transition
  choreography elsewhere.
- **Hover/press states:** buttons brighten (`filter: brightness(1.05)`) on
  hover, no color swap; ghost buttons/links shift border or text color
  toward the mint accent on hover.
- **Borders:** hairline `white/10` (or `white/8` for the auth-specific
  border token) on every card/input — never a heavier or colored border
  except the semantic success/error 30%-opacity borders.
- **Imagery:** none beyond the logo — no photography, no illustration.
- **Layout:** desktop auth/settings screens are centered, max-width
  constrained (576–1152px per token). Mobile tracking screens (dashboard,
  meal log, weekly overview) are single-column, ~420px wide, no side nav —
  matches "quick scanning, touch-friendly, daily-use" priority.

## Iconography

No icon system — no icon font, no SVG set, no emoji. Every "icon" in the
shipped screens is plain text (e.g. a sign-out button is literally labeled
"Sign Out"). Settings/prev/next controls are text labels ("Settings", "←
Prev", "Next →"), not glyphs.

## Responsive behavior

- **Breakpoints:** `sm` 640px (type-scale only), `md` 768px (form/stat
  grids widen), `lg` 1024px (primary breakpoint — nav bar appears, layouts
  go multi-column).
- **Mechanism (design-project screens only):** the hosted Design Components
  render inline styles and track `window.innerWidth` via a resize listener
  per render, since they can't use `@media`. **This repo uses real
  CSS/Tailwind and should prefer `@media`/Tailwind responsive classes
  instead of a JS resize listener** — the resize-listener pattern is an
  artifact of the design tool's rendering model, not a convention to carry
  into production code.
- **Spacing scale:** screen edge padding steps from 20px (mobile) to 48px
  (desktop); card internal padding steps from 20px to 32px.
- **Navigation pattern:** below 1024px there are no persistent nav links —
  just the logo mark and Sign Out; screen-to-screen movement happens
  through in-flow actions. At 1024px+ a sticky top bar adds persistent
  links (Dashboard / Log Meal / Weekly / Settings). No sidebar.
- **Grids that reflow:** macro stat tiles (2→4 cols), profile fields (1→3
  cols), weekly overview charts (stacked→side-by-side) and daily-breakdown
  cards (horizontal-scroll→full row) all step at the `lg` breakpoint.

## Accessibility — contrast audit

WCAG AA contrast check (4.5:1 body text, 3:1 large text) run across every
color used as text, against both `--color-bg` (#0b0f14) and the lighter
effective background of a glass card (`white/5` over `#0b0f14`, ≈ #17181f).

- **Failure found & fixed:** `--color-text-faint` (#64748b, slate-500) was
  being used for small captions/timestamps/labels in several design-project
  screens. Measured ~4.0:1 on the page background and ~3.6:1 on card
  surfaces — below the 4.5:1 AA minimum. Fixed by switching those to
  `--color-text-muted` (#94a3b8, ~7.5:1 / ~6.7:1 — comfortably passes AA).
  `--color-text-faint` should be restricted to native
  `<input>`/`<select>` placeholder text, which WCAG exempts from the
  contrast requirement.
- **Checked and passing:** `--color-text-primary` (~14–15:1),
  `--color-text-secondary` (~13:1), `--color-text-muted` (~6.7–7.5:1), the
  accent mint/emerald as text (~12–14:1), semantic success/error text on
  their tinted fills (~13–15:1), primary button's dark text (#0f172a) on
  the mint→emerald gradient (~11–13:1).
- **Passing but tight — don't darken further:** macro colors used directly
  as small text (e.g. a meal card's "31g"/"46g"/"20g" values) sit at ~4.7:1
  for calories blue (`#3b82f6`) and fat red (`#ef4444`) on card surfaces —
  just above AA. Amber (carbs) and green (protein) have more headroom
  (~8:1). Re-check contrast before placing these on any lighter surface.

## Interactive states

`Button`, `Input`/`Select`, and `Card` all define default / hover / active
/ focus / disabled explicitly:

- **Button** — primary: hover `filter: brightness(1.05)` (matches source
  `.auth-button:hover`); active `brightness(0.95)`; focus a 3px
  `rgba(127,240,204,0.18)` ring layered on the button's own shadow. Ghost:
  hover/active border+text shift to `rgba(127,240,204,0.6)` / `#e2fbee`
  (matches source `.profile-ghost-button:hover` exactly); focus same mint
  ring. Danger: same idiom in rose. Disabled: 60% opacity,
  `cursor:not-allowed`, all other states suppressed.
- **Input / Select** — focus: border `rgba(127,240,204,0.6)` + 3px
  `rgba(127,240,204,0.18)` ring (matches source `.auth-input:focus`
  exactly). No hover state defined. Disabled: 60% opacity.
- **Card** — static (default) has no states. `interactive` cards render as
  a `<button>` and reuse the same mint hover/active/focus idiom as Button
  ghost / Input focus.

## Component contracts

Extracted from the design project's `.dc.html` files. These are style/prop
contracts to implement against in React — not literal markup, since the
`.dc.html` files use the Claude Design tool's own templating (`sc-if`,
`sc-for`, `dc-import`), not JSX.

### Button
- Props: `label`, `variant` (`primary` | `ghost` | `danger`, default
  `primary`), `disabled`, `fullWidth` (default `true`), `type`, `onClick`.
- Base: Sora, 14px/600, `border-radius:16px`, `padding:12px 16px`,
  `min-height:44px` (touch target), `box-sizing:border-box`.
- `primary`: `background: linear-gradient(120deg, #7ff0cc, #38e7b1)`,
  `color:#0f172a`, `box-shadow:0 18px 40px -20px rgba(127,240,204,0.5)`.
- `ghost`: `background:rgba(255,255,255,0.04)`, `color:#e2e8f0`,
  `border-color:rgba(255,255,255,0.1)`.
- `danger`: `background:rgba(244,63,94,0.12)`, `color:#ffe4e6`,
  `border-color:rgba(251,113,133,0.3)`. **Not present verbatim in the
  shipped source** (only `.profile-ghost-button`'s hover hints at a rose
  danger action) — added as a natural extension of the success/error
  semantic pair for destructive actions.
- `disabled`: `opacity:0.6`, `cursor:not-allowed`, all hover/active/focus
  suppressed.

### Input / Select
- Props: `id`, `label`, `type` (Input only: `text|email|password|number`),
  `value`, `placeholder`, `error`, `disabled`, `readOnly`, `onChange`;
  Select adds `options: string[]`.
- Label: block, Sora 14px/500, `color:#e2e8f0`, `margin-bottom:8px`.
- Field: `min-height:44px`, `border-radius:16px`,
  `border:1px solid rgba(255,255,255,0.1)`,
  `background:rgba(15,23,42,0.6)`, `padding:12px 16px`, 14px text,
  `color:#f1f5f9`.
- Focus: `border-color:rgba(127,240,204,0.6)`,
  `box-shadow:0 0 0 3px rgba(127,240,204,0.18)`.
- `readOnly`: renders the identical box as a `<div>` (no interactive
  affordances) so the layout doesn't shift between edit/display modes;
  empty value displays as `—` in `#94a3b8`.
- Error text: 13px, `color:#fecdd3`.

### Card
- Props: `text`/children, `padding` (`sm` 20px | `lg` 32px, default `lg`),
  `interactive` (default `false`), `disabled`, `onClick`.
- Base: `border-radius:24px`, `border:1px solid rgba(255,255,255,0.1)`,
  `background:rgba(255,255,255,0.05)`, `backdrop-filter:blur(16px)`,
  `box-shadow:0 25px 50px -12px rgba(0,0,0,0.4)`.
- `interactive`: renders as `<button>`; hover
  `border-color:rgba(127,240,204,0.35)`,
  `background:rgba(255,255,255,0.07)`; active
  `border-color:rgba(127,240,204,0.45)`; focus ring matches Input's.
- **Not present verbatim in the shipped source** — every card there is a
  one-off class (`auth-card`, `profile-card`, `profile-targets`, …) with
  the same shape. Factored into one generic component here since future
  screens will repeat this shape.

### Alert
- Props: `message`, `tone` (`success` | `error`, default `error`),
  `actionLabel`, `onAction`.
- `role="status"` for success, `role="alert"` for error.
- Box: `border-radius:16px`, `padding:12px 16px`, flex row,
  `justify-content:space-between`, `gap:12px`, wraps on narrow widths.
- `success`: border `rgba(52,211,153,0.3)`, bg `rgba(16,185,129,0.1)`,
  text `#d1fae5`. `error`: border `rgba(251,113,133,0.3)`, bg
  `rgba(244,63,94,0.1)`, text `#ffe4e6`.
- Optional action button: 12px/600, `min-height:44px`, ghost-button style.

### Badge
- Props: `label`, `tone` (`neutral` | `accent` | `light`, default
  `neutral`).
- Pill: `border-radius:9999px`, `padding:6px 12px`, 12px/600, single line
  with ellipsis overflow.
- `neutral`: bg `rgba(255,255,255,0.06)`, text `#e2e8f0`, border
  `rgba(255,255,255,0.1)`. `accent`: bg `rgba(127,240,204,0.12)`, text
  `#7ff0cc`, border `rgba(127,240,204,0.3)`. `light`: bg/border `#f1f5f9`,
  text `#0f172a`.

### MacroProgressBar
- Props: `percent` (0–100, clamped), `color` (one of the four macro hexes
  or the mint accent).
- Track: `height:8px`, `border-radius:9999px`,
  `background:rgba(255,255,255,0.08)`. Fill: same radius, solid `color`,
  `width:{percent}%`, `transition:width 0.3s ease`.

### MacroStatCard
- Props: `label`, `value` (number), `target` (number), `unit` (default
  `g`), `color` (macro hex).
- **Coerce `value`/`target` to `Number`** before comparing — the source
  code has an explicit comment that these arrive as strings from
  `dc-import`/query-param-style props, and `"485" > "2850"` is `true` under
  lexicographic string comparison, which would falsely trigger the
  "over target" state for larger-target macros like calories.
- Card: `border-radius:24px`, `padding:16px`, same glass-card
  border/background as `Card`.
- Label: 12px uppercase, `letter-spacing:0.2em`, `color:#94a3b8`.
- Value: 24px/600 `#f1f5f9`, followed by ` / {target}{unit}` in 13px
  `#94a3b8`.
- Progress track: `height:6px`; `pct = clamp(value/target*100, 0, 100)`.
- **Over-target state** (`value > target`): fill gets a glow — `box-shadow:
  0 0 0 3px {color}@22%, 0 0 10px 1px {color}@55%` — plus a caption
  `+{value-target}{unit} over target` in `color`, 11px/600. The bar itself
  is still visually capped at 100% width; the glow + caption communicate
  "exceeded" without letting the track overflow or reading as a bug.

### MealCard
- Props: `mealType`, `time`, `description`, `protein`, `carbs`, `fats`,
  `calories`, `onRemove`.
- Card: `border-radius:24px`, `padding:20px`.
- Header row: meal-type badge (neutral Badge style) + time (`13px
  #94a3b8`), and a remove button on the right.
- Remove button: **44×44px tap target** even though the visible glyph stays
  a 28px circle — the `<button>` itself is borderless/transparent and
  centers a smaller painted circle (`border:1px solid
  rgba(255,255,255,0.1)`, `background:rgba(255,255,255,0.04)`) containing
  a `×` glyph.
- Description: 14px, `line-height:1.625`, `color:#e2e8f0`,
  `overflow-wrap:anywhere` (long AI-generated descriptions must wrap, not
  overflow).
- Stats grid: 4 equal columns, each a `border-radius:16px` tile
  (`background:rgba(255,255,255,0.04)`) with an 11px `#94a3b8` label and a
  16px/600 value. Protein/carbs/fats values use their fixed macro colors
  (`#22c55e`/`#f59e0b`/`#ef4444`); the calories value is the neutral
  `#f1f5f9` in this component, not `--color-macro-calories` blue — differs
  from `MacroStatCard`, which does color calories blue.

### TopNav
- Props: `active` (`dashboard | log | weekly | settings`).
- Sticky top bar: `position:sticky; top:0`,
  `background:rgba(11,15,20,0.92)`, `backdrop-filter:blur(12px)`,
  `border-bottom:1px solid rgba(255,255,255,0.1)`.
- Below 1024px: just the logo mark (no wordmark, no nav links) + a Sign Out
  pill button on the right.
- At 1024px+: logo mark + "NutriPilot" wordmark on the left, nav pills
  (Dashboard / Log Meal / Weekly / Settings) centered, Sign Out on the
  right. Active pill: `background:#7ff0cc`, `color:#0f172a`; inactive:
  transparent, `color:#94a3b8`. Every pill/button keeps the 44px min touch
  target regardless of visible padding.
- Content max-width `1100px`, centered, padding steps `12px 20px` (mobile)
  → `14px 48px` (desktop).

### Logo
- Props: `variant` (`mark | lockup`, default `mark`), `size` (default 56,
  mark only).
- `mark`: square image, `{size}px` × `{size}px`.
- `lockup`: image at `width: size * 3.4`, `border-radius:20px`. See the
  "Sources" section above for why no transparent lockup PNG exists yet —
  compose it live from the transparent mark + a Sora 700 "NutriPilot"
  wordmark instead of trying to key the lockup screenshot.

### LoadingState / EmptyState / ErrorState
- **Not present verbatim in the shipped source** — the source only shows
  these as one-off inline patterns inside `ProfileForm.jsx`. Factored into
  three generic components here since every screen needs the same three
  states for its own data (meals, weekly history, profile).
- `LoadingState`: `role="status" aria-live="polite"`, glass-card box
  (`border-radius:16px`), a pulsing 8px mint dot
  (`@keyframes nutriPulseDot`, opacity 0.35↔1, 1.4s ease-in-out infinite),
  title (14px/600 `#f1f5f9`) + optional description (14px `#94a3b8`).
- `EmptyState`: dashed-border card (`border:1px dashed
  rgba(255,255,255,0.14)`, `background:rgba(255,255,255,0.03)`), centered
  text, optional primary-gradient CTA button.
- `ErrorState`: `role="alert"`, rose-tinted card (reuses the Alert `error`
  palette: `border:rgba(251,113,133,0.3)`, `background:rgba(244,63,94,0.1)`),
  centered text, optional ghost-style retry button.

## Logo asset caveat

Both source PNGs (`nutripilot-mark.png`, `nutripilot-lockup.png`) are
opaque screenshots of a Quick Look–style preview — a blurred desktop/room
photo sits behind the mark. `nutripilot-mark-transparent.png` was produced
by detecting the mark's circular ring and feathering a radial alpha mask
around it (geometric crop, no re-drawing) — safe to use anywhere. The
lockup's wordmark sits over the same photo, and that background isn't
uniformly dark enough to key out cleanly, so no
`nutripilot-lockup-transparent.png` exists. Instead, compose a transparent
lockup live — the transparent mark at left + "NutriPilot" set in Sora 700
to its right — rather than attempting to key the lockup screenshot further.
A real transparent lockup needs a clean-background export of the original
artwork (source SVG/Figma), not another keying attempt on this screenshot.
