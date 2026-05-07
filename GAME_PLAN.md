# SpeedStars 2.0 — Game Plan & Progress Tracker

## Project Summary
A complete browser-based track & field athletics game (HTML5 Canvas, Vanilla JS, GitHub Pages).
Recreates and expands on the original SpeedStars with all field events including throwing events.

## Tech Stack
- HTML5 Canvas (800×450)
- Vanilla JavaScript (ES6, no frameworks, no build tools)
- LocalStorage for personal bests
- GitHub Pages compatible — static files only, no build step
- GitHub Actions for automatic deployment on push to `main`

## Controls Design
- **Sprint**: Alternate A / D (or ← →) — cadence ~5/sec, max speed 10
- **Throwing**: 3-phase — Build Power (A/D rhythm, optimal ~4-5/sec) → Aim (Space to lock oscillating needle) → Release (Space at peak of pulse ring)
- **Jump events**: Sprint A/D then Space to jump at the right moment
- **High jump / Pole vault**: Space on timing bar
- **Touch**: On-screen A, D, SPACE buttons (auto-shown on mobile)

---

## Events Checklist

### Track Events
- [x] 100m Sprint
- [x] 200m Sprint
- [x] 400m Sprint — with stamina bar (depletes at high speed, limits top speed)
- [x] 110m Hurdles — Space to clear, hit = speed penalty
- [x] 400m Hurdles

### Jump Events
- [x] Long Jump — sprint approach + Space at board + arc
- [x] Triple Jump — hop/step/jump × 3
- [x] High Jump — timing bar, bar increments, 3 failures = done
- [x] Pole Vault — sprint → plant timing → pull timing → clearance

### Throwing Events
- [x] Shot Put — 3-phase mechanic (rhythm/aim/release), wind applied
- [x] Discus Throw — same mechanic, higher optimal cadence, more wind effect
- [x] Javelin Throw — run-up sprint then aim + release, wind applied
- [x] Hammer Throw — 3.5s wind-up, most rotations

---

## Features Checklist

### Core Game
- [x] Main menu — 3-column layout (Track / Jump / Throw), keyboard navigation
- [x] Event start / countdown with gun sound
- [x] 60fps game loop with delta-time
- [x] Result screen — time/distance, WR comparison bar, level rating
- [x] Personal bests saved to localStorage
- [x] Escape to return to menu
- [x] Retry with R key

### Mechanics
- [x] Sprint cadence mechanic (same-key penalty, speed 0–10)
- [x] 400m stamina — depletes at high speed, limits max speed when empty
- [x] Throwing 3-phase — rhythm build, angle aim, release timing
- [x] Wind mechanic — random –4 to +4 m/s, shown during event, applied to distance
- [x] Distance calculations calibrated — average of 3 skill factors × range [minDist, WR]

### Sound (Web Audio API, no files)
- [x] Step sounds (A/D key presses)
- [x] Jump sound
- [x] Land sound
- [x] Starting gun
- [x] Throw whoosh
- [x] Hurdle clearance
- [x] Bar clearance
- [x] Personal best fanfare

### Visual / UX
- [x] Sky gradient + stars
- [x] Scrolling track with lane lines, finish line
- [x] Sand pit for jump events
- [x] Hurdles with hit/cleared colour states
- [x] High jump: mat, standards, bar, timing UI
- [x] Pole vault: bar, standards, mat, bending pole arc, athlete vault pose
- [x] Throwing circle with spinning line
- [x] Bird's-eye sector view for throw trajectory
- [x] Wind indicator on all outdoor events
- [x] Speed meter with colour zones
- [x] Rhythm gauge for throwing
- [x] Angle protractor gauge
- [x] Pulsing release ring
- [x] Phase indicator (BUILD / AIM / RELEASE)
- [x] Stamina bar on 400m

### Mobile
- [x] Touch controls — A, D, SPACE buttons auto-shown on touchscreen

### Deployment
- [x] GitHub Actions workflow — auto-deploys to GitHub Pages on push to `main`

---

## Still To Do (Human Tasks or Future Cycles)

### Requires Human Action
- [ ] **GitHub Pages activation** — Go to repo Settings → Pages → Source: "GitHub Actions" → Save. This is a one-time click in the GitHub UI. Then merge this branch into `main` and the site deploys automatically.
- [ ] **Play-test and tune distances** — All 12 events need real play-testing. Calibrate so bronze ~65% WR, gold ~95% WR, requires genuine skill but is achievable.
- [ ] **Tune rhythm window** — Play-test throwing cadence (optimal 4-5/sec). Is the green zone too wide? Too forgiving? Adjust `optCadence` and `windupDuration` in `game._startEvent()`.
- [ ] **Balance sprint speed** — Verify the A/D cadence → m/s mapping feels right. Adjust the `1.12` multiplier in `SprintMechanic.update()`.

### Future Code (Lower Priority)
- [ ] **Fosbury flop animation** — Proper back-arch over the bar for high jump (current is basic arc)
- [ ] **Better athlete sprite** — More detailed or sprite-sheet based rendering
- [ ] **Crowd/stadium background** — Stands, crowd, flags
- [ ] **Crowd reaction text** — "OOOOH!", "CROWD GOES WILD!" animations on big throws
- [ ] **Career/progression mode** — Qualify for events, championships, season
- [ ] **Multiplayer** — Local 2-player or online (requires backend)
- [ ] **World leaderboard** — Online PB sharing (requires backend/server)
- [ ] **Event replay** — Watch your best attempt again
- [ ] **Full tutorial** — First-time control explanation per event

---

## Architecture

```
SpeedStars2.0/
├── index.html                      Entry point
├── style.css                       Visual styles
├── GAME_PLAN.md                    This file
├── .github/
│   └── workflows/
│       └── deploy.yml              Auto-deploy to GitHub Pages on push to main
└── js/
    └── game.js                     Complete game (~1700 lines)
                                    Sections:
                                      - Constants & colors
                                      - InputHandler (keyboard + touch injection)
                                      - SoundFX (Web Audio API, procedural)
                                      - Utility draw functions
                                      - Athlete renderer (run/jump/vault/throw poses)
                                      - SprintMechanic (shared, step sounds)
                                      - ThrowMechanic (shared 3-phase, wind)
                                      - BaseEvent
                                      - SprintEvent (100m/200m/400m, stamina)
                                      - HurdlesEvent (110m/400m)
                                      - LongJumpEvent (wind)
                                      - TripleJumpEvent (wind)
                                      - HighJumpEvent
                                      - PoleVaultEvent (NEW in v2)
                                      - ThrowingEvent (ShotPut/Discus/Hammer, wind)
                                      - JavelinEvent (wind)
                                      - TouchControls
                                      - Game (state machine, menu, results)
```

## How to Deploy to GitHub Pages

**One-time setup:**
1. Push/merge this branch into `main`
2. On GitHub: Settings → Pages → Source → "GitHub Actions" → Save
3. Every future push to `main` auto-deploys in ~30 seconds

**Live URL** (after setup): `https://joel-trumpet-67.github.io/SpeedStars2.0/`

## World Records Reference
| Event | WR |
|---|---|
| 100m | 9.58s (Bolt) |
| 200m | 19.19s (Bolt) |
| 400m | 43.03s (Van Niekerk) |
| 110m Hurdles | 12.80s (Merritt) |
| 400m Hurdles | 46.70s (Warholm) |
| Long Jump | 8.95m (Powell) |
| Triple Jump | 18.29m (Edwards) |
| High Jump | 2.45m (Sotomayor) |
| Pole Vault | 6.21m (Mondo) |
| Shot Put | 23.37m (Barnes) |
| Discus | 74.08m (Schult) |
| Javelin | 98.48m (Zelezny) |
| Hammer | 86.74m (Sedykh) |
