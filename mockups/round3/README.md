# Round 3 — two independent frontend reimaginings + the review exchange

Two designers worked blind and in parallel, then critiqued each other's entry
plus the current live design (Plotter v3). Files are self-contained — open in
any browser.

## The three options

| Option | Thesis | The set-piece |
| --- | --- | --- |
| `urverk.html` (Fable's entry) | The notebook as a precision instrument: verifiability as aesthetic. | A live 24-h dial computing **today's actual daylight** in Stockholm & São Paulo client-side (NOAA equations), with a *visa beräkningen* panel exposing every intermediate, live solar elevations, and a time-spiral archive. |
| `sol.html` (independent second seat) | The site as an honest Swedish spec-sheet: the page held to its own standard. | A canvas 3D printer building a generative vase layer-by-layer with G-code readout — and a **page-level innehållsdeklaration** (1 HTML file · 0 external calls · 0 trackers · AI: ja, i formgivningen). |
| Live site (Plotter v3, in `src/`) | Quiet paper-and-ink editorial; generative plot as the notebook's record. | One strand per note, placed by date, deterministic; per-note innehållsdeklaration with a *signatur* line drawn from the note's own bytes. |

## The exchange — convergent findings (independent critics agreeing)

1. **Sol's page-level innehållsdeklaration is the best single idea of the round**
   — both critics, including its rival. "The site held to its own standard."
2. **Urverk's inspectable computation is the deepest on-mission move** — Sol's
   own words: "its exposed math is real where my G-code telemetry is theater."
3. **Plotter v3 is underpowered at one note** — both: the hero is a wisp in a
   field of paper until the archive fills in; "the concept pays off in 2028."
4. **v3's signatur sparkline + determinism discipline must survive any
   redesign** — both critics, unprompted.

## The strikes

- **Against Urverk:** the notes — the site's spine — start ~64 % down the page;
  the time-spiral collapses at n=1; the person is under-served ("an instrument
  demo with a byline"); index rows lack the declaration chips.
- **Against Sol:** fabricated telemetry (fake G-code, fictional LAGER 077/200)
  on a brand whose promise is "nothing hidden"; a full rebrand that discards
  the site's type system and no-cards rule; copy that crosses the no-cutesy
  line ("…Naturligtvis."); prints the owner's email; says "show process, not
  polish" three ways.
- **Against v3:** the plot's mapping is stated but not inspectable — poetic
  rather than verifiable; nothing above the fold says what the owner does.

## Rankings

- Sol's ballot: **Sol → Urverk → v3**
- Urverk's ballot: **Urverk → v3 → Sol**

## Design lead's synthesis — the composite for the main page

Keep **Plotter v3 as the base brand** (type system, hairlines, declarations —
best-engineered, already live). Then:

1. **Hero: lift Urverk's instrument** — it is complete on day one, always
   live, always true, and makes verifiability the identity. Add the missing
   fixes: profession line above the fold, notes index within 1.5 viewports.
2. **Move the strand plot to the arkiv page**, where it grows with the
   archive instead of apologizing for its emptiness on the homepage.
3. **Lift from Sol:** the page-level innehållsdeklaration (footer of every
   page) and the per-note metadata chips (ORD · AI · MIN) in index rows.
4. **Keep from v3:** the signatur sparkline, the determinism contract, the
   declaration schema.
5. **Refuse:** fabricated telemetry anywhere; the spiral until there are
   ≥ 8 notes; publishing the email without explicit owner sign-off.
