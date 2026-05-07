# SpeedStars 2.0 — Game Plan & Progress Tracker

## Project Summary
A complete browser-based track & field athletics game (HTML5 Canvas, Vanilla JS, GitHub Pages).
Recreates and expands on the original SpeedStars with all field events including throwing events.

## Tech Stack
- HTML5 Canvas (800×450)
- Vanilla JavaScript (ES6, no frameworks, no build tools)
- LocalStorage for personal bests
- GitHub Pages compatible (static files only)

## Controls Design
- **Sprint mechanic**: Alternate A / D (or ← →) — cadence ~5/sec, max speed 10, same key = penalty
- **Throwing mechanic**: 3-phase — Build Power (A/D rhythm, optimal ~4-5/sec, too fast loses control) → Aim (Space to lock angle on oscillating needle) → Release (Space at peak of pulsing ring)
- **Jump events**: Sprint with A/D then Space to jump at the right moment
- **High jump**: Space to jump, timing bar determines height

---

## Events Checklist

### Track Events
- [x] 100m Sprint — countdown → sprint → finish time
- [x] 200m Sprint — same mechanic, longer distance
- [x] 400m Sprint — endurance variant
- [x] 110m Hurdles — sprint + Space to clear hurdles, hit = speed penalty
- [x] 400m Hurdles — longer hurdle race

### Jump Events
- [x] Long Jump — sprint approach, Space at board, flight arc, distance result
- [x] Triple Jump — sprint, then Space 3× for hop-step-jump
- [x] High Jump — timing bar approach, bar increments each success, 3 failures = done

### Throwing Events
- [x] Shot Put — full 3-phase throw mechanic (A/D rhythm + aim + release)
- [x] Discus Throw — same mechanic, more rotations, optimal cadence 5/sec
- [x] Javelin Throw — sprint run-up (A/D) → aim → release (own class)
- [x] Hammer Throw — same 3-phase mechanic, 3.5s windup, most rotations

---

## Features Checklist

### Core Game
- [x] Main menu — 3-column layout (Track / Jump / Throw), keyboard navigation
- [x] Event start / countdown overlay
- [x] 60fps game loop with delta-time
- [x] Result screen — shows time/distance, WR comparison bar, medal rating
- [x] Personal bests saved to localStorage
- [x] Escape to return to menu

### Athlete Renderer
- [x] Stick figure athlete with running animation (limb swing from step count)
- [x] Jump pose
- [x] Throw pose
- [x] Shadow under athlete

### Visual / UX
- [x] Sky gradient + subtle star background
- [x] Scrolling track with lane lines
- [x] Sand pit for long/triple jump
- [x] Hurdles drawn with correct dimensions
- [x] High jump mat, standards, and bar
- [x] Throwing circle
- [x] Trajectory arc (bird's-eye sector view for throws)
- [x] Distance markers on throw field
- [x] Speed meter with colour zones (red/amber/green)
- [x] Rhythm gauge for throwing wind-up
- [x] Angle protractor gauge
- [x] Pulsing release ring

---

## Still To Do (Human Tasks or Future Cycles)

### Code / Features
- [ ] **Pole Vault** — requires more complex arc physics + bar clearance logic; skipped for v1
- [ ] **400m Sprint pacing mechanic** — currently identical to 100m; could add fatigue/stamina bar
- [ ] **Sound effects** — Web Audio API beeps for steps, jump, land, crowd cheer on PB
- [ ] **Crowd reaction system** — text animations (OOOOH, CROWD GOES WILD) on good throws
- [ ] **Career/progression mode** — qualify for events, championships, season structure
- [ ] **Multiplayer** — local 2-player split controls or WebSocket online
- [ ] **Animated intro sequence** — athlete walks to start line
- [ ] **Medal ceremony screen** — podium visual for gold/silver/bronze results
- [ ] **World leaderboard** — online PB sharing (requires backend)
- [ ] **Mobile touch controls** — tap buttons for A/D and Space on touchscreen
- [ ] **Athlete customisation** — choose jersey colour, name

### Polish
- [ ] **Wind mechanic** — for throws and long/triple jump, affects distance
- [ ] **Fosbury flop animation** — proper over-the-bar back arch for high jump
- [ ] **Better athlete sprite** — more detailed or sprite-sheet based
- [ ] **Track/stadium background art** — crowd stands, sky, flags
- [ ] **Event replay** — watch your best attempt again
- [ ] **Tutorial overlay** — first-time explanation of each mechanic

### Human / Design Tasks
- [ ] **Tune distances** — play-test all 12 events and calibrate so gold medal requires genuine skill
- [ ] **Tune rhythm window** — play-test optimal cadence range for each throwing event
- [ ] **Balance sprint speed formula** — verify the A/D cadence to m/s mapping feels right
- [ ] **GitHub Pages deployment** — push to `gh-pages` branch or configure repo settings

---

## Architecture

```
SpeedStars2.0/
├── index.html          Entry point
├── style.css           Visual styles
├── GAME_PLAN.md        This file
└── js/
    └── game.js         Complete game (~1800 lines, single file)
                        Sections:
                          - Constants & colors
                          - InputHandler
                          - Utility draw functions
                          - Athlete renderer
                          - SprintMechanic (shared)
                          - ThrowMechanic (shared 3-phase)
                          - BaseEvent
                          - SprintEvent (100m, 200m, 400m)
                          - HurdlesEvent (110m, 400m)
                          - LongJumpEvent
                          - TripleJumpEvent
                          - HighJumpEvent
                          - ThrowingEvent (ShotPut, Discus, Hammer)
                          - JavelinEvent
                          - Game (state machine, menu, results)
```

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
| Shot Put | 23.37m (Barnes) |
| Discus | 74.08m (Schult) |
| Javelin | 98.48m (Zelezny) |
| Hammer | 86.74m (Sedykh) |
