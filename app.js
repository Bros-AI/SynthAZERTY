"use strict";

/* =========================================================================
   1. MOTEUR AUDIO  (Web Audio API, synthé polyphonique)
   ========================================================================= */
const Audio = {
  ctx: null, master: null, filter: null, analyser: null, lfo: null, vibrato: null,
  voices: new Map(),
  VIB_DEPTH: 22, // profondeur du vibrato en cents
  settings: { waveform: "sawtooth", volume: 0.7, attack: 0.01, release: 0.3,
              detune: 13, cutoff: 3500, resonance: 3 },

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Chaîne : voix -> master -> filtre passe-bas -> analyser -> sortie
    this.master = this.ctx.createGain();
    this.master.gain.value = this.settings.volume;
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = this.settings.cutoff;
    this.filter.Q.value = this.settings.resonance;
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.75;
    this.master.connect(this.filter);
    this.filter.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
    // Oscillateur basse fréquence pour le vibrato (Shift)
    this.lfo = this.ctx.createOscillator();
    this.lfo.type = "sine";
    this.lfo.frequency.value = 5.6;
    this.vibrato = this.ctx.createGain();
    this.vibrato.gain.value = 0;
    this.lfo.connect(this.vibrato);
    this.lfo.start();
  },
  resume() { this.init(); if (this.ctx.state === "suspended") this.ctx.resume(); },
  midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); },

  // Voix « nouvel instrument » : 2 oscillateurs désaccordés + enveloppe
  noteOn(id, midi) {
    this.resume();
    if (this.voices.has(id)) this.noteOff(id, true);
    const now = this.ctx.currentTime;
    const freq = this.midiToFreq(midi);
    const o1 = this.ctx.createOscillator();
    const o2 = this.ctx.createOscillator();
    o1.type = o2.type = this.settings.waveform;
    o1.frequency.value = freq;
    o2.frequency.value = freq;
    o2.detune.value = this.settings.detune;          // désaccord = épaisseur
    o1.detune.value = -this.settings.detune * 0.5;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.26, now + Math.max(0.001, this.settings.attack));
    o1.connect(gain); o2.connect(gain); gain.connect(this.master);
    // Le vibrato (Shift) module la hauteur des deux oscillateurs
    this.vibrato.connect(o1.detune); this.vibrato.connect(o2.detune);
    o1.start(now); o2.start(now);
    this.voices.set(id, { o1, o2, gain });
  },
  noteOff(id, immediate) {
    const v = this.voices.get(id);
    if (!v) return;
    const now = this.ctx.currentTime;
    const rel = immediate ? 0.02 : this.settings.release;
    v.gain.gain.cancelScheduledValues(now);
    v.gain.gain.setValueAtTime(Math.max(0.0001, v.gain.gain.value), now);
    v.gain.gain.exponentialRampToValueAtTime(0.0001, now + rel);
    v.o1.stop(now + rel + 0.03); v.o2.stop(now + rel + 0.03);
    this.voices.delete(id);
  },
  playScheduled(midi, when, duration) {
    this.resume();
    const freq = this.midiToFreq(midi);
    const o1 = this.ctx.createOscillator();
    const o2 = this.ctx.createOscillator();
    o1.type = o2.type = this.settings.waveform;
    o1.frequency.value = freq; o2.frequency.value = freq;
    o2.detune.value = this.settings.detune;
    const gain = this.ctx.createGain();
    const a = Math.max(0.005, this.settings.attack);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(0.24, when + a);
    gain.gain.setValueAtTime(0.24, when + Math.max(a, duration - 0.05));
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    o1.connect(gain); o2.connect(gain); gain.connect(this.master);
    o1.start(when); o2.start(when);
    o1.stop(when + duration + 0.05); o2.stop(when + duration + 0.05);
  },
  setVolume(v) { this.settings.volume = v; if (this.master) this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.01); },
  setCutoff(hz) { this.settings.cutoff = hz; if (this.filter) this.filter.frequency.setTargetAtTime(hz, this.ctx.currentTime, 0.02); },
  setResonance(q) { this.settings.resonance = q; if (this.filter) this.filter.Q.setTargetAtTime(q, this.ctx.currentTime, 0.02); },
  setDetune(cents) { this.settings.detune = cents; },
  setVibrato(on) {
    this.resume();
    this.vibrato.gain.setTargetAtTime(on ? this.VIB_DEPTH : 0, this.ctx.currentTime, 0.04);
  },
};

/* =========================================================================
   2. CLAVIER À L'ÉCRAN
   ========================================================================= */
const Piano = {
  el: null, keyEls: new Map(), centers: new Map(),

  build() {
    this.el = document.getElementById("piano");
    this.el.innerHTML = "";
    const whites = KEYS.filter((k) => k.type === "white");
    whites.forEach((k) => this.el.appendChild(this.makeKey(k)));
    const blacks = KEYS.filter((k) => k.type === "black");
    const whiteCount = whites.length;
    blacks.forEach((k) => {
      const el = this.makeKey(k);
      const prevWhiteIndex = whites.filter((w) => w.midi < k.midi).length - 1;
      const leftPct = ((prevWhiteIndex + 1) / whiteCount) * 100;
      el.style.left = `calc(${leftPct}% - 2.6%)`;
      this.el.appendChild(el);
    });
    this.computeCenters();
    window.addEventListener("resize", () => this.computeCenters());
  },
  makeKey(k) {
    const el = document.createElement("div");
    el.className = `key ${k.type}`;
    el.dataset.key = k.key;
    el.innerHTML = `<span class="note-name">${k.name}</span><span class="key-cap">${k.key}</span>`;
    el.addEventListener("pointerdown", (e) => { e.preventDefault(); Input.press(k.key); });
    el.addEventListener("pointerup", () => Input.release(k.key));
    el.addEventListener("pointerleave", () => Input.release(k.key));
    this.keyEls.set(k.key, el);
    return el;
  },
  computeCenters() {
    const base = this.el.getBoundingClientRect();
    if (!base.width) return;
    for (const k of KEYS) {
      const r = this.keyEls.get(k.key).getBoundingClientRect();
      this.centers.set(k.key, (r.left + r.width / 2 - base.left) / base.width);
    }
  },
  highlight(key, on) { const el = this.keyEls.get(key); if (el) el.classList.toggle("active", on); },
};

/* =========================================================================
   3. EXPRESSION (Espace = sustain, Maj = vibrato)
   ========================================================================= */
const Expr = {
  sustain: false, vibrato: false, sustained: new Set(),

  setSustain(on) {
    if (on === this.sustain) return;
    this.sustain = on;
    UI.setPill("sustain", on);
    if (!on) {
      // On relâche la pédale : on coupe les notes maintenues qui ne sont plus enfoncées
      for (const l of this.sustained) if (!Input.down.has(l)) Audio.noteOff(l);
      this.sustained.clear();
    }
  },
  setVibrato(on) {
    if (on === this.vibrato) return;
    this.vibrato = on;
    Audio.setVibrato(on);
    UI.setPill("vibrato", on);
  },
  hold(letter) { this.sustained.add(letter); }, // note gardée par la pédale
};

/* =========================================================================
   4. ENTRÉES (clavier physique + souris)
   ========================================================================= */
const Input = {
  down: new Set(),
  press(letter) {
    const k = KEY_BY_LETTER[letter];
    if (!k || this.down.has(letter)) return;
    Expr.sustained.delete(letter); // re-déclenchement d'une note tenue par la pédale
    this.down.add(letter);
    Audio.noteOn(letter, k.midi + Game.octaveOffset());
    Piano.highlight(letter, true);
    Game.onPlayerHit(letter);
    Recorder.noteStart(k.midi);
  },
  release(letter) {
    if (!KEY_BY_LETTER[letter] || !this.down.has(letter)) return;
    this.down.delete(letter);
    Piano.highlight(letter, false);
    Recorder.noteEnd(KEY_BY_LETTER[letter].midi);
    if (Expr.sustain) Expr.hold(letter); // la pédale garde la note
    else Audio.noteOff(letter);
  },
  attach() {
    window.addEventListener("keydown", (e) => {
      // On ignore seulement la saisie dans un champ texte (nom de chanson)
      if (e.target.tagName === "INPUT" && e.target.type === "text") return;
      if (e.code === "Space") { e.preventDefault(); if (!e.repeat) Expr.setSustain(true); return; }
      if (e.key === "Shift") { if (!e.repeat) Expr.setVibrato(true); return; }
      if (e.repeat) return;
      const l = e.key.toLowerCase();
      if (KEY_BY_LETTER[l]) { e.preventDefault(); this.press(l); }
    });
    window.addEventListener("keyup", (e) => {
      if (e.code === "Space") { Expr.setSustain(false); return; }
      if (e.key === "Shift") { Expr.setVibrato(false); return; }
      const l = e.key.toLowerCase();
      if (KEY_BY_LETTER[l]) this.release(l);
    });
    window.addEventListener("blur", () => {
      for (const l of [...this.down]) this.release(l);
      Expr.setSustain(false); Expr.setVibrato(false);
    });
  },
};

/* =========================================================================
   4. OSCILLOSCOPE
   ========================================================================= */
const Scope = {
  canvas: null, ctx: null, mode: "wave", timeData: null, freqData: null, w: 0, h: 0,
  init() {
    this.canvas = document.getElementById("scope");
    this.ctx = this.canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());
    requestAnimationFrame(() => this.draw());
  },
  resize() {
    const dpr = window.devicePixelRatio || 1;
    const r = this.canvas.getBoundingClientRect();
    if (!r.width) return;
    this.canvas.width = r.width * dpr; this.canvas.height = r.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = r.width; this.h = r.height;
  },
  draw() {
    requestAnimationFrame(() => this.draw());
    if (!this.w || !Audio.analyser) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    this.grid();
    this.mode === "spectrum" ? this.drawSpectrum(Audio.analyser) : this.drawWave(Audio.analyser);
  },
  grid() {
    const ctx = this.ctx;
    ctx.strokeStyle = "rgba(41,52,79,0.6)"; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 1; i < 4; i++) { const y = (this.h / 4) * i; ctx.moveTo(0, y); ctx.lineTo(this.w, y); }
    for (let i = 1; i < 8; i++) { const x = (this.w / 8) * i; ctx.moveTo(x, 0); ctx.lineTo(x, this.h); }
    ctx.stroke();
  },
  drawWave(a) {
    if (!this.timeData || this.timeData.length !== a.fftSize) this.timeData = new Float32Array(a.fftSize);
    a.getFloatTimeDomainData(this.timeData);
    const ctx = this.ctx;
    ctx.lineWidth = 2.4; ctx.strokeStyle = "#34e0c4"; ctx.shadowColor = "#34e0c4"; ctx.shadowBlur = 8;
    ctx.beginPath();
    const slice = this.w / this.timeData.length;
    for (let i = 0; i < this.timeData.length; i++) {
      const y = this.h / 2 + this.timeData[i] * this.h * 0.45;
      i === 0 ? ctx.moveTo(0, y) : ctx.lineTo(i * slice, y);
    }
    ctx.stroke(); ctx.shadowBlur = 0;
  },
  drawSpectrum(a) {
    if (!this.freqData || this.freqData.length !== a.frequencyBinCount) this.freqData = new Uint8Array(a.frequencyBinCount);
    a.getByteFrequencyData(this.freqData);
    const ctx = this.ctx, bars = 64, step = Math.floor(this.freqData.length / bars), bw = this.w / bars;
    for (let i = 0; i < bars; i++) {
      const v = this.freqData[i * step] / 255, bh = v * this.h, hue = 170 - v * 90;
      ctx.fillStyle = `hsl(${hue}, 80%, ${40 + v * 25}%)`;
      ctx.fillRect(i * bw + 1, this.h - bh, bw - 2, bh);
    }
  },
};

/* =========================================================================
   5. BIBLIOTHÈQUE (chansons intégrées + perso en localStorage)
   ========================================================================= */
const Library = {
  key: "synthazerty.custom.v1",
  custom: [],
  load() { try { this.custom = JSON.parse(localStorage.getItem(this.key)) || []; } catch { this.custom = []; } },
  save() { localStorage.setItem(this.key, JSON.stringify(this.custom)); },
  add(song) { this.custom.unshift(song); this.save(); },
  remove(id) { this.custom = this.custom.filter((s) => s.id !== id); this.save(); },
  get(id) { return SONGS[id] || this.custom.find((s) => s.id === id); },

  // Normalise n'importe quelle chanson en {notes:[{midi,time,dur}], duration} (secondes)
  normalize(song) {
    if (!song) return { notes: [], duration: 0 };
    if (song.notesSec) {
      const notes = song.notesSec.filter((n) => KEY_BY_MIDI[n.midi]).map((n) => ({ ...n }));
      const duration = notes.reduce((m, n) => Math.max(m, n.time + n.dur), 0);
      return { notes, duration };
    }
    const spb = 60 / song.bpm;
    const notes = song.notes
      .filter((n) => KEY_BY_MIDI[n.midi])
      .map((n) => ({ midi: n.midi, time: n.beat * spb, dur: Math.max(0.25, n.dur * spb) }));
    return { notes, duration: song.beats * spb };
  },
};

/* =========================================================================
   6. ENREGISTREUR (compose ta musique)
   ========================================================================= */
const Recorder = {
  active: false, start: 0, open: new Map(), notes: [],
  begin() {
    Audio.resume();
    this.active = true; this.start = Audio.ctx.currentTime; this.open.clear(); this.notes = [];
  },
  end() { this.active = false; for (const m of [...this.open.keys()]) this.noteEnd(m); },
  noteStart(midi) { if (this.active) this.open.set(midi, Audio.ctx.currentTime - this.start); },
  noteEnd(midi) {
    if (!this.active && !this.open.has(midi)) return;
    if (!this.open.has(midi)) return;
    const t = this.open.get(midi); this.open.delete(midi);
    const dur = Math.max(0.18, (Audio.ctx.currentTime - this.start) - t);
    this.notes.push({ midi, time: t, dur });
  },
  hasNotes() { return this.notes.length > 0; },
  toSong(title) {
    const notes = [...this.notes].sort((a, b) => a.time - b.time);
    return { id: "c" + Date.now(), title: title || "?", notesSec: notes };
  },
  discard() { this.notes = []; this.open.clear(); },
};

/* =========================================================================
   7. MODE GUITAR HERO
   ========================================================================= */
const Game = {
  canvas: null, ctx: null, w: 0, h: 0,
  active: false, songId: null, notes: [], particles: [],
  startTime: 0, duration: 0,
  travel: 2.2, hitWindow: 0.16,
  score: 0, combo: 0, maxCombo: 0, hits: 0, total: 0, octave: 0,

  init() {
    this.canvas = document.getElementById("falls");
    this.ctx = this.canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());
    requestAnimationFrame(() => this.draw());
  },
  resize() {
    const dpr = window.devicePixelRatio || 1;
    const r = this.canvas.getBoundingClientRect();
    if (!r.width) return;
    this.canvas.width = r.width * dpr; this.canvas.height = r.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = r.width; this.h = r.height;
  },
  octaveOffset() { return this.octave * 12; },
  load(id) { this.songId = id; },

  start() {
    const song = Library.get(this.songId);
    if (!song) return;
    Audio.resume();
    const { notes, duration } = Library.normalize(song);
    this.notes = notes.map((n) => ({ ...n, key: KEY_BY_MIDI[n.midi].key, hit: false, missed: false }));
    this.total = this.notes.length;
    this.duration = duration;
    this.score = 0; this.combo = 0; this.maxCombo = 0; this.hits = 0;
    this.particles = [];
    this.active = true;
    this.startTime = Audio.ctx.currentTime + this.travel;
    UI.updateStats(); UI.setPlaying(true);
  },
  stop(finished) { this.active = false; UI.setPlaying(false); if (finished) UI.showResults(); },

  onPlayerHit(letter) {
    if (!this.active) return;
    const now = Audio.ctx.currentTime - this.startTime;
    let best = null, bestDelta = Infinity;
    for (const n of this.notes) {
      if (n.hit || n.missed || n.key !== letter) continue;
      const d = Math.abs(n.time - now);
      if (d < bestDelta) { bestDelta = d; best = n; }
    }
    if (best && bestDelta <= this.hitWindow) {
      best.hit = true; this.hits++; this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      let label, pts, color;
      if (bestDelta < 0.05) { label = I18N.t("judge.perfect"); pts = 100; color = "#34e0c4"; }
      else if (bestDelta < 0.1) { label = I18N.t("judge.great"); pts = 60; color = "#ffd166"; }
      else { label = I18N.t("judge.ok"); pts = 30; color = "#8c98b6"; }
      this.score += pts + this.combo * 2;
      this.spawnParticles(best.key, color);
      UI.flashJudgement(label, color);
      UI.updateStats();
    }
  },

  spawnParticles(key, color) {
    const cx = (Piano.centers.get(key) ?? 0.5) * this.w;
    const cy = this.h - 28;
    for (let i = 0; i < 14; i++) {
      const ang = (Math.PI * 2 * i) / 14 + Math.random();
      const sp = 1.5 + Math.random() * 3;
      this.particles.push({ x: cx, y: cy, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1, life: 1, color });
    }
  },

  draw() {
    requestAnimationFrame(() => this.draw());
    if (!this.w) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    const hitY = this.h - 28;
    this.drawLanes(hitY);

    if (this.active) {
      const now = Audio.ctx.currentTime - this.startTime;
      for (const n of this.notes) {
        if (!n.hit && !n.missed && now - n.time > this.hitWindow) {
          n.missed = true; this.combo = 0;
          UI.flashJudgement(I18N.t("judge.miss"), "#ff5d73"); UI.updateStats();
        }
      }
      for (const n of this.notes) {
        if (n.hit || n.missed) continue;
        const dt = n.time - now;
        if (dt > this.travel || dt < -this.hitWindow) continue;
        this.drawTile(n, (1 - dt / this.travel) * hitY);
      }
      if (now > this.duration + this.travel * 0.4) this.stop(true);
    } else {
      this.drawIdle();
    }
    this.drawParticles();
  },

  drawLanes(hitY) {
    const ctx = this.ctx;
    ctx.strokeStyle = "rgba(52,224,196,0.9)"; ctx.lineWidth = 3;
    ctx.shadowColor = "#34e0c4"; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.moveTo(0, hitY); ctx.lineTo(this.w, hitY); ctx.stroke(); ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(41,52,79,0.5)"; ctx.lineWidth = 1;
    const whites = KEYS.filter((k) => k.type === "white");
    ctx.beginPath();
    for (let i = 1; i < whites.length; i++) {
      const x = (i / whites.length) * this.w; ctx.moveTo(x, 0); ctx.lineTo(x, hitY);
    }
    ctx.stroke();
  },

  drawTile(n, y) {
    const ctx = this.ctx;
    const cx = (Piano.centers.get(n.key) ?? 0.5) * this.w;
    const k = KEY_BY_LETTER[n.key];
    const isBlack = k.type === "black";
    const w = isBlack ? 32 : 48, h = 34, x = cx - w / 2;
    const grad = ctx.createLinearGradient(0, y - h, 0, y + h);
    if (isBlack) { grad.addColorStop(0, "#9b80ff"); grad.addColorStop(1, "#7c5cff"); }
    else { grad.addColorStop(0, "#5cf0d8"); grad.addColorStop(1, "#34e0c4"); }
    ctx.fillStyle = grad;
    ctx.shadowColor = isBlack ? "rgba(124,92,255,0.6)" : "rgba(52,224,196,0.5)"; ctx.shadowBlur = 12;
    this.roundRect(x, y - h / 2, w, h, 8); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = "#07101a"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "bold 13px Poppins, sans-serif";
    ctx.fillText(k.name, cx, y - 4);
    ctx.font = "600 9px Poppins, sans-serif";
    ctx.fillText(n.key.toUpperCase(), cx, y + 9);
  },

  drawParticles() {
    const ctx = this.ctx;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 0.03;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3 * p.life + 1, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  },

  roundRect(x, y, w, h, r) {
    const ctx = this.ctx;
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  },

  drawIdle() {
    const ctx = this.ctx;
    ctx.fillStyle = "#8c98b6"; ctx.font = "15px Poppins, sans-serif"; ctx.textAlign = "center";
    const words = I18N.t("learn.idle").split(" ");
    let line = "", y = this.h / 2 - 10; const max = this.w - 60;
    for (const word of words) {
      if (ctx.measureText(line + word).width > max) { ctx.fillText(line, this.w / 2, y); line = ""; y += 22; }
      line += word + " ";
    }
    ctx.fillText(line, this.w / 2, y);
  },
};

/* =========================================================================
   8. INTERFACE / RÉGLAGES / ONGLETS / LANGUE
   ========================================================================= */
const UI = {
  els: {}, settingsKey: "synthazerty.settings.v1",

  init() {
    const $ = (id) => document.getElementById(id);
    this.els = {
      langSelect: $("langSelect"),
      preset: $("preset"),
      waveform: $("waveform"), scopeMode: $("scopeMode"),
      volume: $("volume"), volumeVal: $("volumeVal"),
      attack: $("attack"), attackVal: $("attackVal"),
      release: $("release"), releaseVal: $("releaseVal"),
      octave: $("octaveShift"), octaveVal: $("octaveVal"),
      brightness: $("brightness"), brightnessVal: $("brightnessVal"),
      resonance: $("resonance"), resonanceVal: $("resonanceVal"),
      richness: $("richness"), richnessVal: $("richnessVal"),
      pillSustain: $("pillSustain"), pillVibrato: $("pillVibrato"),
      songSelect: $("songSelect"),
      startBtn: $("startBtn"), demoBtn: $("demoBtn"), stopBtn: $("stopBtn"),
      speed: $("speed"),
      score: $("score"), combo: $("combo"), accuracy: $("accuracy"),
      judgement: $("judgement"),
      recBtn: $("recBtn"), recStatus: $("recStatus"), songName: $("songName"),
      saveBtn: $("saveBtn"), discardBtn: $("discardBtn"), customList: $("customList"),
      overlay: $("overlay"), overlayBody: $("overlayBody"),
      overlayTitle: $("overlayTitle"), overlayClose: $("overlayClose"),
      toast: $("toast"),
      tabs: document.querySelectorAll(".tab"),
      panels: { play: $("panel-play"), learn: $("panel-learn"), create: $("panel-create") },
    };

    this.buildLangSelect();
    this.buildPresets();
    this.bindSettings();
    this.bindGame();
    this.bindRecorder();
    this.bindTabs();
    this.restoreSettings();
    this.refreshSongSelect();
    this.refreshCustomList();

    // Après avoir choisi un réglage, on rend le focus au clavier pour pouvoir rejouer
    document.querySelectorAll('.controls select, .controls input[type="range"]')
      .forEach((el) => el.addEventListener("change", () => el.blur()));
  },

  /* ---- Presets ---- */
  buildPresets() {
    const sel = this.els.preset;
    sel.innerHTML = "";
    const custom = document.createElement("option");
    custom.value = ""; custom.textContent = I18N.t("set.custom");
    sel.appendChild(custom);
    PRESETS.forEach((p, i) => {
      const o = document.createElement("option");
      o.value = String(i); o.textContent = p.name;
      sel.appendChild(o);
    });
    sel.addEventListener("change", (e) => {
      const p = PRESETS[parseInt(e.target.value, 10)];
      if (p) this.applyPreset(p);
    });
  },
  applyPreset(p) {
    this.els.waveform.value = p.wave; Audio.settings.waveform = p.wave;
    this.els.attack.value = p.attack; Audio.settings.attack = p.attack / 1000;
    this.els.attackVal.textContent = p.attack + " ms";
    this.els.release.value = p.release; Audio.settings.release = p.release / 1000;
    this.els.releaseVal.textContent = p.release + " ms";
    this.els.brightness.value = p.bright; this.applyBrightness(p.bright, false);
    this.els.resonance.value = p.res; this.applyResonance(p.res, false);
    this.els.richness.value = p.rich; this.applyRichness(p.rich, false);
    this.saveSettings();
  },
  markCustom() { this.els.preset.value = ""; },

  /* ---- Langue ---- */
  buildLangSelect() {
    for (const code of Object.keys(TRANSLATIONS)) {
      const o = document.createElement("option");
      o.value = code; o.textContent = TRANSLATIONS[code]["lang.name"];
      this.els.langSelect.appendChild(o);
    }
    this.els.langSelect.value = I18N.lang;
    this.els.langSelect.addEventListener("change", (e) => I18N.set(e.target.value));
  },
  onLangChange() {
    this.refreshOptions();
    if (this.els.preset.options[0]) this.els.preset.options[0].textContent = I18N.t("set.custom");
    this.refreshSongSelect();
    this.refreshCustomList();
  },

  refreshOptions() {
    const waves = [["sine", "wave.sine"], ["triangle", "wave.triangle"], ["sawtooth", "wave.sawtooth"], ["square", "wave.square"]];
    this.fillSelect(this.els.waveform, waves, Audio.settings.waveform);
    const scopes = [["wave", "scope.wave"], ["spectrum", "scope.spectrum"]];
    this.fillSelect(this.els.scopeMode, scopes, Scope.mode);
  },
  fillSelect(sel, pairs, current) {
    sel.innerHTML = "";
    for (const [val, key] of pairs) {
      const o = document.createElement("option");
      o.value = val; o.textContent = I18N.t(key);
      sel.appendChild(o);
    }
    sel.value = current;
  },

  /* ---- Réglages synthé ---- */
  bindSettings() {
    this.els.waveform.addEventListener("change", (e) => { Audio.settings.waveform = e.target.value; this.markCustom(); this.saveSettings(); });
    this.els.scopeMode.addEventListener("change", (e) => { Scope.mode = e.target.value; this.saveSettings(); });
    this.els.volume.addEventListener("input", (e) => {
      Audio.setVolume(e.target.value / 100); this.els.volumeVal.textContent = e.target.value + "%"; this.saveSettings();
    });
    this.els.attack.addEventListener("input", (e) => {
      Audio.settings.attack = e.target.value / 1000; this.els.attackVal.textContent = e.target.value + " ms"; this.markCustom(); this.saveSettings();
    });
    this.els.release.addEventListener("input", (e) => {
      Audio.settings.release = e.target.value / 1000; this.els.releaseVal.textContent = e.target.value + " ms"; this.markCustom(); this.saveSettings();
    });
    this.els.octave.addEventListener("input", (e) => {
      Game.octave = parseInt(e.target.value, 10);
      this.els.octaveVal.textContent = (Game.octave > 0 ? "+" : "") + Game.octave; this.saveSettings();
    });
    this.els.speed.addEventListener("input", (e) => { Game.travel = 3.4 - (e.target.value / 100) * 1.4; this.saveSettings(); });
    this.els.brightness.addEventListener("input", (e) => { this.applyBrightness(e.target.value, true); this.markCustom(); });
    this.els.resonance.addEventListener("input", (e) => { this.applyResonance(e.target.value, true); this.markCustom(); });
    this.els.richness.addEventListener("input", (e) => { this.applyRichness(e.target.value, true); this.markCustom(); });
  },

  // Conversions curseur (0-100) -> paramètres audio
  applyBrightness(v, save) {
    const hz = 200 * Math.pow(60, v / 100); // 200 Hz -> 12 kHz (échelle log)
    Audio.setCutoff(hz); this.els.brightnessVal.textContent = Math.round(v) + "%";
    if (save) this.saveSettings();
  },
  applyResonance(v, save) {
    Audio.setResonance(0.5 + (v / 100) * 18);
    this.els.resonanceVal.textContent = Math.round(v) + "%";
    if (save) this.saveSettings();
  },
  applyRichness(v, save) {
    Audio.setDetune((v / 100) * 30); // jusqu'à 30 cents de désaccord
    this.els.richnessVal.textContent = Math.round(v) + "%";
    if (save) this.saveSettings();
  },
  setPill(name, on) {
    const el = name === "sustain" ? this.els.pillSustain : this.els.pillVibrato;
    if (el) el.classList.toggle("active", on);
  },

  saveSettings() {
    const s = {
      waveform: Audio.settings.waveform, scope: Scope.mode,
      volume: this.els.volume.value, attack: this.els.attack.value,
      release: this.els.release.value, octave: this.els.octave.value, speed: this.els.speed.value,
      brightness: this.els.brightness.value, resonance: this.els.resonance.value, richness: this.els.richness.value,
      preset: this.els.preset.value,
    };
    localStorage.setItem(this.settingsKey, JSON.stringify(s));
  },
  restoreSettings() {
    let s = {};
    try { s = JSON.parse(localStorage.getItem(this.settingsKey)) || {}; } catch {}
    if (s.waveform) Audio.settings.waveform = s.waveform;
    if (s.scope) Scope.mode = s.scope;
    this.refreshOptions();
    if (s.volume != null) { this.els.volume.value = s.volume; Audio.settings.volume = s.volume / 100; this.els.volumeVal.textContent = s.volume + "%"; }
    if (s.attack != null) { this.els.attack.value = s.attack; Audio.settings.attack = s.attack / 1000; this.els.attackVal.textContent = s.attack + " ms"; }
    if (s.release != null) { this.els.release.value = s.release; Audio.settings.release = s.release / 1000; this.els.releaseVal.textContent = s.release + " ms"; }
    if (s.octave != null) { this.els.octave.value = s.octave; Game.octave = parseInt(s.octave, 10); this.els.octaveVal.textContent = (Game.octave > 0 ? "+" : "") + Game.octave; }
    if (s.speed != null) { this.els.speed.value = s.speed; Game.travel = 3.4 - (s.speed / 100) * 1.4; }
    if (s.brightness != null) this.els.brightness.value = s.brightness;
    if (s.resonance != null) this.els.resonance.value = s.resonance;
    if (s.richness != null) this.els.richness.value = s.richness;
    // Applique les valeurs (par défaut ou restaurées) au moteur audio
    this.applyBrightness(this.els.brightness.value, false);
    this.applyResonance(this.els.resonance.value, false);
    this.applyRichness(this.els.richness.value, false);
    // Restaure le preset sélectionné (les curseurs reflètent déjà ses valeurs)
    if (s.preset && PRESETS[parseInt(s.preset, 10)]) this.els.preset.value = s.preset;
  },

  /* ---- Jeu ---- */
  bindGame() {
    this.els.songSelect.addEventListener("change", (e) => Game.load(e.target.value));
    this.els.startBtn.addEventListener("click", () => { this.switchTab("learn"); Game.start(); });
    this.els.stopBtn.addEventListener("click", () => Game.stop(false));
    this.els.demoBtn.addEventListener("click", () => this.playDemo());
    this.els.overlayClose.addEventListener("click", () => this.els.overlay.classList.add("hidden"));
  },

  refreshSongSelect() {
    const sel = this.els.songSelect;
    const prev = sel.value;
    sel.innerHTML = "";
    const gBuilt = document.createElement("optgroup"); gBuilt.label = I18N.t("learn.builtin");
    for (const [id, s] of Object.entries(SONGS)) {
      const o = document.createElement("option"); o.value = id; o.textContent = s.title; gBuilt.appendChild(o);
    }
    sel.appendChild(gBuilt);
    if (Library.custom.length) {
      const gCustom = document.createElement("optgroup"); gCustom.label = I18N.t("learn.custom");
      for (const s of Library.custom) {
        const o = document.createElement("option"); o.value = s.id; o.textContent = s.title; gCustom.appendChild(o);
      }
      sel.appendChild(gCustom);
    }
    sel.value = Library.get(prev) ? prev : Object.keys(SONGS)[0];
    Game.load(sel.value);
  },

  updateStats() {
    this.els.score.textContent = Game.score;
    this.els.combo.textContent = Game.combo;
    const played = Game.notes.filter((n) => n.hit || n.missed).length;
    this.els.accuracy.textContent = played ? Math.round((Game.hits / played) * 100) + "%" : "—";
  },
  setPlaying(on) {
    this.els.startBtn.disabled = on; this.els.demoBtn.disabled = on;
    this.els.songSelect.disabled = on; this.els.stopBtn.disabled = !on;
  },
  flashJudgement(text, color) {
    const j = this.els.judgement;
    j.textContent = text; j.style.color = color;
    j.classList.remove("show"); void j.offsetWidth; j.classList.add("show");
  },
  showResults() {
    const acc = Game.total ? Math.round((Game.hits / Game.total) * 100) : 0;
    let key = "res.ok";
    if (acc >= 95) key = "res.perfect"; else if (acc >= 80) key = "res.excellent";
    else if (acc >= 60) key = "res.good"; else if (acc < 40) key = "res.practice";
    this.els.overlayTitle.textContent = I18N.t(key);
    this.els.overlayBody.innerHTML =
      `<div class="big-score">${Game.score}</div>` +
      `<p class="line">${I18N.t("res.notes")} : <b>${Game.hits}/${Game.total}</b></p>` +
      `<p class="line">${I18N.t("res.accuracy")} : <b>${acc}%</b></p>` +
      `<p class="line">${I18N.t("res.bestcombo")} : <b>${Game.maxCombo}</b></p>`;
    this.els.overlay.classList.remove("hidden");
  },

  playDemo() {
    const song = Library.get(Game.songId);
    if (!song) return;
    Audio.resume();
    const { notes } = Library.normalize(song);
    const t0 = Audio.ctx.currentTime + 0.15;
    for (const n of notes) {
      const k = KEY_BY_MIDI[n.midi]; if (!k) continue;
      const when = t0 + n.time;
      const dur = Math.max(0.2, n.dur * 0.9);
      Audio.playScheduled(n.midi + Game.octaveOffset(), when, dur);
      const delayMs = (when - Audio.ctx.currentTime) * 1000;
      setTimeout(() => { Piano.highlight(k.key, true); setTimeout(() => Piano.highlight(k.key, false), dur * 1000); }, delayMs);
    }
  },

  /* ---- Enregistreur ---- */
  bindRecorder() {
    this.els.recBtn.addEventListener("click", () => {
      if (Recorder.active) {
        Recorder.end();
        this.els.recBtn.classList.remove("recording");
        this.els.recBtn.textContent = I18N.t("create.rec");
        this.els.recStatus.textContent = `${Recorder.notes.length} ${I18N.t("create.notesCount")}`;
        this.els.saveBtn.disabled = !Recorder.hasNotes();
        this.els.discardBtn.disabled = !Recorder.hasNotes();
      } else {
        Recorder.begin();
        this.els.recBtn.classList.add("recording");
        this.els.recBtn.textContent = I18N.t("create.stop");
        this.els.recStatus.textContent = I18N.t("create.recording");
        this.els.saveBtn.disabled = true; this.els.discardBtn.disabled = true;
      }
    });
    this.els.saveBtn.addEventListener("click", () => {
      if (!Recorder.hasNotes()) { this.toast(I18N.t("create.needNotes")); return; }
      const name = this.els.songName.value.trim() || I18N.t("create.namePh");
      Library.add(Recorder.toSong(name));
      Recorder.discard();
      this.els.songName.value = "";
      this.els.recStatus.textContent = "";
      this.els.saveBtn.disabled = true; this.els.discardBtn.disabled = true;
      this.refreshCustomList(); this.refreshSongSelect();
      this.toast(I18N.t("create.saved"));
    });
    this.els.discardBtn.addEventListener("click", () => {
      Recorder.discard();
      this.els.recStatus.textContent = "";
      this.els.saveBtn.disabled = true; this.els.discardBtn.disabled = true;
    });
  },

  refreshCustomList() {
    const ul = this.els.customList;
    ul.innerHTML = "";
    if (!Library.custom.length) {
      const li = document.createElement("li");
      li.className = "empty"; li.textContent = I18N.t("create.empty");
      ul.appendChild(li); return;
    }
    for (const s of Library.custom) {
      const li = document.createElement("li");
      const title = document.createElement("span");
      title.className = "song-title"; title.textContent = s.title;
      const meta = document.createElement("span");
      meta.className = "song-meta"; meta.textContent = `${s.notesSec.length} ${I18N.t("create.notesCount")}`;
      const learn = document.createElement("button");
      learn.className = "icon-btn"; learn.textContent = "🎮 " + I18N.t("create.load");
      learn.addEventListener("click", () => {
        Game.load(s.id); this.els.songSelect.value = s.id;
        this.switchTab("learn"); Game.start();
      });
      const play = document.createElement("button");
      play.className = "icon-btn"; play.textContent = "🔊";
      play.addEventListener("click", () => { Game.load(s.id); this.playDemo(); });
      const del = document.createElement("button");
      del.className = "icon-btn danger"; del.textContent = "🗑";
      del.title = I18N.t("create.del");
      del.addEventListener("click", () => {
        if (confirm(I18N.t("create.confirmDel"))) {
          Library.remove(s.id); this.refreshCustomList(); this.refreshSongSelect();
        }
      });
      li.append(title, meta, play, learn, del);
      ul.appendChild(li);
    }
  },

  /* ---- Onglets ---- */
  bindTabs() {
    this.els.tabs.forEach((t) => t.addEventListener("click", () => this.switchTab(t.dataset.tab)));
  },
  switchTab(name) {
    this.els.tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
    for (const [key, panel] of Object.entries(this.els.panels)) panel.classList.toggle("hidden", key !== name);
    // Recalcule les tailles des canvas une fois visibles
    requestAnimationFrame(() => { Scope.resize(); Game.resize(); Piano.computeCenters(); });
  },

  /* ---- Toast ---- */
  toast(msg) {
    const t = this.els.toast;
    t.textContent = msg; t.classList.add("show");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  },
};

/* =========================================================================
   9. MODALE FOLLOW (suis-moi sur GitHub)
   ========================================================================= */
const Follow = {
  key: "synthazerty.followShown",
  URL: "https://bros-ai.github.io/SynthAZERTY/",
  overlay: null,
  init() {
    this.overlay = document.getElementById("followOverlay");
    document.getElementById("openFollow").addEventListener("click", () => this.open());
    document.getElementById("openShare").addEventListener("click", () => this.open());
    document.getElementById("followClose").addEventListener("click", () => this.close());
    document.getElementById("followLater").addEventListener("click", () => this.close());
    document.getElementById("shareCopyBtn").addEventListener("click", () => this.copy());
    this.overlay.addEventListener("click", (e) => { if (e.target === this.overlay) this.close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") this.close(); });
    // Auto-affichage une seule fois par session, après que l'utilisateur ait pu jouer un peu
    if (!sessionStorage.getItem(this.key)) {
      setTimeout(() => { this.open(); sessionStorage.setItem(this.key, "1"); }, 20000);
    }
  },
  setShareLinks() {
    const url = encodeURIComponent(this.URL);
    const text = encodeURIComponent(I18N.t("share.text"));
    const title = encodeURIComponent("SynthAZERTY");
    const set = (id, href) => { const el = document.getElementById(id); if (el) el.href = href; };
    set("shareX", `https://x.com/intent/tweet?text=${text}&url=${url}`);
    set("shareLinkedIn", `https://www.linkedin.com/sharing/share-offsite/?url=${url}`);
    set("shareReddit", `https://www.reddit.com/submit?url=${url}&title=${title}`);
    set("shareEmail", `mailto:?subject=${title}&body=${text}%0A%0A${url}`);
  },
  copy() {
    const done = () => {
      const btn = document.getElementById("shareCopyBtn");
      btn.textContent = I18N.t("share.copied"); btn.classList.add("copied");
      setTimeout(() => { btn.textContent = I18N.t("share.copy"); btn.classList.remove("copied"); }, 2000);
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.URL).then(done).catch(() => this.copyFallback());
    } else { this.copyFallback(); }
  },
  copyFallback() {
    const inp = document.getElementById("shareCopyInput");
    inp.select(); try { document.execCommand("copy"); } catch {}
  },
  open() { this.setShareLinks(); this.overlay.classList.remove("hidden"); },
  close() { this.overlay.classList.add("hidden"); },
};

/* =========================================================================
   10. DÉMARRAGE
   ========================================================================= */
window.addEventListener("DOMContentLoaded", () => {
  I18N.init();
  Library.load();
  Piano.build();
  Input.attach();
  Scope.init();
  Game.init();
  UI.init();
  Follow.init();
  I18N.apply();

  const unlock = () => {
    Audio.resume();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
});
