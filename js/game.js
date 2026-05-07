'use strict';
// ================================================================
// SPEEDSTARS 2.0 — Complete Track & Field Athletics
// ================================================================

const W = 800, H = 450;

// ── Palette ──────────────────────────────────────────────────────
const C = {
  bg: '#08090f',
  skyTop: '#0d1b2a', skyBot: '#1d5f8a',
  ground: '#1a3a0d', groundAlt: '#1e4010',
  track: '#8B2500', trackAlt: '#7a1f00',
  trackLine: 'rgba(245,222,179,0.45)',
  laneW: '#F5DEB3',
  skin: '#FDBCB4', hair: '#2c1810',
  shirt: '#e63946', pants: '#1d3461', shoe: '#111',
  sandPit: '#F4D03F',
  mat: '#2196F3',
  bar: '#C0C0C0',
  circle: '#555', circleLine: '#888',
  uiBg: 'rgba(5,10,20,0.88)', uiBrd: '#00e676', uiBrdDim: '#005c2c',
  powerHi: '#00e676', powerMid: '#FFD700', powerLo: '#e63946',
  white: '#fff', dim: '#666',
  gold: '#FFD700', silver: '#C0C0C0', bronze: '#CD7F32',
  red: '#e63946', cyan: '#00e5ff',
  hurdle: '#5d4037',
};

// ── Event catalog ─────────────────────────────────────────────────
const CATALOG = [
  { id:'s100', name:'100m Sprint',   cat:'Track', ctrl:'A/D alternate', desc:'Fastest human alive. Pure speed.' },
  { id:'s200', name:'200m Sprint',   cat:'Track', ctrl:'A/D alternate', desc:'Speed around the bend.' },
  { id:'s400', name:'400m Sprint',   cat:'Track', ctrl:'A/D alternate', desc:'One brutal lap. Pace yourself.' },
  { id:'h110', name:'110m Hurdles',  cat:'Track', ctrl:'A/D + Space',   desc:'Sprint and leap over 10 barriers.' },
  { id:'h400', name:'400m Hurdles',  cat:'Track', ctrl:'A/D + Space',   desc:'Hurdles over 400m. The man-killer.' },
  { id:'lj',   name:'Long Jump',     cat:'Jump',  ctrl:'A/D + Space',   desc:'Sprint hard, hit the board, fly.' },
  { id:'tj',   name:'Triple Jump',   cat:'Jump',  ctrl:'A/D + Space×3', desc:'Hop, step and jump for distance.' },
  { id:'hj',   name:'High Jump',     cat:'Jump',  ctrl:'Space timing',  desc:'Fosbury flop — time it perfectly.' },
  { id:'sp',   name:'Shot Put',      cat:'Throw', ctrl:'A/D rhythm + Space×2', desc:'Rhythm, angle, release.' },
  { id:'dt',   name:'Discus',        cat:'Throw', ctrl:'A/D rhythm + Space×2', desc:'Full spin, maximum rotational power.' },
  { id:'jt',   name:'Javelin',       cat:'Throw', ctrl:'A/D sprint + Space×2', desc:'Sprint, plant, launch at perfect angle.' },
  { id:'ht',   name:'Hammer Throw',  cat:'Throw', ctrl:'A/D rhythm + Space×2', desc:'4 rotations, release at the moment.' },
];

const WR      = { s100:9.58,  s200:19.19, s400:43.03, h110:12.80, h400:46.70,
                  lj:8.95, tj:18.29, hj:2.45, sp:23.37, dt:74.08, jt:98.48, ht:86.74 };
const WR_UNIT = { s100:'s', s200:'s', s400:'s', h110:'s', h400:'s',
                  lj:'m', tj:'m', hj:'m', sp:'m', dt:'m', jt:'m', ht:'m' };
const LOWER_IS_BETTER = { s100:true, s200:true, s400:true, h110:true, h400:true,
                           lj:false, tj:false, hj:false, sp:false, dt:false, jt:false, ht:false };

// ================================================================
// INPUT HANDLER
// ================================================================
class Input {
  constructor() {
    this.down = {};
    this.pressed = {};
    this._p = [];
    document.addEventListener('keydown', e => {
      if (!this.down[e.code]) { this.pressed[e.code] = true; this._p.push(e.code); }
      this.down[e.code] = true;
      if (['Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code)) e.preventDefault();
    });
    document.addEventListener('keyup', e => { this.down[e.code] = false; });
  }
  tick() { for (const k of this._p) this.pressed[k] = false; this._p = []; }
  isDown(k) { return !!this.down[k]; }
  wasPressed(k) { return !!this.pressed[k]; }
}

// ================================================================
// UTILITIES
// ================================================================
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function txt(ctx, text, x, y, size, color, align = 'center', bold = false) {
  ctx.font = `${bold ? 'bold ' : ''}${size}px "Courier New", monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

function bar(ctx, x, y, w, h, val, max, bg = '#1a1a1a') {
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);
  const r = clamp(val / max, 0, 1);
  ctx.fillStyle = r > 0.7 ? C.powerHi : r > 0.35 ? C.powerMid : C.powerLo;
  ctx.fillRect(x, y, w * r, h);
  ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
}

function panel(ctx, x, y, w, h, title = '') {
  ctx.fillStyle = C.uiBg; ctx.strokeStyle = C.uiBrd; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 4); ctx.fill(); ctx.stroke();
  if (title) txt(ctx, title, x + w / 2, y + 14, 10, C.uiBrd, 'center', true);
}

function sky(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  g.addColorStop(0, C.skyTop); g.addColorStop(1, C.skyBot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H * 0.55);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  for (let i = 0; i < 28; i++) ctx.fillRect((i * 97 + 11) % W, (i * 43 + 7) % (H * 0.38), 1, 1);
}

function ground(ctx) {
  const g = ctx.createLinearGradient(0, H * 0.45, 0, H);
  g.addColorStop(0, C.ground); g.addColorStop(1, '#0e1f08');
  ctx.fillStyle = g; ctx.fillRect(0, H * 0.45, W, H * 0.55);
}

function track(ctx) {
  ctx.fillStyle = C.track; ctx.fillRect(0, H * 0.6, W, H * 0.4);
  ctx.strokeStyle = C.trackLine; ctx.lineWidth = 0.5; ctx.setLineDash([28, 18]);
  for (let i = 1; i < 8; i++) {
    const ly = H * 0.6 + i * (H * 0.38 / 8);
    ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(W, ly); ctx.stroke();
  }
  ctx.setLineDash([]); ctx.strokeStyle = C.laneW; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, H * 0.6); ctx.lineTo(W, H * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, H * 0.98); ctx.lineTo(W, H * 0.98); ctx.stroke();
}

// ================================================================
// ATHLETE RENDERER
// ================================================================
function athlete(ctx, x, y, scale, frame, facing, pose) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing * scale, scale);
  const ls = Math.sin(frame * 0.32) * 0.55;
  const as = -ls;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath(); ctx.ellipse(0, 43, 17, 5, 0, 0, Math.PI * 2); ctx.fill();

  ctx.lineWidth = 5; ctx.lineCap = 'round';

  if (pose === 'run') {
    // Legs
    ctx.strokeStyle = C.pants;
    ctx.beginPath(); ctx.moveTo(0,15); ctx.lineTo(-7+ls*16,30); ctx.lineTo(-7+ls*11,43); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,15); ctx.lineTo( 7-ls*16,30); ctx.lineTo( 7-ls*11,43); ctx.stroke();
    // Shoes
    ctx.strokeStyle = C.shoe; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-7+ls*11,43); ctx.lineTo(-13+ls*11,44); ctx.stroke();
    ctx.beginPath(); ctx.moveTo( 7-ls*11,43); ctx.lineTo( 13-ls*11,44); ctx.stroke();
    // Body
    ctx.strokeStyle = C.shirt; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(0,-5); ctx.lineTo(0,15); ctx.stroke();
    // Arms
    ctx.strokeStyle = C.skin; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0,2); ctx.lineTo(-13-as*13,14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,2); ctx.lineTo( 13+as*13,14); ctx.stroke();
  } else if (pose === 'jump') {
    ctx.strokeStyle = C.pants;
    ctx.beginPath(); ctx.moveTo(0,15); ctx.lineTo(-16,28); ctx.lineTo(-20,38); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,15); ctx.lineTo( 16,28); ctx.lineTo( 20,38); ctx.stroke();
    ctx.strokeStyle = C.shirt; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(0,-5); ctx.lineTo(0,15); ctx.stroke();
    ctx.strokeStyle = C.skin; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0,2); ctx.lineTo(-18,-4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,2); ctx.lineTo( 18,-4); ctx.stroke();
  } else if (pose === 'throw') {
    ctx.strokeStyle = C.pants;
    ctx.beginPath(); ctx.moveTo(-5,15); ctx.lineTo(-10,30); ctx.lineTo(-12,43); ctx.stroke();
    ctx.beginPath(); ctx.moveTo( 5,15); ctx.lineTo( 10,30); ctx.lineTo(  8,43); ctx.stroke();
    ctx.strokeStyle = C.shirt; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(0,-5); ctx.lineTo(0,15); ctx.stroke();
    ctx.strokeStyle = C.skin; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0,2); ctx.lineTo(-13,11); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,2); ctx.lineTo( 20,-9); ctx.stroke();
  }

  // Head
  ctx.fillStyle = C.skin;
  ctx.beginPath(); ctx.arc(0,-13,9,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = C.hair;
  ctx.beginPath(); ctx.arc(0,-18,9,Math.PI,0); ctx.fill();

  ctx.restore();
}

// ================================================================
// SPRINT MECHANIC (shared by sprint, hurdles, javelin approach)
// ================================================================
class SprintMechanic {
  constructor() {
    this.lastKey = null;
    this.ts = [];
    this.speed = 0;
    this.cadence = 0;
    this.sameKeyTimer = 0;
    this.steps = 0;
  }

  onKey(code) {
    const isL = code === 'KeyA' || code === 'ArrowLeft';
    const isR = code === 'KeyD' || code === 'ArrowRight';
    if (!isL && !isR) return;
    const side = isL ? 'L' : 'R';
    if (side === this.lastKey) { this.sameKeyTimer = 0.35; this.speed = Math.max(0, this.speed - 0.6); return; }
    this.lastKey = side;
    this.ts.push(performance.now());
    if (this.ts.length > 12) this.ts.shift();
    this.steps++;
  }

  update(dt) {
    if (this.sameKeyTimer > 0) this.sameKeyTimer -= dt;
    const now = performance.now();
    this.ts = this.ts.filter(t => now - t < 600);
    this.cadence = this.ts.length / 0.6;
    const target = clamp(this.cadence * 1.12, 0, 10);
    this.speed = lerp(this.speed, target, dt * 4.5);
    if (this.ts.length === 0) this.speed = lerp(this.speed, 0, dt * 2);
  }

  drawMeter(ctx, x, y, w) {
    txt(ctx, 'SPEED', x + w/2, y - 4, 10, C.dim);
    // Zone backgrounds
    const zones = [[0,0.3,'#220000'],[0.3,0.6,'#221100'],[0.6,0.85,'#002200'],[0.85,1,'#003300']];
    for (const [a,b,col] of zones) {
      ctx.fillStyle = col; ctx.fillRect(x + w*a, y, w*(b-a), 16);
    }
    const r = this.speed / 10;
    ctx.fillStyle = r > 0.7 ? C.powerHi : r > 0.4 ? C.powerMid : C.powerLo;
    ctx.fillRect(x, y, w * r, 16);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, 16);
    // Needle
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x+w*r,y); ctx.lineTo(x+w*r,y+16); ctx.stroke();
    txt(ctx,'0',    x,   y+26, 9, C.dim, 'left');
    txt(ctx,'10',   x+w, y+26, 9, C.dim, 'right');
    txt(ctx, this.speed.toFixed(1), x+w/2, y+26, 9, C.white);
    if (this.sameKeyTimer > 0) txt(ctx, 'SAME KEY!', x+w/2, y+40, 11, C.red, 'center', true);
  }
}

// ================================================================
// THROW MECHANIC  (shot put / discus / hammer)
// ================================================================
class ThrowMechanic {
  constructor(cfg) {
    this.cfg = cfg;
    this.phase = 'windup';
    this.power = 0;
    this.lastKey = null;
    this.ts = [];
    this.rhythmQ = 0;
    this.windupT = 0;
    this.aimT = 0;
    this.angle = 0;
    this.angleDir = 1;
    this.angleSpeed = 55;
    this.lockedAngle = 40;
    this.releaseT = 0;
    this.releasePulse = 0;
    this.releaseScore = 0;
    this.feedback = '';
    this.feedTimer = 0;
    this.result = null;
    this.spinAngle = 0;
  }

  onKey(code) {
    if (this.phase === 'windup') {
      const isL = code === 'KeyA' || code === 'ArrowLeft';
      const isR = code === 'KeyD' || code === 'ArrowRight';
      if (!isL && !isR) return;
      const side = isL ? 'L' : 'R';
      if (side === this.lastKey) { this.feedback='WRONG KEY!'; this.feedTimer=0.4; return; }
      this.lastKey = side;
      this.ts.push(performance.now());
      if (this.ts.length > 14) this.ts.shift();
    } else if (this.phase === 'aim') {
      if (code === 'Space') { this.lockedAngle = this.angle; this.phase = 'release'; this.releaseT = 0; }
    } else if (this.phase === 'release') {
      if (code === 'Space') {
        this.releaseScore = Math.abs(Math.sin(this.releasePulse * Math.PI));
        this.phase = 'done';
        this._calc();
      }
    }
  }

  _calc() {
    const pf = this.power / 100;
    const opt = this.cfg.optAngle || 42;
    const diff = Math.abs(this.lockedAngle - opt);
    const af = Math.max(0, 1 - diff / 50);
    const rf = 0.38 + this.releaseScore * 0.62;
    this.result = this.cfg.baseDistance * pf * af * rf;
  }

  update(dt) {
    if (this.feedTimer > 0) this.feedTimer -= dt;
    this.spinAngle += dt * (1 + this.power / 80 * 4);

    if (this.phase === 'windup') {
      this.windupT += dt;
      const now = performance.now();
      this.ts = this.ts.filter(t => now - t < 700);
      const cad = this.ts.length / 0.7;
      const opt = this.cfg.optCadence || 4.5;
      const diff = Math.abs(cad - opt);
      this.rhythmQ = clamp(1 - diff / (opt * 1.1), 0, 1);

      if (cad > 0) {
        if (cad > opt * 1.9) { this.rhythmQ = 0; this.feedback = 'TOO FAST!'; this.feedTimer = 0.25; }
        else if (cad < opt * 0.25) { this.feedback = 'TOO SLOW!'; this.feedTimer = 0.25; }
        else if (this.rhythmQ > 0.82) { this.feedback = 'PERFECT!'; this.feedTimer = 0.18; }
        else if (this.rhythmQ > 0.5) { this.feedback = 'GOOD'; this.feedTimer = 0.18; }
        this.power = clamp(this.power + this.rhythmQ * dt * 38, 0, 100);
      }
      if (this.windupT >= this.cfg.windupDuration) { this.phase = 'aim'; this.aimT = 0; this.angle = 0; }

    } else if (this.phase === 'aim') {
      this.aimT += dt;
      this.angleSpeed = 58 + this.aimT * 22;
      this.angle += this.angleDir * this.angleSpeed * dt;
      if (this.angle >= 84) { this.angle = 84; this.angleDir = -1; }
      if (this.angle <= 1)  { this.angle = 1;  this.angleDir =  1; }
      if (this.aimT >= (this.cfg.aimDuration || 1.8)) { this.lockedAngle = this.angle; this.phase = 'release'; }

    } else if (this.phase === 'release') {
      this.releaseT += dt;
      this.releasePulse = (this.releaseT / 1.15) % 1.0;
      if (this.releaseT >= 2.3) { this.releaseScore = 0.18; this.phase = 'done'; this._calc(); }
    }
  }

  draw(ctx, cx, cy) {
    if (this.phase === 'windup') {
      panel(ctx, cx-140, cy-80, 280, 145, 'BUILD POWER');
      const opt = this.cfg.optCadence || 4.5;
      const now = performance.now();
      const cad = this.ts.filter(t=>now-t<700).length / 0.7;
      const cr = clamp(cad / (opt * 2.2), 0, 1);
      // Rhythm bar
      txt(ctx, 'RHYTHM', cx, cy-56, 10, C.dim);
      ctx.fillStyle='#111'; ctx.fillRect(cx-100,cy-46,200,12);
      ctx.fillStyle='rgba(0,230,118,0.2)'; ctx.fillRect(cx-100+200*0.38,cy-46,200*0.24,12);
      ctx.strokeStyle=C.powerHi; ctx.lineWidth=1;
      ctx.strokeRect(cx-100+200*0.38,cy-46,200*0.24,12);
      const ni = cx-100 + 200*cr;
      ctx.fillStyle = this.rhythmQ>0.7?C.powerHi : this.rhythmQ>0.4?C.powerMid : C.powerLo;
      ctx.fillRect(ni-3,cy-50,6,20);
      txt(ctx,'SLOW',cx-95,cy-31,9,C.dim,'left');
      txt(ctx,'FAST',cx+95,cy-31,9,C.dim,'right');
      txt(ctx,'POWER',cx,cy-14,10,C.dim);
      bar(ctx, cx-100, cy-4, 200, 14, this.power, 100);
      txt(ctx, Math.round(this.power)+'%', cx, cy+20, 12, C.white, 'center', true);
      const rem = Math.max(0, this.cfg.windupDuration - this.windupT);
      txt(ctx, rem.toFixed(1)+'s', cx+95,cy-60,11,C.cyan,'right');
      if (this.feedTimer > 0) {
        const fc = this.feedback==='PERFECT!'?C.powerHi:this.feedback==='GOOD'?C.powerMid:C.powerLo;
        txt(ctx, this.feedback, cx, cy+42, 16, fc, 'center', true);
      }
      txt(ctx, 'A / D  ALTERNATE — FIND RHYTHM', cx, cy+62, 10, C.dim);

    } else if (this.phase === 'aim') {
      panel(ctx, cx-145, cy-95, 290, 170, 'AIM');
      const opt = this.cfg.optAngle || 42;
      const gr = 82, gx = cx, gy = cy+38;
      ctx.strokeStyle='#2a2a2a'; ctx.lineWidth=22;
      ctx.beginPath(); ctx.arc(gx,gy,gr,-Math.PI,0); ctx.stroke();
      ctx.strokeStyle='rgba(0,230,118,0.35)'; ctx.lineWidth=22;
      ctx.beginPath(); ctx.arc(gx,gy,gr,-Math.PI+(opt-10)*Math.PI/90,-Math.PI+(opt+10)*Math.PI/90); ctx.stroke();
      const na = -Math.PI + this.angle*Math.PI/90;
      ctx.strokeStyle=C.white; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(gx,gy); ctx.lineTo(gx+Math.cos(na)*gr,gy+Math.sin(na)*gr); ctx.stroke();
      txt(ctx, Math.round(this.angle)+'°', cx, cy-55, 26, C.white, 'center', true);
      txt(ctx, 'OPTIMAL: '+opt+'°', cx, cy-32, 10, C.powerHi);
      txt(ctx, 'PRESS  SPACE  TO  LOCK  ANGLE', cx, cy+68, 10, C.dim);

    } else if (this.phase === 'release') {
      panel(ctx, cx-145, cy-95, 290, 170, 'RELEASE');
      const pulse = Math.sin(this.releasePulse * Math.PI);
      const pr = 50 + pulse * 26;
      const al = 0.28 + pulse * 0.72;
      ctx.strokeStyle=`rgba(0,230,118,${al})`; ctx.lineWidth=9;
      ctx.beginPath(); ctx.arc(cx,cy+12,pr,0,Math.PI*2); ctx.stroke();
      ctx.strokeStyle=`rgba(255,215,0,${al*0.55})`; ctx.lineWidth=4;
      ctx.beginPath(); ctx.arc(cx,cy+12,pr*0.6,0,Math.PI*2); ctx.stroke();
      bar(ctx, cx-85, cy-48, 170, 13, pulse*100, 100);
      txt(ctx,'POWER',cx,cy-55,10,C.dim);
      txt(ctx,'LOCKED: '+Math.round(this.lockedAngle)+'°',cx,cy-28,10,C.cyan);
      txt(ctx,'PRESS  SPACE  AT  PEAK',cx,cy+68,10,C.dim);
    }
  }
}

// ================================================================
// BASE EVENT
// ================================================================
class BaseEvent {
  constructor(game, id) {
    this.game = game; this.id = id;
    this.ctx = game.ctx; this.input = game.input;
    this.done = false; this.result = null; this.time = 0;
  }
  update(dt) { this.time += dt; }
  render() {}
  onKey(_code) {}
  hints(ctx, list) {
    const w = list.length * 95 + 10;
    panel(ctx, 10, H-34, w, 26);
    let hx = 18;
    ctx.textAlign = 'left';
    for (const h of list) {
      ctx.font = 'bold 10px "Courier New"';
      ctx.fillStyle = C.gold; ctx.fillText('['+h.key+']', hx, H-17);
      ctx.fillStyle = '#777'; ctx.fillText(' '+h.desc, hx, H-17);
      hx += 95;
    }
  }
}

// ================================================================
// SPRINT EVENT  (100m, 200m, 400m)
// ================================================================
class SprintEvent extends BaseEvent {
  constructor(game, id, dist) {
    super(game, id);
    this.dist = dist;
    this.sm = new SprintMechanic();
    this.elapsed = 0;
    this.progress = 0;
    this.phase = 'countdown';
    this.countdown = 3;
    this.cdTimer = 0;
  }
  onKey(code) { if (this.phase==='running') this.sm.onKey(code); }
  update(dt) {
    super.update(dt);
    if (this.phase === 'countdown') {
      this.cdTimer += dt;
      if (this.cdTimer >= 1) { this.cdTimer = 0; this.countdown--; if (this.countdown <= 0) this.phase='running'; }
    } else if (this.phase === 'running') {
      this.elapsed += dt;
      this.sm.update(dt);
      this.progress += (this.sm.speed * 1.08 * dt) / this.dist;
      if (this.progress >= 1) {
        this.progress = 1; this.phase='finished'; this.done = true;
        this.result = { value: this.elapsed, unit:'s', id:this.id };
      }
    }
  }
  render() {
    const ctx = this.ctx;
    sky(ctx); ground(ctx); track(ctx);
    // Finish line
    const fx = W * 0.85 + (1-this.progress) * W * 2.5;
    if (fx < W + 20) {
      for (let fy = H*0.6; fy < H; fy += 8) {
        for (let fc = -1; fc < 2; fc++) {
          const row = Math.floor((fy-H*0.6)/8), col = fc+1;
          ctx.fillStyle = (row+col)%2===0 ? C.white : C.track;
          ctx.fillRect(fx+fc*8, fy, 8, 8);
        }
      }
    }
    athlete(ctx, W*0.28, H*0.72, 1.2, this.sm.steps, 1, 'run');
    panel(ctx, 10, 10, 168, 68);
    txt(ctx, this.dist+'m SPRINT', 94, 28, 12, C.gold, 'center', true);
    txt(ctx, this.elapsed.toFixed(2)+'s', 94, 46, 15, C.white, 'center', true);
    txt(ctx, Math.round(this.progress*this.dist)+'m', 94, 62, 10, C.dim);
    panel(ctx, W-192, 10, 182, 62);
    this.sm.drawMeter(ctx, W-182, 28, 162);
    if (this.phase==='countdown') {
      ctx.fillStyle='rgba(0,0,0,0.62)'; ctx.fillRect(0,0,W,H);
      txt(ctx, this.countdown>0?String(this.countdown):'GO!', W/2, H/2+18, 76,
        this.countdown>0?C.white:C.powerHi, 'center', true);
      txt(ctx,'Alternate  A / D  as fast as possible',W/2,H/2+68,13,C.dim);
    }
    this.hints(ctx,[{key:'A',desc:'Left'},{key:'D',desc:'Right'}]);
  }
}

// ================================================================
// HURDLES EVENT  (110m, 400m)
// ================================================================
class HurdlesEvent extends BaseEvent {
  constructor(game, id, dist) {
    super(game, id);
    this.dist = dist;
    this.sm = new SprintMechanic();
    this.elapsed = 0; this.progress = 0;
    this.phase = 'countdown'; this.countdown = 3; this.cdTimer = 0;
    this.jumping = false; this.jumpProg = 0; this.jumpY = 0;
    this.hitFlash = 0;
    this.hurdles = [];
    const n = 10, sp = (dist===110 ? 0.07 : 0.065);
    for (let i=0;i<n;i++) this.hurdles.push({ pos: 0.04+sp*(i+1), cleared:false, hit:false });
  }
  onKey(code) {
    if (this.phase !== 'running') return;
    this.sm.onKey(code);
    if ((code==='Space'||code==='ArrowUp') && !this.jumping) { this.jumping=true; this.jumpProg=0; }
  }
  update(dt) {
    super.update(dt);
    if (this.phase==='countdown') {
      this.cdTimer+=dt;
      if (this.cdTimer>=1) { this.cdTimer=0; this.countdown--; if (this.countdown<=0) this.phase='running'; }
    } else if (this.phase==='running') {
      this.elapsed+=dt; this.sm.update(dt);
      this.progress += (this.sm.speed*1.0*dt)/this.dist;
      if (this.jumping) {
        this.jumpProg += dt*2.3;
        this.jumpY = Math.sin(this.jumpProg*Math.PI)*52;
        if (this.jumpProg>=1) { this.jumping=false; this.jumpY=0; this.jumpProg=0; }
      }
      if (this.hitFlash>0) this.hitFlash-=dt;
      for (const h of this.hurdles) {
        if (h.cleared||h.hit) continue;
        const d=Math.abs(this.progress-h.pos);
        if (d<0.014) {
          if (this.jumping&&this.jumpProg>0.18&&this.jumpProg<0.82) { h.cleared=true; }
          else if (!this.jumping&&d<0.007) { h.hit=true; this.sm.speed=Math.max(0,this.sm.speed-2.8); this.hitFlash=0.35; }
        }
      }
      if (this.progress>=1) {
        this.progress=1; this.phase='finished'; this.done=true;
        this.result={value:this.elapsed,unit:'s',id:this.id};
      }
    }
  }
  render() {
    const ctx=this.ctx;
    sky(ctx); ground(ctx); track(ctx);
    const gy=H*0.72;
    for (const h of this.hurdles) {
      const hx=(h.pos-this.progress)*this.dist*38+W*0.28;
      if (hx<-30||hx>W+30) continue;
      const hh=28;
      ctx.strokeStyle=h.hit?C.red:h.cleared?C.powerHi:C.hurdle;
      ctx.lineWidth=h.hit?2.5:4;
      ctx.beginPath(); ctx.moveTo(hx-14,gy-hh); ctx.lineTo(hx+14,gy-hh); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(hx-14,gy-hh); ctx.lineTo(hx-14,gy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(hx+14,gy-hh); ctx.lineTo(hx+14,gy); ctx.stroke();
    }
    athlete(ctx, W*0.28, gy-(this.jumping?this.jumpY:0), 1.2, this.sm.steps, 1, this.jumping?'jump':'run');
    if (this.hitFlash>0) { ctx.fillStyle=`rgba(230,57,70,${this.hitFlash})`; ctx.fillRect(0,0,W,H); }
    panel(ctx,10,10,168,68);
    txt(ctx,this.dist+'m HURDLES',94,28,11,C.gold,'center',true);
    txt(ctx,this.elapsed.toFixed(2)+'s',94,46,15,C.white,'center',true);
    const cl=this.hurdles.filter(h=>h.cleared).length;
    txt(ctx,cl+'/'+this.hurdles.length+' cleared',94,62,10,C.dim);
    panel(ctx,W-192,10,182,62); this.sm.drawMeter(ctx,W-182,28,162);
    if (this.phase==='countdown') {
      ctx.fillStyle='rgba(0,0,0,0.62)'; ctx.fillRect(0,0,W,H);
      txt(ctx,this.countdown>0?String(this.countdown):'GO!',W/2,H/2+18,76,this.countdown>0?C.white:C.powerHi,'center',true);
      txt(ctx,'A/D to run  |  SPACE to jump over hurdles',W/2,H/2+68,13,C.dim);
    }
    this.hints(ctx,[{key:'A/D',desc:'Run'},{key:'SPC',desc:'Jump'}]);
  }
}

// ================================================================
// LONG JUMP
// ================================================================
class LongJumpEvent extends BaseEvent {
  constructor(game, id) {
    super(game, id);
    this.sm = new SprintMechanic();
    this.phase = 'approach';
    this.progress = 0;
    this.takeoffAcc = 0;
    this.flightT = 0;
    this.flightX = 0; this.flightY = 0;
    this.jumpSpd = 0;
    this.distance = 0;
    this.trajectory = [];
    this.boardWin = false; this.boardFlash = 0;
  }
  onKey(code) {
    if (this.phase==='approach') {
      this.sm.onKey(code);
      if (code==='Space') {
        const prox=Math.abs(this.progress-0.88);
        this.takeoffAcc=Math.max(0,1-prox*11);
        this.jumpSpd=this.sm.speed;
        this.phase='flight'; this.flightT=0;
        this.flightX=W*0.74; this.flightY=H*0.72; this.trajectory=[];
      }
    }
  }
  update(dt) {
    super.update(dt);
    if (this.phase==='approach') {
      this.sm.update(dt);
      this.progress = Math.min(this.progress + this.sm.speed*dt/38, 0.97);
      this.boardWin = this.progress>0.83 && this.progress<0.93;
      if (this.boardWin) this.boardFlash=(this.boardFlash+dt*7)%1;
    } else if (this.phase==='flight') {
      this.flightT+=dt;
      const vx=this.jumpSpd*2.4*this.takeoffAcc;
      const vy0=this.jumpSpd*1.75*this.takeoffAcc;
      const g=14;
      this.flightX=W*0.74+vx*this.flightT*11;
      this.flightY=H*0.72-vy0*this.flightT*11+0.5*g*this.flightT*this.flightT*11;
      this.trajectory.push({x:this.flightX,y:this.flightY});
      if (this.flightY>=H*0.72) {
        this.flightY=H*0.72;
        this.distance=clamp(vx*this.flightT*0.88,0,9);
        this.phase='landed'; this.done=true;
        this.result={value:this.distance,unit:'m',id:this.id};
      }
    }
  }
  render() {
    const ctx=this.ctx;
    sky(ctx);
    if (this.phase==='approach') {
      ground(ctx); track(ctx);
      ctx.fillStyle=C.sandPit; ctx.fillRect(W*0.68,H*0.6,W*0.36,H*0.38);
      txt(ctx,'SAND PIT',W*0.82,H*0.67,10,'#8B6914');
      const bx=(0.88-this.progress)*38*W*0.03+W*0.74;
      ctx.fillStyle=this.boardWin&&Math.sin(this.boardFlash*Math.PI*2)>0?C.powerHi:C.white;
      ctx.fillRect(bx,H*0.6,5,H*0.38);
      if (this.boardWin) txt(ctx,'JUMP NOW!',bx,H*0.56,13,C.powerHi,'center',true);
      athlete(ctx,W*0.28,H*0.72,1.2,this.sm.steps,1,'run');
      panel(ctx,10,10,168,50); txt(ctx,'LONG JUMP',94,26,12,C.gold,'center',true); txt(ctx,'Sprint to the board!',94,42,10,C.dim);
      panel(ctx,W-192,10,182,62); this.sm.drawMeter(ctx,W-182,28,162);
      this.hints(ctx,[{key:'A/D',desc:'Sprint'},{key:'SPC',desc:'Jump at board'}]);
    } else {
      ctx.fillStyle='#2d6b1a'; ctx.fillRect(0,H*0.5,W,H*0.5);
      ctx.fillStyle=C.track; ctx.fillRect(0,H*0.6,W*0.66,H*0.4);
      ctx.fillStyle=C.sandPit; ctx.fillRect(W*0.63,H*0.6,W*0.42,H*0.4);
      ctx.fillStyle='#fff'; ctx.fillRect(W*0.72,H*0.6,4,H*0.4);
      for (let m=1;m<=10;m++) {
        const mx=W*0.72+m*24;
        ctx.strokeStyle='rgba(100,50,0,0.45)'; ctx.lineWidth=1; ctx.setLineDash([2,4]);
        ctx.beginPath(); ctx.moveTo(mx,H*0.6); ctx.lineTo(mx,H); ctx.stroke();
        ctx.setLineDash([]);
        txt(ctx,m+'m',mx,H*0.58,9,'#8B6914');
      }
      if (this.trajectory.length>1) {
        ctx.strokeStyle='rgba(255,215,0,0.6)'; ctx.lineWidth=2; ctx.setLineDash([4,4]);
        ctx.beginPath(); ctx.moveTo(this.trajectory[0].x,this.trajectory[0].y);
        for (const p of this.trajectory) ctx.lineTo(p.x,p.y);
        ctx.stroke(); ctx.setLineDash([]);
      }
      if (this.phase==='flight') {
        athlete(ctx,this.flightX,this.flightY,1.2,0,1,'jump');
      } else {
        const lx=W*0.72+this.distance*24;
        ctx.fillStyle=C.red; ctx.fillRect(lx-2,H*0.6,4,H*0.4);
        athlete(ctx,lx,H*0.72,1.2,0,1,'jump');
        txt(ctx,this.distance.toFixed(2)+'m',W/2,H*0.52,32,C.gold,'center',true);
      }
      panel(ctx,10,10,168,50); txt(ctx,'LONG JUMP',94,26,12,C.gold,'center',true);
      if (this.done) txt(ctx,this.distance.toFixed(2)+'m',94,44,14,C.white,'center',true);
    }
  }
}

// ================================================================
// TRIPLE JUMP
// ================================================================
class TripleJumpEvent extends BaseEvent {
  constructor(game, id) {
    super(game, id);
    this.sm = new SprintMechanic();
    this.phase = 'approach';
    this.progress = 0;
    this.jumpCount = 0;
    this.jumpLands = [];
    this.allTraj = [];
    this.curTraj = [];
    this.flightT = 0;
    this.flightX = W*0.3; this.flightY = H*0.72;
    this.curSpd = 0;
    this.totalDist = 0;
  }
  onKey(code) {
    if (code==='Space') {
      if (this.phase==='approach' && this.progress>=0.83) this._startFlight();
      else if (this.phase==='flight' && this.jumpCount<3 && this.flightY>=H*0.70) this._land();
    }
    if (this.phase==='approach') this.sm.onKey(code);
  }
  _startFlight() {
    this.phase='flight'; this.jumpCount=1;
    this.flightX=W*0.3; this.flightY=H*0.72;
    this.flightT=0; this.curSpd=this.sm.speed;
    this.curTraj=[]; this.allTraj=[];
  }
  _land() {
    this.jumpLands.push(this.flightX);
    this.jumpCount++;
    if (this.jumpCount>3) {
      this.allTraj.push(...this.curTraj);
      this.totalDist=(this.flightX-W*0.3)/25;
      this.phase='landed'; this.done=true;
      this.result={value:this.totalDist,unit:'m',id:this.id};
    } else {
      this.allTraj.push(...this.curTraj);
      this.curTraj=[]; this.flightT=0;
    }
  }
  update(dt) {
    super.update(dt);
    if (this.phase==='approach') {
      this.sm.update(dt);
      this.progress=Math.min(this.progress+this.sm.speed*dt/42,0.97);
    } else if (this.phase==='flight') {
      this.flightT+=dt;
      const vx=this.curSpd*2.1, vy0=this.curSpd*1.55, g=17;
      this.flightX+=vx*dt*9;
      this.flightY=H*0.72-(vy0*this.flightT*9-0.5*g*this.flightT*this.flightT*9);
      this.curTraj.push({x:this.flightX,y:this.flightY});
      if (this.flightY>=H*0.72 && this.flightT>0.1) {
        this.flightY=H*0.72;
        if (this.jumpCount>=3) {
          this.allTraj.push(...this.curTraj);
          this.totalDist=(this.flightX-W*0.3)/25;
          this.phase='landed'; this.done=true;
          this.result={value:this.totalDist,unit:'m',id:this.id};
        }
      }
    }
  }
  render() {
    const ctx=this.ctx;
    sky(ctx);
    ctx.fillStyle='#2d6b1a'; ctx.fillRect(0,H*0.5,W,H*0.5);
    ctx.fillStyle=C.track; ctx.fillRect(0,H*0.6,W*0.58,H*0.4);
    ctx.fillStyle=C.sandPit; ctx.fillRect(W*0.53,H*0.6,W*0.5,H*0.4);
    const labels=['HOP','STEP','JUMP'];
    const lcolors=[C.powerHi,C.powerMid,C.red];
    for (let i=0;i<3;i++) {
      txt(ctx,labels[i],W*0.3+i*82,H*0.55,11,i<this.jumpCount?lcolors[i]:C.dim,'center',i<this.jumpCount);
    }
    if (this.allTraj.length>1) {
      ctx.strokeStyle='rgba(255,215,0,0.38)'; ctx.lineWidth=1; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(this.allTraj[0].x,this.allTraj[0].y);
      for (const p of this.allTraj) ctx.lineTo(p.x,p.y); ctx.stroke(); ctx.setLineDash([]);
    }
    if (this.curTraj.length>1) {
      ctx.strokeStyle=C.gold; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(this.curTraj[0].x,this.curTraj[0].y);
      for (const p of this.curTraj) ctx.lineTo(p.x,p.y); ctx.stroke();
    }
    for (const lx of this.jumpLands) {
      ctx.strokeStyle=C.red; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(lx,H*0.6); ctx.lineTo(lx,H*0.88); ctx.stroke();
    }
    athlete(ctx,this.flightX,this.flightY,1.2,
      this.phase==='approach'?this.sm.steps:5,1,
      this.phase!=='approach'?'jump':'run');
    if (this.phase==='landed') txt(ctx,this.totalDist.toFixed(2)+'m',W/2,H*0.48,30,C.gold,'center',true);
    panel(ctx,10,10,180,50); txt(ctx,'TRIPLE JUMP',100,26,12,C.gold,'center',true);
    const pl=this.phase==='approach'?'Approach':labels[Math.min(this.jumpCount,2)]||'Landed';
    txt(ctx,pl,100,42,11,C.white);
    if (this.phase==='approach') {
      panel(ctx,W-192,10,182,62); this.sm.drawMeter(ctx,W-182,28,162);
      this.hints(ctx,[{key:'A/D',desc:'Sprint'},{key:'SPC',desc:'Hop at board'}]);
    } else {
      this.hints(ctx,[{key:'SPC',desc:'Land & next jump'}]);
    }
  }
}

// ================================================================
// HIGH JUMP
// ================================================================
class HighJumpEvent extends BaseEvent {
  constructor(game, id) {
    super(game, id);
    this.barH = 1.40;
    this.incr = 0.05;
    this.phase = 'approach';
    this.phaseT = 0;
    this.athleteX = -60; this.athleteY = H*0.72;
    this.timingBar = 0; this.timingDir = 1; this.timingSpd = 1.15;
    this.timingLocked = false;
    this.jumpT = 0; this.jumpProg = 0; this.jumpTiming = 0;
    this.barCleared = false;
    this.failures = 0;
    this.bestH = 0;
  }
  get screenBarY() { return H*0.72 - this.barH*60; }
  onKey(code) {
    if (this.phase==='approach' && code==='Space' && !this.timingLocked) {
      this.timingLocked=true;
      this.jumpTiming=this.timingBar;
      this.phase='jump'; this.phaseT=0; this.jumpProg=0;
    }
  }
  update(dt) {
    super.update(dt);
    if (this.phase==='approach') {
      this.phaseT+=dt;
      if (this.athleteX<W*0.44) this.athleteX+=dt*85;
      this.timingBar+=this.timingDir*this.timingSpd*dt;
      if (this.timingBar>=1){this.timingBar=1;this.timingDir=-1;}
      if (this.timingBar<=0){this.timingBar=0;this.timingDir=1;}
    } else if (this.phase==='jump') {
      this.phaseT+=dt; this.jumpProg+=dt*1.15;
      const clH=this.barH+(this.jumpTiming-0.3)*1.5;
      this.athleteY=H*0.72-Math.sin(this.jumpProg*Math.PI)*clH*60;
      if (this.jumpProg>=1) {
        this.barCleared=clH>=this.barH;
        if (this.barCleared) { this.failures=0; this.bestH=Math.max(this.bestH,this.barH); }
        else this.failures++;
        this.phase='result'; this.phaseT=0;
      }
    } else if (this.phase==='result') {
      this.phaseT+=dt;
      if (this.phaseT>=1.6) {
        if (!this.barCleared&&this.failures>=3) {
          this.done=true; this.result={value:this.bestH,unit:'m',id:this.id};
        } else {
          if (this.barCleared) { this.barH=parseFloat((this.barH+this.incr).toFixed(2)); }
          this.phase='approach'; this.phaseT=0;
          this.athleteX=-60; this.athleteY=H*0.72;
          this.timingLocked=false; this.timingBar=0;
        }
      }
    }
  }
  render() {
    const ctx=this.ctx;
    sky(ctx);
    ctx.fillStyle=C.ground; ctx.fillRect(0,H*0.55,W,H*0.45);
    ctx.fillStyle=C.mat; ctx.fillRect(W*0.42,H*0.58,165,82);
    txt(ctx,'MAT',W*0.42+82,H*0.645,10,'#fff');
    const by=this.screenBarY;
    ctx.fillStyle='#888';
    ctx.fillRect(W*0.40,by-5,7,H*0.72-by+5);
    ctx.fillRect(W*0.60,by-5,7,H*0.72-by+5);
    const bc=this.phase==='result'?(this.barCleared?C.powerHi:C.red):C.silver;
    ctx.strokeStyle=bc; ctx.lineWidth=6;
    ctx.beginPath(); ctx.moveTo(W*0.40+7,by); ctx.lineTo(W*0.60,by); ctx.stroke();
    txt(ctx,this.barH.toFixed(2)+'m',W*0.505,by-12,12,bc,'center',true);
    athlete(ctx,this.athleteX,this.athleteY,1.2,0,1,'jump');
    panel(ctx,10,10,185,68); txt(ctx,'HIGH JUMP',102,26,12,C.gold,'center',true);
    txt(ctx,'Height: '+this.barH.toFixed(2)+'m',102,42,11,C.white);
    txt(ctx,'Fails: '+this.failures+'/3',102,56,10,this.failures>=2?C.red:C.dim);
    if (this.phase==='approach') {
      panel(ctx,W/2-125,H-68,250,52,'JUMP TIMING');
      ctx.fillStyle='#111'; ctx.fillRect(W/2-105,H-38,210,13);
      ctx.fillStyle='rgba(0,230,118,0.28)'; ctx.fillRect(W/2-105+210*0.58,H-38,210*0.22,13);
      ctx.strokeStyle=C.powerHi; ctx.lineWidth=1;
      ctx.strokeRect(W/2-105+210*0.58,H-38,210*0.22,13);
      const tx=W/2-105+this.timingBar*210-4;
      ctx.fillStyle=C.white; ctx.fillRect(tx,H-42,8,22);
      this.hints(ctx,[{key:'SPC',desc:'Jump at green zone'}]);
    }
    if (this.phase==='result') {
      txt(ctx,this.barCleared?'CLEARED! ▲':'FAILED ✗',W/2,H/2,30,this.barCleared?C.powerHi:C.red,'center',true);
    }
  }
}

// ================================================================
// THROWING EVENT  (shot put, discus, hammer)
// ================================================================
class ThrowingEvent extends BaseEvent {
  constructor(game, id, cfg) {
    super(game, id);
    this.cfg = cfg;
    this.mech = new ThrowMechanic(cfg);
    this.phase = 'throwing';
    this.traj = [];
    this.trajProg = 0;
    this.spinA = 0;
  }
  onKey(code) {
    if (this.phase==='throwing') {
      this.mech.onKey(code);
      if (this.mech.phase==='done') { this.phase='traj'; this._buildTraj(this.mech.result); this.trajProg=0; }
    }
  }
  _buildTraj(dist) {
    const a=this.mech.lockedAngle*Math.PI/180;
    const v0=Math.sqrt(Math.max(0,dist*9.81/Math.sin(2*a))||10);
    const vx=v0*Math.cos(a), vy=v0*Math.sin(a);
    this.traj=[];
    for (let t=0;t<10;t+=0.05) {
      const x=vx*t, y=vy*t-0.5*9.81*t*t;
      if (y<0&&t>0) break; this.traj.push({x,y});
    }
  }
  update(dt) {
    super.update(dt);
    if (this.phase==='throwing') {
      this.mech.update(dt); this.spinA+=dt*3;
      if (this.mech.phase==='done') { this.phase='traj'; this._buildTraj(this.mech.result); this.trajProg=0; }
    } else if (this.phase==='traj') {
      this.trajProg+=dt*0.75;
      if (this.trajProg>=1) {
        this.trajProg=1; this.done=true;
        this.result={value:this.mech.result,unit:'m',id:this.id};
      }
    }
  }
  render() {
    const ctx=this.ctx;
    sky(ctx);
    if (this.phase==='throwing') {
      ctx.fillStyle=C.ground; ctx.fillRect(0,H*0.5,W,H*0.5);
      const cx=W*0.5,cy=H*0.72;
      ctx.strokeStyle=C.circle; ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(cx,cy,42,0,Math.PI*2); ctx.stroke();
      const la=this.spinA;
      ctx.strokeStyle=C.circleLine; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(la)*42,cy+Math.sin(la)*42); ctx.stroke();
      athlete(ctx,cx,cy,1.2,this.spinA*3,1,'throw');
      this.mech.draw(ctx,W*0.5,H*0.29);
      panel(ctx,10,10,182,50); txt(ctx,this.cfg.name,100,28,12,C.gold,'center',true);
      txt(ctx,'WR: '+WR[this.id]+'m',100,44,10,C.dim);
      const phases=['BUILD','AIM','RELEASE'];
      const pi=this.mech.phase==='windup'?0:this.mech.phase==='aim'?1:2;
      panel(ctx,W-202,10,192,30);
      for (let i=0;i<3;i++) {
        ctx.fillStyle=i<pi?C.uiBrd:i===pi?C.gold:C.dim;
        ctx.font='bold 10px "Courier New"'; ctx.textAlign='left';
        ctx.fillText(phases[i],W-198+i*64,28);
      }
      const kh=this.mech.phase==='windup'?[{key:'A/D',desc:'Alternate'}]:[{key:'SPC',desc:this.mech.phase==='aim'?'Lock angle':'Release!'}];
      this.hints(ctx,kh);
    } else {
      // Bird's-eye field view
      ctx.fillStyle='#1a3a0d'; ctx.fillRect(0,0,W,H);
      const ox=80,oy=H*0.86,sc=5.5,sa=0.305;
      ctx.strokeStyle='rgba(255,255,255,0.18)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+Math.cos(-sa)*580,oy+Math.sin(-sa)*580); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+Math.cos(sa)*580,oy+Math.sin(sa)*580); ctx.stroke();
      for (let m=10;m<=90;m+=10) {
        ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.arc(ox,oy,m*sc,-sa-0.1,sa+0.1); ctx.stroke();
        txt(ctx,m+'m',ox+m*sc+4,oy+9,9,'rgba(255,255,255,0.38)','left');
      }
      const dist=this.mech.result||0;
      if (this.traj.length>1) {
        const n=Math.floor(this.trajProg*this.traj.length);
        ctx.strokeStyle=C.gold; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(ox,oy);
        for (let i=0;i<n;i++) ctx.lineTo(ox+this.traj[i].x*sc,oy-this.traj[i].y*3.8);
        ctx.stroke();
        if (n>0&&n<this.traj.length) {
          const p=this.traj[n-1];
          ctx.fillStyle=C.gold;
          ctx.beginPath(); ctx.arc(ox+p.x*sc,oy-p.y*3.8,5,0,Math.PI*2); ctx.fill();
        }
      }
      athlete(ctx,ox,oy-12,1.0,0,1,'throw');
      if (this.done) {
        const lx=ox+dist*sc;
        ctx.fillStyle=C.red; ctx.beginPath(); ctx.arc(lx,oy,6,0,Math.PI*2); ctx.fill();
        txt(ctx,dist.toFixed(2)+'m',W/2,55,38,C.gold,'center',true);
        txt(ctx,this.cfg.name.toUpperCase(),W/2,85,13,C.dim);
      }
      panel(ctx,10,10,182,50); txt(ctx,this.cfg.name,100,28,12,C.gold,'center',true);
      txt(ctx,'WR: '+WR[this.id]+'m',100,44,10,C.dim);
    }
  }
}

// ================================================================
// JAVELIN  (sprint run-up variant)
// ================================================================
class JavelinEvent extends BaseEvent {
  constructor(game, id) {
    super(game, id);
    this.sm = new SprintMechanic();
    this.phase = 'approach';
    this.progress = 0;
    this.runSpd = 0;
    this.angle = 40; this.angleDir = 1; this.angleSpd = 52;
    this.aimT = 0;
    this.lockedAngle = 35;
    this.relPulse = 0; this.relT = 0; this.relScore = 0;
    this.traj = []; this.trajProg = 0;
    this.distance = 0;
  }
  onKey(code) {
    if (this.phase==='approach') {
      this.sm.onKey(code);
      if (code==='Space'&&this.progress>=0.78) {
        this.runSpd=this.sm.speed; this.phase='aim';
        this.aimT=0; this.angle=40; this.angleDir=1;
      }
    } else if (this.phase==='aim') {
      if (code==='Space') { this.lockedAngle=this.angle; this.phase='release'; this.relT=0; }
    } else if (this.phase==='release') {
      if (code==='Space') {
        this.relScore=Math.abs(Math.sin(this.relPulse*Math.PI));
        this.phase='traj'; this._build(); this.trajProg=0;
      }
    }
  }
  _build() {
    const sf=this.runSpd/10;
    const rf=0.38+this.relScore*0.62;
    const diff=Math.abs(this.lockedAngle-35);
    const af=Math.max(0,1-diff/55);
    this.distance=98.48*sf*af*rf*0.84;
    const a=this.lockedAngle*Math.PI/180;
    const v0=Math.sqrt(Math.max(0.1,this.distance*9.81/Math.sin(2*a)));
    const vx=v0*Math.cos(a),vy=v0*Math.sin(a);
    this.traj=[];
    for (let t=0;t<12;t+=0.05) {
      const x=vx*t,y=vy*t-0.5*9.81*t*t;
      if (y<0&&t>0) break; this.traj.push({x,y});
    }
  }
  update(dt) {
    super.update(dt);
    if (this.phase==='approach') {
      this.sm.update(dt);
      this.progress=Math.min(this.progress+this.sm.speed*dt/28,0.97);
    } else if (this.phase==='aim') {
      this.aimT+=dt; this.angleSpd=52+this.aimT*24;
      this.angle+=this.angleDir*this.angleSpd*dt;
      if (this.angle>=78){this.angle=78;this.angleDir=-1;}
      if (this.angle<=3){this.angle=3;this.angleDir=1;}
      if (this.aimT>=2.8) { this.lockedAngle=this.angle; this.phase='release'; }
    } else if (this.phase==='release') {
      this.relT+=dt; this.relPulse=(this.relT/1.15)%1.0;
      if (this.relT>=2.3) { this.relScore=0.18; this.phase='traj'; this._build(); this.trajProg=0; }
    } else if (this.phase==='traj') {
      this.trajProg+=dt*0.55;
      if (this.trajProg>=1) { this.trajProg=1; this.done=true; this.result={value:this.distance,unit:'m',id:this.id}; }
    }
  }
  render() {
    const ctx=this.ctx;
    sky(ctx);
    if (this.phase==='approach') {
      ground(ctx); track(ctx);
      ctx.strokeStyle='rgba(255,255,255,0.18)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(W,H*0.64); ctx.lineTo(W*0.83,H*0.52); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W,H*0.64); ctx.lineTo(W*0.83,H*0.74); ctx.stroke();
      const bx=W*0.08+this.progress*W*0.72;
      const ready=this.progress>=0.78;
      ctx.fillStyle=ready?C.powerHi:C.white;
      ctx.fillRect(W*0.82,H*0.6,5,H*0.4);
      if (ready) txt(ctx,'THROW!',W*0.82,H*0.56,13,C.powerHi,'center',true);
      athlete(ctx,bx,H*0.72,1.2,this.sm.steps,1,'run');
      panel(ctx,10,10,155,50); txt(ctx,'JAVELIN',87,28,14,C.gold,'center',true); txt(ctx,'Sprint to the board!',87,44,10,C.dim);
      panel(ctx,W-192,10,182,62); this.sm.drawMeter(ctx,W-182,28,162);
      this.hints(ctx,[{key:'A/D',desc:'Sprint'},{key:'SPC',desc:'Throw at board'}]);
    } else if (this.phase==='aim'||this.phase==='release') {
      ctx.fillStyle=C.ground; ctx.fillRect(0,H*0.5,W,H*0.5);
      athlete(ctx,W*0.32,H*0.72,1.2,0,1,'throw');
      if (this.phase==='aim') {
        panel(ctx,W/2-145,H/2-95,290,168,'AIM JAVELIN');
        const gr=82,gx=W/2,gy=H/2+35;
        ctx.strokeStyle='#252525'; ctx.lineWidth=22;
        ctx.beginPath(); ctx.arc(gx,gy,gr,-Math.PI,0); ctx.stroke();
        ctx.strokeStyle='rgba(0,230,118,0.35)'; ctx.lineWidth=22;
        ctx.beginPath(); ctx.arc(gx,gy,gr,-Math.PI+22*Math.PI/90,-Math.PI+48*Math.PI/90); ctx.stroke();
        const na=-Math.PI+this.angle*Math.PI/90;
        ctx.strokeStyle=C.white; ctx.lineWidth=3;
        ctx.beginPath(); ctx.moveTo(gx,gy); ctx.lineTo(gx+Math.cos(na)*gr,gy+Math.sin(na)*gr); ctx.stroke();
        txt(ctx,Math.round(this.angle)+'°',W/2,H/2-55,26,C.white,'center',true);
        txt(ctx,'OPTIMAL: 30–40°',W/2,H/2-32,10,C.powerHi);
        this.hints(ctx,[{key:'SPC',desc:'Lock angle'}]);
      } else {
        panel(ctx,W/2-145,H/2-95,290,168,'RELEASE');
        const pulse=Math.sin(this.relPulse*Math.PI);
        const pr=50+pulse*26,al=0.28+pulse*0.72;
        ctx.strokeStyle=`rgba(0,230,118,${al})`; ctx.lineWidth=9;
        ctx.beginPath(); ctx.arc(W/2,H/2+12,pr,0,Math.PI*2); ctx.stroke();
        bar(ctx,W/2-85,H/2-50,170,13,pulse*100,100);
        txt(ctx,'POWER',W/2,H/2-58,10,C.dim);
        txt(ctx,'Locked: '+Math.round(this.lockedAngle)+'°',W/2,H/2-28,10,C.cyan);
        this.hints(ctx,[{key:'SPC',desc:'Release at peak!'}]);
      }
    } else {
      // Trajectory
      ctx.fillStyle='#1a3a0d'; ctx.fillRect(0,0,W,H);
      const ox=80,oy=H*0.86,sc=4.5,sa=0.28;
      ctx.strokeStyle='rgba(255,255,255,0.18)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+Math.cos(-sa)*540,oy+Math.sin(-sa)*540); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+Math.cos(sa)*540,oy+Math.sin(sa)*540); ctx.stroke();
      for (let m=20;m<=100;m+=20) {
        ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.arc(ox,oy,m*sc,-sa-0.1,sa+0.1); ctx.stroke();
        txt(ctx,m+'m',ox+m*sc+4,oy+9,9,'rgba(255,255,255,0.38)','left');
      }
      if (this.traj.length>1) {
        const n=Math.floor(this.trajProg*this.traj.length);
        ctx.strokeStyle=C.gold; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(ox,oy);
        for (let i=0;i<n;i++) ctx.lineTo(ox+this.traj[i].x*sc,oy-this.traj[i].y*3.5);
        ctx.stroke();
        if (n>0&&n<this.traj.length) {
          const p=this.traj[n-1];
          const ja=this.lockedAngle*Math.PI/180;
          ctx.strokeStyle=C.silver; ctx.lineWidth=3;
          ctx.beginPath();
          ctx.moveTo(ox+p.x*sc-Math.cos(ja)*14,oy-p.y*3.5+Math.sin(ja)*14);
          ctx.lineTo(ox+p.x*sc+Math.cos(ja)*14,oy-p.y*3.5-Math.sin(ja)*14);
          ctx.stroke();
        }
      }
      athlete(ctx,ox,oy-12,1.0,0,1,'throw');
      if (this.done) {
        const lx=ox+this.distance*sc;
        ctx.fillStyle=C.red; ctx.beginPath(); ctx.arc(lx,oy,5,0,Math.PI*2); ctx.fill();
        txt(ctx,this.distance.toFixed(2)+'m',W/2,55,38,C.gold,'center',true);
        txt(ctx,'JAVELIN THROW',W/2,85,13,C.dim);
      }
      panel(ctx,10,10,155,50); txt(ctx,'JAVELIN',87,28,14,C.gold,'center',true);
      txt(ctx,'WR: '+WR['jt']+'m',87,44,10,C.dim);
    }
  }
}

// ================================================================
// GAME  (state machine, menu, results)
// ================================================================
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new Input();
    this.state = 'menu';
    this.currentEvent = null;
    this.currentId = null;
    this.records = this._loadRec();
    this.menuCursor = 0;
    this.resultT = 0;
    this.lastTS = 0;
  }

  _loadRec() {
    try { return JSON.parse(localStorage.getItem('ss2_rec')) || {}; } catch { return {}; }
  }
  _saveRec(id, val) {
    const lb=LOWER_IS_BETTER[id], ex=this.records[id];
    const better=ex===undefined||(lb?val<ex:val>ex);
    if (better) { this.records[id]=val; try{localStorage.setItem('ss2_rec',JSON.stringify(this.records));}catch{} return true; }
    return false;
  }

  _startEvent(id) {
    this.currentId = id;
    switch(id) {
      case 's100': this.currentEvent=new SprintEvent(this,id,100); break;
      case 's200': this.currentEvent=new SprintEvent(this,id,200); break;
      case 's400': this.currentEvent=new SprintEvent(this,id,400); break;
      case 'h110': this.currentEvent=new HurdlesEvent(this,id,110); break;
      case 'h400': this.currentEvent=new HurdlesEvent(this,id,400); break;
      case 'lj':   this.currentEvent=new LongJumpEvent(this,id); break;
      case 'tj':   this.currentEvent=new TripleJumpEvent(this,id); break;
      case 'hj':   this.currentEvent=new HighJumpEvent(this,id); break;
      case 'sp':   this.currentEvent=new ThrowingEvent(this,id,{name:'Shot Put', baseDistance:23.37, optAngle:42, optCadence:4.0, windupDuration:2.5}); break;
      case 'dt':   this.currentEvent=new ThrowingEvent(this,id,{name:'Discus',   baseDistance:74.08, optAngle:40, optCadence:5.0, windupDuration:3.0, aimDuration:1.6}); break;
      case 'jt':   this.currentEvent=new JavelinEvent(this,id); break;
      case 'ht':   this.currentEvent=new ThrowingEvent(this,id,{name:'Hammer',   baseDistance:86.74, optAngle:44, optCadence:4.5, windupDuration:3.5, aimDuration:1.7}); break;
    }
    this.state = 'game';
  }

  start() {
    window.requestAnimationFrame(ts => { this.lastTS=ts; this._loop(ts); });
  }

  _loop(ts) {
    const dt = Math.min((ts - this.lastTS) / 1000, 0.05);
    this.lastTS = ts;
    this._update(dt);
    this._render();
    this.input.tick();
    window.requestAnimationFrame(this._loop.bind(this));
  }

  _update(dt) {
    if (this.state==='menu') {
      if (this.input.wasPressed('ArrowDown')||this.input.wasPressed('KeyS')) this.menuCursor=(this.menuCursor+1)%CATALOG.length;
      if (this.input.wasPressed('ArrowUp')||this.input.wasPressed('KeyW')) this.menuCursor=(this.menuCursor-1+CATALOG.length)%CATALOG.length;
      if (this.input.wasPressed('Enter')||this.input.wasPressed('Space')) this._startEvent(CATALOG[this.menuCursor].id);
    } else if (this.state==='game') {
      if (this.currentEvent) {
        this.currentEvent.update(dt);
        if (this.currentEvent.done) {
          this.state='result'; this.resultT=0;
          if (this.currentEvent.result) this._saveRec(this.currentId,this.currentEvent.result.value);
        }
      }
      if (this.input.wasPressed('Escape')) { this.state='menu'; this.currentEvent=null; }
    } else if (this.state==='result') {
      this.resultT+=dt;
      if (this.currentEvent) this.currentEvent.update(dt);
      if (this.input.wasPressed('Enter')||this.input.wasPressed('Space')) this.state='menu';
      if (this.input.wasPressed('KeyR')) this._startEvent(this.currentId);
      if (this.input.wasPressed('Escape')) this.state='menu';
    }
  }

  _render() {
    const ctx=this.ctx;
    if (this.state==='menu') { this._renderMenu(ctx); return; }
    if (this.currentEvent) this.currentEvent.render();
    if (this.state==='result') this._renderResult(ctx);
  }

  _renderMenu(ctx) {
    const g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#0d1117'); g.addColorStop(1,'#0a1420');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);

    // Title
    txt(ctx,'SPEED',W/2-85,54,46,C.gold,'center',true);
    txt(ctx,'STARS',W/2+90,54,46,C.white,'center',true);
    txt(ctx,'2.0',W/2+178,54,26,C.red,'center',true);
    txt(ctx,'— COMPLETE ATHLETICS —',W/2,72,11,C.dim);

    const cats=['Track','Jump','Throw'];
    const catCol={Track:C.cyan,Jump:C.powerHi,Throw:C.red};
    const colEvents={Track:[],Jump:[],Throw:[]};
    for (const ev of CATALOG) colEvents[ev.cat].push(ev);

    for (let col=0;col<3;col++) {
      const cat=cats[col];
      const evs=colEvents[cat];
      const cx=col*(W/3)+(W/6);
      txt(ctx,'── '+cat+' ──',cx,98,11,catCol[cat],'center',true);
      for (let j=0;j<evs.length;j++) {
        const ev=evs[j];
        const gi=CATALOG.indexOf(ev);
        const ey=118+j*30;
        const sel=gi===this.menuCursor;
        if (sel) {
          ctx.fillStyle='rgba(0,230,118,0.12)';
          ctx.fillRect(col*(W/3)+8,ey-18,W/3-16,26);
          ctx.strokeStyle=C.uiBrd; ctx.lineWidth=1;
          ctx.strokeRect(col*(W/3)+8,ey-18,W/3-16,26);
        }
        txt(ctx,(sel?'▶ ':' ')+ev.name,cx,ey,12,sel?C.white:'#888','center',sel);
        const pb=this.records[ev.id];
        if (pb!==undefined) {
          const u=WR_UNIT[ev.id];
          const lb=LOWER_IS_BETTER[ev.id];
          const ratio=lb?WR[ev.id]/pb:pb/WR[ev.id];
          const pc=ratio>=0.95?C.gold:ratio>=0.85?C.silver:ratio>=0.7?C.bronze:C.dim;
          txt(ctx,pb.toFixed(2)+u,cx+W/6-10,ey,9,pc,'right');
        }
      }
    }

    const sel=CATALOG[this.menuCursor];
    panel(ctx,W/2-210,H-58,420,48);
    txt(ctx,sel.name,W/2,H-40,13,C.gold,'center',true);
    txt(ctx,sel.desc+'  |  '+sel.ctrl,W/2,H-24,10,C.dim);
    txt(ctx,'ENTER/SPACE to play  ·  ↑↓ navigate  ·  ESC from event',W/2,H-8,9,C.uiBrdDim);
  }

  _renderResult(ctx) {
    const alpha=Math.min(1,this.resultT*2.2);
    ctx.fillStyle=`rgba(5,10,20,${alpha*0.88})`; ctx.fillRect(0,0,W,H);
    if (alpha<0.4) return;
    const ev=CATALOG.find(e=>e.id===this.currentId);
    const res=this.currentEvent?.result;
    if (!res) return;
    const lb=LOWER_IS_BETTER[this.currentId];
    const wr=WR[this.currentId];
    const pb=this.records[this.currentId];
    const ratio=lb?wr/res.value:res.value/wr;

    panel(ctx,W/2-210,H/2-130,420,250);
    txt(ctx,ev.name,W/2,H/2-108,16,C.gold,'center',true);
    txt(ctx,res.value.toFixed(2)+res.unit,W/2,H/2-58,48,C.white,'center',true);

    const label=ratio>=0.97?'★ WORLD RECORD CLASS':ratio>=0.91?'WORLD CLASS':ratio>=0.80?'NATIONAL CLASS':ratio>=0.65?'CLUB LEVEL':'KEEP TRAINING';
    const lc=ratio>=0.97?C.gold:ratio>=0.91?C.silver:ratio>=0.80?C.bronze:C.dim;
    txt(ctx,label,W/2,H/2-18,13,lc,'center',true);

    txt(ctx,'WR: '+wr+res.unit,W/2,H/2+2,10,C.dim);
    bar(ctx,W/2-135,H/2+12,270,13,ratio*100,100);

    const isPB=pb===res.value;
    if (isPB) txt(ctx,'★  PERSONAL BEST  ★',W/2,H/2+44,14,C.gold,'center',true);
    else if (pb!==undefined) txt(ctx,'PB: '+pb.toFixed(2)+res.unit,W/2,H/2+44,11,C.dim);

    txt(ctx,'ENTER — Menu   R — Retry   ESC — Menu',W/2,H/2+82,11,C.dim);
  }
}

// ================================================================
// KEY ROUTING  (separate from Game to avoid Input double-consume)
// ================================================================
window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  canvas.width = W; canvas.height = H;
  const game = new Game(canvas);

  document.addEventListener('keydown', e => {
    if (game.state === 'game' && game.currentEvent) {
      game.currentEvent.onKey(e.code);
    }
  });

  game.start();
});
