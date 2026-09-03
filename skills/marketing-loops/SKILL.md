---
name: marketing-loops
description: "When the user wants to set up a recurring, self-running marketing workflow — a repeatable loop an AI agent runs on a cadence (weekly, daily, on a trigger) rather than a one-off task. Also use when the user mentions 'marketing loop,' 'recurring marketing workflow,' 'automate my marketing,' 'marketing on autopilot,' 'weekly marketing review,' 'ad fatigue check,' 'content refresh loop,' 'churn watch,' 'ranking drop alert,' 'always-on marketing,' 'marketing automation workflow,' or 'run this every week.' Use this to pick, adapt, and schedule an ongoing marketing loop that orchestrates the other marketing skills. For one-off marketing ideas, see marketing-ideas. For the experimentation loop specifically, see ab-testing."
metadata:
  version: 1.2.0
actualizada: 2026-09-02
reglas: 9
lecciones: []
origen: coreyhaines31/marketingskills@2.8.12
---

> **⚠️ VENDORIZADA 2026-07-18 (ADR §35)** del repo *marketingskills* de Corey Haines (licencia MIT — ver
> LICENSE-marketingskills.txt; versión repo 2.8.12). Cross-refs del origen → nuestros nombres: ads=paid-ads ·
> cro=page-cro/form-cro · analytics=analytics-tracking · emails=email-sequence · ab-testing=ab-test-setup ·
> social=social-content. Ignorar links a ../../tools/ (no vendorizado; sus CLIs Meta/Google usan APIs MUERTAS).
> **Capa ALTORRA obligatoria**: español · inmobiliaria B2C Cartagena · $0/free-tier · voz = catalogo-voz-altorra ·
> compliance = COLOMBIA (Ley 1581/2012, SIC; NO portar CAN-SPAM/TCPA/GDPR como si aplicaran) · pauta → guardarraíles
> de marketing-psicologico-conversion §10 (RNT/matrícula/sin cifras inventadas/Housing verificado §34).
> Nota propia: ignorar los loops SaaS (churn-signal/trial/PQL/dunning/pricing-page — no aplican); construir loops de PAUTA y CONTENIDO (cronograma §9c, revisión semanal TCPL, respuesta de reseñas GBP).

# Marketing Loops

You help set up **marketing loops** — repeatable marketing workflows an AI agent runs on a cadence, each with a defined trigger, a bounded set of steps, a self-check, and an explicit stopping condition. A loop turns a marketing task you'd otherwise do manually (and forget) into an always-on system: the weekly SEO opportunity scan, the ad-fatigue refresh, the churn-signal watch.

This is the operational cousin of `marketing-ideas`. Ideas tell you *what to try once*. Loops tell you *what to keep doing on a schedule* — and wire the other marketing skills together to do it.

## How to Use This Skill

**Check for product marketing context first:** if `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md`), read it before asking questions. Use that context and only ask for what's missing.

Then:
1. **Clarify the job.** What outcome should this loop protect or grow? (rankings, ad efficiency, activation, retention, revenue, referrals)
2. **Pick a loop** from the catalog in `references/loop-catalog.md` — or adapt the closest one.
3. **Tune the cadence** to how fast the underlying signal actually changes (see the cadence rule below).
4. **Confirm the human checkpoint.** Decide what the loop does autonomously vs. what it stages for human approval before publishing or spending — see `references/loop-guardrails.md`.
5. **Schedule it** (see "Scheduling a loop" below).

Building more than one loop, or a whole marketing operating system? See `references/loop-orchestration.md` for how loops compose and the order to adopt them (start with tracking + a weekly review; don't build 43 at once).

## Anatomy of a Marketing Loop

Every loop in the catalog has these nine parts. When you author or adapt one, fill all of them — a loop missing a stop condition, a self-check, or its state handling is a liability, not an asset.

| Part | What it defines |
|------|-----------------|
| **Check cadence** | How often the loop *looks* (weekly / daily / on-trigger). Match it to signal speed. |
| **Acts when** | The action condition — what must be true to actually *do* something, vs. just check and skip. Most runs of a good loop are "checked, nothing to do." |
| **Purpose** | The one outcome this loop exists to move. |
| **Skills used** | Which marketing skills the loop orchestrates each iteration. |
| **Loop body** | The ordered steps run each iteration. |
| **Self-check** | The verification done *before* acting — so the loop doesn't act on noise, seasonality, or a tracking bug. |
| **State / idempotency** | What the loop remembers between runs: last-run marker, dedupe key, cooldown window, "already handled" set. Without this, loops double-act, re-nag the same people, or re-alert the same thing. Non-negotiable for anything scheduled — see `references/loop-state.md` for where state lives and the idempotency patterns. |
| **Stop / bail-out** | When the loop skips, halts, escalates to a human, or disables itself — plus what it does on error. Every loop needs one, including heartbeat loops (their stop is "manual disable + error-halt," never "n/a"). |
| **Output** | Where results go: a file, a PR, a staged draft, a notification, a report. |

The **Check cadence / Acts when** split matters: a churn-signal loop might *check* daily but only *act* when an account crosses a risk threshold it hasn't been contacted about inside the cooldown window. Conflating the two produces loops that either miss the window or spam.

## The cadence rule

Match cadence to how fast the signal actually changes — not to how often you'd *like* an update.

| Signal | Realistic cadence | Why |
|--------|-------------------|-----|
| Rankings, backlinks, domain authority | Weekly | Move slowly; daily checks are noise |
| Ad creative fatigue, CPA drift | Every 2–3 days | Meta/Google feedback loops are days, not hours |
| Activation / onboarding funnel | Weekly | Needs enough signups to be significant |
| Churn signals | Daily or on-trigger | Early intervention window is short |
| Content / copy decay | Monthly | Traffic erosion is gradual |
| Competitor changes | Weekly | Pricing/positioning shifts are infrequent but matter |
| Social listening / mentions | Daily | Engagement windows close fast |

Over-frequent loops are the most common failure mode: they generate busywork, burn budget, and train you to ignore the output.

## When NOT to loop

Not everything should be automated on a cadence. Skip a loop — or add a mandatory human checkpoint — when:

- **Strategy or creative direction is the real work.** Loops maintain and optimize; they don't set positioning, invent campaigns, or make brand calls.
- **The action publishes or spends without review.** Auto-*drafting* an ad, email, or post is fine. Auto-*publishing* or auto-*shifting budget* needs a human checkpoint unless the user has explicitly authorized autonomous action and set guardrails (caps, allowlists).
- **The signal is too sparse to be significant.** A weekly conversion-rate loop on 40 visitors/week is measuring noise.
- **It's a vanity loop.** If nobody acts on the output, delete the loop. A loop that emails a dashboard nobody reads is worse than nothing.

For any loop that sends, spends, publishes, or touches personal data, apply `references/loop-guardrails.md` — the two-tier action model (autonomous-safe vs. gated), spend/send caps, CAN-SPAM/GDPR/FTC/ToS rules, the always-escalate list, and a required kill switch.

## Scheduling a loop

These loops are agent-agnostic — the *body* works in any agent. The *scheduling* depends on your environment:

- **Claude Code** — native options: `/loop` (self-paced, until a condition), `ScheduleWakeup` (dynamic pacing that reacts to state), and `CronCreate` (fixed cron schedule). If you have a loop-mechanics skill such as `loopify` installed, use it to choose between them and tune delays; otherwise the guidance below is enough.
- **Any agent + cron** — wrap the loop body as a scheduled prompt/script (`0 9 * * 1` for Mondays 9am, etc.).
- **Manual cadence** — for high-judgment loops, "run this skill every Monday" is a perfectly good loop. The value is the repeatable *body*, not the automation.

Default to time-of-day cron for review-style loops (weekly review, ranking watch) and dynamic pacing for monitor-until-threshold loops (churn watch, launch-day tracking).

## The Catalog

`references/loop-catalog.md` holds the full library — 43 marketing loops with thorough funnel coverage: SEO & Content, Paid, Earned/Social/Partnerships, Activation, Retention, Revenue, Referral & Advocacy, and Ongoing Ops. Each is a complete, adaptable spec. Start there, pick the closest match, and tune it to the user's product, stage, and tooling.

## Authoring a new loop

When nothing in the catalog fits, author a new loop from `references/loop-template.md` — a copy-paste template with fill-in prompts, a worked before/after example, and a ship checklist. Fill all nine anatomy parts; if you can't answer the self-check, state/idempotency, and stop/bail-out concretely, the loop isn't ready to run.

## The digest loop — the four rules that decide whether it survives

A saved-search / new-match digest is the cheapest recurring loop there is, and the one most often
shipped broken. Four rules, learned the hard way (ALTORRA portal, 2026-08-21):

1. **Advance the "already sent" watermark ONLY after the provider accepted the batch.** If a network
   failure moves it anyway, every item published in that window is invisible forever. Accept the
   opposite risk deliberately: a lost response means someone gets the same digest twice. Repeating is
   noise; losing breaks the promise the signup page made.
2. **Take "now" BEFORE you read the data, not after you send.** Anything published between the read
   and the send would otherwise fall below the watermark and never be announced.
3. **Unsubscribe is a POST, never a GET.** Gmail, Outlook and corporate antivirus *open* the links in
   a message to scan them; with the opt-out on the GET they will unsubscribe people who never read
   it. Link to a page with a button, and also send `List-Unsubscribe` +
   `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (RFC 8058) so the mail client renders its own
   button — without it, people use "mark as spam" to stop the mail, and that burns the domain.
4. **Send nothing when there is nothing.** A digest that goes out empty on a quiet day trains people
   to ignore it, and the promise on the signup page should say so in those words: *one email a day at
   most, and only if there is something new*. Cap the items per email and link to the full search —
   and if a daily quota forces you to defer some recipients, **log what was deferred**: a silent
   truncation reads as "nobody matched."

## Anti-patterns

- Looping without a stop condition → runaway spend or infinite churn.
- Same cadence for every loop → most run too often and get ignored.
- No self-check → the loop acts on noise, seasonality, or a tracking bug.
- No human checkpoint on spend/publish actions.
- Building 10 loops at once → start with one, prove it earns its keep, then add the next.

## Banned vocabulary

Avoid: "set it and forget it," "fully autonomous marketing," "AI does everything," "10x on autopilot," "growth hacking machine." Loops are disciplined systems with checkpoints, not magic. Describe them honestly.

## Related Skills

- **marketing-ideas** — one-off tactics and inspiration (what to try). Loops operationalize the ones worth repeating.
- **ab-testing** — the experimentation loop specifically (hypothesis → test → promote winner → repeat).
- **analytics** — most loops read from analytics to decide whether to act.
- Individual channel skills (`ads`, `seo-audit`, `emails`, `social`, `churn-prevention`, `pricing`, `referrals`) — the loop bodies orchestrate these.
