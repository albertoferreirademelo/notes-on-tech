# PLAN-REVIEW-LOG.md — round 4

Adversarial cross-review of PLAN.md by an independent reviewer (did not write
the plan). Method per grill-me-codex Act 2.

## Round 1 — VERDICT: REVISE

Four blockers, all accepted:

1. **DOM order defeats identity-first.** The reused Urverk source has the dial
   column before the masthead — on mobile that stacks dial-above-name, and on
   desktop tab/reading order hits the instrument first: exactly the "instrument
   demo with a byline" the client banned. → **Masthead FIRST in source**;
   desktop grid keeps it left by source order; no CSS `order` hacks.
2. **Reduced-motion vs a "live JUST NU".** "No animation" + a live readout
   conflict: a frozen clock under a "right now" header is dishonest; ticking
   breaks the rule. → **Decouple.** No seconds shown, so under reduced-motion
   run `updateReadout()` + one hand reposition on a **60 s** cadence (a clock
   is not "motion"); never the per-second `drawDial()`. Per-second only when
   motion is allowed. Theme redraw stays exempt (and must fire even under RM,
   else the dark dial stays light).
3. **Footer AI line too soft.** Keep the disclosure (it's a provenance label,
   on brand) but "granskad av en människa" is reassurance-speak out of register
   with "externa anrop 0". → Trim to: `AI: ja — i formgivningen · text: människa`
   (states the real distinction: AI touched the design, not the notes).
4. **1440×900 fit unmandated.** → Mandate: grid `54% / 46%`, column-gap 3rem;
   dial `min(56vh, 40vw)` centered; name `clamp(3rem, 4.4vw, 4.6rem)`;
   profession `max-width: 32ch`; hero `min-height: min(86vh, 850px)`. Verify
   "Ferreira de Melo" does not wrap to 3 lines in the ~618px column.

Concerns/missing folded in: real note = **114 words / ≈1 min** (not the mockup's
111 — no fabricated numbers); `overflow-x: hidden` on body; localStorage theme
persistence; profession line given real weight/color (not muted italic);
DST-aware `Intl` time zones instead of hardcoded July offsets; `arkiv` nav must
point somewhere real or be dropped; index/chip numbers sourced from the note.

## Round 2 — VERDICT: APPROVE (plan revised; see PLAN.md "Revision after Act 2")

All four blockers resolved in the revised plan. Cleared to build (Act 3).
