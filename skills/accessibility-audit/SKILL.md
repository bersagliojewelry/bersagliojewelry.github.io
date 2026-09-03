---
name: accessibility-audit
description: >-
  Audit an existing website, web app, or component for WCAG 2.1/2.2 AA accessibility by
  reading its code — color-contrast ratios, keyboard navigation, focus visibility, ARIA,
  form labels, headings, alt text, landmarks/skip-links, reduced-motion, language. Use
  whenever the user wants to audit, check, review, or assess the accessibility / a11y /
  WCAG compliance of existing UI — including reports that a screen-reader or keyboard user
  can't use something, whether specific colors or design tokens pass contrast, or "is this
  accessible?" — even if they never say "WCAG". Use PROACTIVELY after a redesign or before
  shipping, since redesigns routinely break contrast and focus. Produces a severity-ranked
  report (location + WCAG criterion + fix) plus what already passes. This EVALUATES
  accessibility — NOT building a11y features (e.g. a high-contrast toggle), writing alt-text
  content, editing photo contrast, restyling focus rings for looks, translating copy, or
  Lighthouse/perf work.
actualizada: 2026-09-03
reglas: 9
lecciones: [G:G-005]
origen: propia
---

# Accessibility Audit (WCAG 2.2 AA)

Audit an interface for accessibility by reading its code and computing the objective
checks (contrast ratios, presence of labels/landmarks/lang) rather than guessing. The
goal is a report the team can act on: each finding has a severity, a location, the WCAG
criterion it violates, and a concrete fix.

## Why this approach

- **Read and verify, never assume.** A control without a `<label for>` may still be named
  via `aria-label`; an `outline: none` may be replaced by a visible border; a faint token
  may only be used on decorative text. Assuming a violation without checking the code
  produces false positives that destroy the report's credibility. Open the files.
- **Severity drives action.** A team can't fix everything at once. Rank findings so the
  blocking ones (unlabeled forms, invisible focus, sub-3:1 text) come before nice-to-haves.
- **Document what PASSES.** Listing the things that are already correct prevents a future
  audit from re-flagging them and tells the team where the design is already solid.
- **Distinguish inherited from new.** When auditing after a change, separate regressions
  the change introduced from issues that pre-existed (often design-system-wide). Both go in
  the report, but only one is "this PR's fault."

## Workflow

### 1. Scope
Identify what's in scope: which pages, components, or routes, and which stylesheets/markup
back them. Note anything explicitly excluded (e.g., an admin panel out of redesign scope).

### 2. Gather signals fast (grep before reading)
Sweep the codebase for the tell-tale patterns before deep-reading. Useful searches:
- Focus: `:focus`, `:focus-visible`, `outline`, `outline:\s*(none|0)`
- Motion: `prefers-reduced-motion`
- Bypass/hidden text: `skip-link`, `skip-to`, `sr-only`, `visually-hidden`
- Language: `<html lang`
- Headings: `<h1`
- Names/roles: `aria-label`, `aria-labelledby`, `role=`, `<label`, `for=`
- Images: `alt=`
- Color tokens: the CSS custom properties / hex values used for text and accents

A `0` result is itself a finding (e.g., zero `<h1>` on a page, zero `prefers-reduced-motion`
guard in a stylesheet that animates).

### 3. Compute the objective checks
- **Color contrast (1.4.3 / 1.4.11):** compute the ratio for every text color on its
  background, and for UI/focus indicators. Don't eyeball it — use the formula in
  `references/wcag-checklist.md`. For `rgba()` text, composite over the background first.
- **Presence checks:** `<html lang>`, an `<h1>` per page, a skip link as the first focusable
  element, programmatic names on every form control.

### 4. Walk the dimensions
Go criterion by criterion. The full checklist — what each one means, how to verify it in
code, the common failure, and the fix — is in **`references/wcag-checklist.md`**. Read it;
it's the heart of this skill. The dimensions:

| Area | WCAG (AA) | Quick check |
|---|---|---|
| Text alternatives | 1.1.1 | Every meaningful `<img>` has a real `alt`; decorative ones `alt=""` |
| Info & relationships | 1.3.1 | Form controls have programmatic names; headings/lists are real markup |
| Color contrast (text) | 1.4.3 | Body ≥ 4.5:1, large text ≥ 3:1 |
| Non-text contrast | 1.4.11 | UI components & focus indicators ≥ 3:1 |
| Keyboard | 2.1.1 | Everything interactive reachable & operable by keyboard; no traps |
| Bypass blocks | 2.4.1 | A "skip to content" link before the nav |
| Headings & labels | 2.4.6 | One `<h1>`, logical heading order, descriptive labels |
| Focus visible | 2.4.7 | A clear focus indicator on every focusable element |
| Animation | 2.3.3 (AAA/best-practice) | Motion respects `prefers-reduced-motion` |
| Target size | 2.5.8 | Touch targets ≥ 24×24 px |
| Language | 3.1.1 | `<html lang>` set correctly |
| Name, role, value | 4.1.2 | Custom/ARIA widgets expose name + role + state |

### 4bis. WCAG 2.2 criteria the table above doesn't carry, and the rule that catches what axe misses

> **Provenance**: the five 2.2 criteria and the explicit 24×24 floor come from
> `addyosmani/web-quality-skills@afa8da94` (**MIT**, repo `LICENSE`; HEAD 2026-08-24, read **2026-09-03**),
> path `skills/accessibility/SKILL.md` — via DICTAMEN-C4 §10 **D-C4-28**. Rule 3 below is **ours**, measured
> the same day. Nothing above this block was rewritten: §3's contrast formula and `references/wcag-checklist.md`
> stay the source of truth.

| Area | WCAG 2.2 (AA) | Quick check |
|---|---|---|
| Focus not obscured (minimum) | 2.4.11 | A focused element is never fully hidden behind a sticky header, cookie bar or drawer |
| Focus appearance | 2.4.12 (AAA) | The focus indicator is thick enough and contrasts ≥ 3:1 against both states |
| Consistent help | 3.2.6 | Help affordances (contact, chat, FAQ link) sit in the same relative place on every page |
| Redundant entry | 3.3.7 | Information already given in a flow is auto-filled or offered, never retyped |
| Accessible authentication (minimum) | 3.3.8 | No cognitive-function test (puzzle, memorised code) without an alternative; allow paste into password fields |

1. **Target size is 24×24 CSS px MINIMUM (2.5.8 AA), and 48×48 is the comfort target.** State both numbers
   and measure the *hit area*, not the glyph: padding counts, `line-height` does not. A control that only
   passes because two adjacent targets are spaced apart must say so.
2. **`:focus` / `:focus-visible` with ZERO rules in the whole stylesheet is itself a finding.** Falling back
   to the UA ring keeps 2.4.7 alive by accident, but leaves **1.4.11 (indicator ≥ 3:1) unverified** — report
   it as 🟡 medium and *pending*, never as a pass. Walk `document.styleSheets` to prove the zero.
3. **ALWAYS cross the automated tool with the formula by hand — they disagree, and the gap is where the
   brand lives.** Measured on a live home page (2026-09-03): axe (Lighthouse 13.4.1) reported **1** contrast
   failure; the per-node formula found **3**. The two axe skipped were both the **brand gold** on white at
   **2.95:1** — the slogan and a headline. Two instruments, one series, both conditions written down
   ([[G:G-005]]). Corollary: text painted with `background-clip: text` over a gradient is **not measurable by
   formula** — declare it pending visual inspection instead of approving it, and composite `rgba()` text over
   its real background before computing (a naive reader that ignores alpha reports a fake 1:1).
4. **Automated categories are not the audit.** A tool score of 92 can coexist with three real AA failures.
   Screen-reader pass, keyboard focus order, 200 % zoom and Windows high contrast stay **Pending** unless a
   human ran them — say it in the report (see "Scope honesty").


### 5. Classify and write the report
Use the severity rubric in the reference. Then produce the report in the format below.

## Report format

Always structure the output like this:

```
## Accessibility audit — <scope> (<date>)
Method: WCAG 2.2 AA, verified by reading code (not assistive-tech tested unless stated).

### Findings
| # | Finding | WCAG | Severity | Location | Fix |
|---|---------|------|----------|----------|-----|
| A11Y-01 | <what's wrong, concretely> | 1.3.1/4.1.2 (A) | 🟠 high | file:line | <the fix> |
...

### Passes (verified correct — don't re-flag)
- <thing that's already accessible> ✅
...

### Deferred / needs decision
- <finding that needs a human call, e.g. a transversal token change>

### Pending (couldn't verify from code)
- Screen-reader pass (NVDA/VoiceOver), real keyboard walk, target-size on device
```

Give findings stable IDs (`A11Y-01`, `A11Y-02`, …) so they can be referenced across fix
commits. When auditing after a change, tag each finding **inherited** or **regression**.

## Severity (summary — full rubric in the reference)
- 🔴 **critical**: blocks a core task for AT users (keyboard trap, unusable form).
- 🟠 **high**: a primary control is unnamed or text is well under contrast minimum.
- 🟡 **medium**: present-but-imperfect (weak focus, missing h1, slightly-sub-AA).
- 🟢 **low**: AAA-level or best-practice gaps (reduced-motion, minor target size).

## Scope honesty
A code audit reliably catches contrast, names, structure, landmarks, and lang. It does NOT
replace a real screen-reader + keyboard pass for focus order, live regions, and announced
state — always say so in the report and list those as Pending rather than implying they passed.

For the detailed per-criterion checklist, contrast math, severity rubric, and grep recipes,
read `references/wcag-checklist.md`.
