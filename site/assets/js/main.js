"use strict";

/* ============================================================
   Dugun davetiyesi - tum etkilesim
   Isim/tarih/mekan buradan duzenlenebilir.
   ============================================================ */

const CONFIG = {
  nameA: "Şule",
  nameB: "Berkay",
  dateISO: "2026-10-25T16:00:00+03:00",
  venueName: "Gül Kurusu Bahçe",
  venueCity: "Üsküdar, İstanbul",
  timeLabel: "16:00"
};

const $ = (s, p) => (p || document).querySelector(s);
const $$ = (s, p) => Array.from((p || document).querySelectorAll(s));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------
   Yapilandirma baglama
   ------------------------------------------------------------ */

function trDate(d) {
  const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
}

function trWeekday(d) {
  const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  return days[d.getDay()];
}

function fillConfig() {
  const d = new Date(CONFIG.dateISO);
  const p2 = (n) => String(n).padStart(2, "0");
  const vals = {
    "name-a": CONFIG.nameA,
    "name-b": CONFIG.nameB,
    "initial-a": (CONFIG.nameA[0] || "").toUpperCase(),
    "initial-b": (CONFIG.nameB[0] || "").toUpperCase(),
    "date-long": trDate(d) + ", " + trWeekday(d),
    "date-num": trDate(d),
    "date-short": p2(d.getDate()) + "." + p2(d.getMonth() + 1) + "." + d.getFullYear(),
    "weekday": trWeekday(d),
    "time": CONFIG.timeLabel,
    "venue": CONFIG.venueName + ", " + CONFIG.venueCity,
    "venue-name": CONFIG.venueName,
    "venue-city": CONFIG.venueCity
  };
  $$("[data-cfg]").forEach((el) => {
    const v = vals[el.dataset.cfg];
    if (v != null) el.textContent = v;
  });
  document.title = CONFIG.nameA + " & " + CONFIG.nameB + " · Düğün Davetiyemiz";
}

/* ------------------------------------------------------------
   Preloader
   ------------------------------------------------------------ */

const preloader = $("#preloader");
let preloaderDone = false;

function hidePreloader() {
  if (preloaderDone) return;
  preloaderDone = true;
  preloader.classList.add("done");
  document.body.classList.add("ready");
  setTimeout(() => preloader.remove(), 950);
}

function initPreloader() {
  const minWait = new Promise((r) => setTimeout(r, 1500));
  let fontsReady = Promise.resolve();
  if (document.fonts && document.fonts.ready) {
    fontsReady = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3500))]);
  }
  Promise.all([minWait, fontsReady]).then(hidePreloader);
  setTimeout(hidePreloader, 6000);
  window.addEventListener("error", hidePreloader);
}

/* ------------------------------------------------------------
   Yaprak ve kalp parcaciklari (canvas)
   ------------------------------------------------------------ */

const petalCanvas = $("#petals");
const pctx = petalCanvas.getContext("2d");
const PETAL_COLORS = ["#F6C7D3", "#E4D5F1", "#FBE3C6", "#D6EADF", "#F3DCE0"];
const HEART_COLORS = ["#E89AB4", "#D67BA0", "#C9A0E0", "#E7B6C6", "#D9A2B8"];
let W = 0, H = 0;
let petals = [];
let hearts = [];
let lastT = 0;

function makePetal(fromTop) {
  return {
    x: rand(0, W),
    y: fromTop ? rand(-60, -20) : rand(0, H),
    size: rand(9, 17),
    speed: rand(18, 44),
    sway: rand(8, 24),
    swayFreq: rand(0.4, 1),
    phase: rand(0, Math.PI * 2),
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.7, 0.7),
    color: pick(PETAL_COLORS),
    alpha: rand(0.4, 0.75)
  };
}

function resizePetals() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  petalCanvas.width = Math.round(W * dpr);
  petalCanvas.height = Math.round(H * dpr);
  petalCanvas.style.width = W + "px";
  petalCanvas.style.height = H + "px";
  pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const target = Math.round(Math.min(28, Math.max(13, (W * H) / 44000)));
  while (petals.length < target) petals.push(makePetal(false));
  petals.length = target;
}

function drawPetal(p) {
  pctx.save();
  pctx.translate(p.x, p.y);
  pctx.rotate(p.rot);
  pctx.globalAlpha = p.alpha;
  pctx.fillStyle = p.color;
  const s = p.size;
  pctx.beginPath();
  pctx.moveTo(0, -s * 0.5);
  pctx.bezierCurveTo(s * 0.55, -s * 0.32, s * 0.5, s * 0.35, 0, s * 0.55);
  pctx.bezierCurveTo(-s * 0.5, s * 0.35, -s * 0.55, -s * 0.32, 0, -s * 0.5);
  pctx.fill();
  pctx.restore();
}

function drawHeart(h) {
  const s = h.size;
  pctx.save();
  pctx.translate(h.x, h.y);
  pctx.rotate(h.rot);
  pctx.globalAlpha = Math.max(0, Math.min(1, h.life / h.maxLife));
  pctx.fillStyle = h.color;
  pctx.beginPath();
  pctx.moveTo(0, s * 0.3);
  pctx.bezierCurveTo(s * 0.62, -s * 0.35, s * 1.05, s * 0.25, 0, s);
  pctx.bezierCurveTo(-s * 1.05, s * 0.25, -s * 0.62, -s * 0.35, 0, s * 0.3);
  pctx.fill();
  pctx.restore();
}

function burstHearts(x, y, n) {
  for (let i = 0; i < n; i++) {
    hearts.push({
      x, y,
      vx: rand(-140, 140),
      vy: rand(-320, -120),
      grav: 340,
      size: rand(7, 15),
      rot: rand(-0.6, 0.6),
      vr: rand(-3, 3),
      color: pick(HEART_COLORS),
      life: rand(1, 1.6),
      maxLife: 1.6
    });
  }
}

function heartRain(n) {
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      hearts.push({
        x: rand(0, W),
        y: -20,
        vx: rand(-30, 30),
        vy: rand(50, 130),
        grav: 45,
        size: rand(8, 16),
        rot: rand(-0.5, 0.5),
        vr: rand(-1.5, 1.5),
        color: pick(HEART_COLORS),
        life: rand(3.2, 4.5),
        maxLife: 4.5
      });
    }, i * 55);
  }
}

function petalsFrame(t) {
  const dt = Math.min((t - lastT) / 1000, 0.05) || 0.016;
  lastT = t;
  const now = t / 1000;
  pctx.clearRect(0, 0, W, H);

  for (const p of petals) {
    p.x += Math.sin(now * p.swayFreq + p.phase) * p.sway * dt;
    p.y += p.speed * dt;
    p.rot += p.vr * dt;
    if (p.y > H + 40) {
      p.y = rand(-60, -20);
      p.x = rand(0, W);
    }
    drawPetal(p);
  }

  for (let i = hearts.length - 1; i >= 0; i--) {
    const h = hearts[i];
    h.vy += h.grav * dt;
    h.x += h.vx * dt;
    h.y += h.vy * dt;
    h.rot += h.vr * dt;
    h.life -= dt;
    if (h.life <= 0 || h.y > H + 60) {
      hearts.splice(i, 1);
      continue;
    }
    drawHeart(h);
  }

  requestAnimationFrame(petalsFrame);
}

function initPetals() {
  if (reduced) return;
  resizePetals();
  let rT;
  window.addEventListener("resize", () => {
    clearTimeout(rT);
    rT = setTimeout(resizePetals, 160);
  });
  requestAnimationFrame((t) => {
    lastT = t;
    requestAnimationFrame(petalsFrame);
  });
}

/* ------------------------------------------------------------
   Geri sayim
   ------------------------------------------------------------ */

const cdTarget = new Date(CONFIG.dateISO).getTime();
const cdEls = { d: $("#cdD"), h: $("#cdH"), m: $("#cdM"), s: $("#cdS") };
let countdownZero = false;

function setNum(el, value) {
  const str = String(value).padStart(2, "0");
  if (el.dataset.v === str) return;
  el.dataset.v = str;
  el.querySelectorAll(".slot.leave").forEach((s) => s.remove());
  const prev = el.querySelector(".slot.cur");
  const next = document.createElement("span");
  next.className = "slot cur enter";
  next.textContent = str;
  el.appendChild(next);
  if (prev) {
    prev.classList.remove("cur");
    prev.classList.add("leave");
    setTimeout(() => prev.remove(), 700);
  }
  if (reduced) {
    next.classList.remove("enter");
    return;
  }
  void next.offsetWidth;
  next.classList.remove("enter");
}

function zeroState() {
  if (countdownZero) return;
  countdownZero = true;
  Object.values(cdEls).forEach((el) => setNum(el, 0));
  const title = $(".lt-count-title");
  if (title) title.textContent = "Bugün büyük günümüz!";
  if (!reduced) heartRain(46);
}

function countdownTick() {
  const diff = cdTarget - Date.now();
  if (diff <= 0) {
    zeroState();
    return;
  }
  setNum(cdEls.d, Math.floor(diff / 86400000));
  setNum(cdEls.h, Math.floor(diff / 3600000) % 24);
  setNum(cdEls.m, Math.floor(diff / 60000) % 60);
  setNum(cdEls.s, Math.floor(diff / 1000) % 60);
  setTimeout(countdownTick, 1000 - (Date.now() % 1000));
}

/* ------------------------------------------------------------
   Scroll reveal + zaman cizgisi
   ------------------------------------------------------------ */

function initReveals() {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.16, rootMargin: "0px 0px -6% 0px" });
  $$("[data-reveal]").forEach((el) => io.observe(el));
}

function initLetterFallback() {
  const card = $("#letterCard");
  if (!card) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        card.classList.add("arrive");
        io.disconnect();
      }
    }
  }, { threshold: 0.22 });
  io.observe(card);
}

function initTimeline() {
  const tl = $("#timeline");
  const fill = $("#tlFill");
  if (!tl || !fill) return;
  let ticking = false;
  function update() {
    ticking = false;
    const r = tl.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (window.innerHeight * 0.72 - r.top) / r.height));
    fill.style.setProperty("--p", p.toFixed(4));
  }
  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}

/* ------------------------------------------------------------
   Zarf acilis
   ------------------------------------------------------------ */

function initEnvelope() {
  const envelope = $("#envelope");
  const seal = $("#seal");
  const letterCard = $("#letterCard");
  const section = $("#davetiye");
  let opened = false;

  seal.addEventListener("click", () => {
    if (opened) return;
    opened = true;
    seal.classList.add("pop");
    Audio.chime();
    if (!reduced) {
      const r = seal.getBoundingClientRect();
      burstHearts(r.left + r.width / 2, r.top + r.height / 2, 16);
    }
    setTimeout(() => envelope.classList.add("open"), 380);
    setTimeout(() => envelope.classList.add("behind"), 1150);
    setTimeout(() => {
      envelope.classList.add("flown");
      letterCard.classList.add("arrive");
    }, 1550);
    setTimeout(() => {
      if (!reduced) section.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 2150);
  });
}

/* ------------------------------------------------------------
   Muzik kutusu (WebAudio) + muhur cingirtisi
   ------------------------------------------------------------ */

const Audio = (() => {
  let actx = null, master = null, bus = null, chimeBus = null;
  let playing = false, timer = null, evIndex = 0, loopStart = 0;
  let events = [], loopLen = 0;

  const BEAT = 0.62;
  /* 3/4 vals, 16 olcu: C Am F G C Am Dm G | F G Em Am F G C C */
  const BARS = [
    { c: [60, 64, 67], m: [72, 76, 79] },
    { c: [57, 60, 64], m: [81, 79, 76] },
    { c: [53, 57, 60], m: [77, 74, 72] },
    { c: [55, 59, 62], m: [74, 71, 74] },
    { c: [60, 64, 67], m: [76, 79, 84] },
    { c: [57, 60, 64], m: [83, 84, 83] },
    { c: [50, 53, 57], m: [81, 77, 81] },
    { c: [55, 59, 62], m: [79, 74, 76] },
    { c: [53, 57, 60], m: [77, 81, 84] },
    { c: [55, 59, 62], m: [83, 79, 74] },
    { c: [52, 55, 59], m: [76, 79, 83] },
    { c: [57, 60, 64], m: [81, 84, 88] },
    { c: [53, 57, 60], m: [84, 81, 77] },
    { c: [55, 59, 62], m: [79, 74, 71] },
    { c: [60, 64, 67], m: [76, 79, 84] },
    { c: [60, 64, 67], m: [79, 76, null] }
  ];

  const midiHz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function build() {
    events = [];
    BARS.forEach((bar, b) => {
      for (let i = 0; i < 3; i++) {
        const t = (b * 3 + i) * BEAT;
        if (bar.m[i] != null) events.push({ t: t + 0.004, n: bar.m[i], v: 0.32, d: 1.7 });
        events.push({ t: t + 0.014, n: bar.c[i], v: 0.095, d: 1.05 });
      }
    });
    events.sort((a, b) => a.t - b.t);
    loopLen = BARS.length * 3 * BEAT;
  }

  function ensure() {
    if (actx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    actx = new AC();
    master = actx.createGain();
    master.gain.value = 0;
    master.connect(actx.destination);
    bus = actx.createGain();
    bus.gain.value = 0.5;
    bus.connect(master);
    const delay = actx.createDelay(1);
    delay.delayTime.value = 0.31;
    const fb = actx.createGain();
    fb.gain.value = 0.3;
    const wet = actx.createGain();
    wet.gain.value = 0.2;
    bus.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(wet);
    wet.connect(master);
    chimeBus = actx.createGain();
    chimeBus.gain.value = 0.4;
    chimeBus.connect(actx.destination);
    build();
    return true;
  }

  function pluckTo(dest, freq, when, vel, dur) {
    const t = Math.max(when, actx.currentTime + 0.01);
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(dest);
    o.start(t);
    o.stop(t + dur + 0.1);

    const o2 = actx.createOscillator();
    const g2 = actx.createGain();
    o2.type = "sine";
    o2.frequency.value = freq * 4.01;
    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(vel * 0.12, t + 0.005);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.45);
    o2.connect(g2);
    g2.connect(dest);
    o2.start(t);
    o2.stop(t + dur * 0.45 + 0.1);
  }

  function schedule() {
    if (!playing) return;
    const horizon = actx.currentTime + 0.75;
    let guard = 0;
    while (guard++ < 64) {
      const ev = events[evIndex];
      const t = loopStart + ev.t;
      if (t > horizon) break;
      if (t >= actx.currentTime - 0.02) {
        pluckTo(bus, midiHz(ev.n), t, ev.v, ev.d);
      }
      evIndex++;
      if (evIndex >= events.length) {
        evIndex = 0;
        loopStart += loopLen;
      }
    }
  }

  function toggle() {
    if (!ensure()) return false;
    if (actx.state === "suspended") actx.resume();
    playing = !playing;
    const now = actx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    if (playing) {
      master.gain.linearRampToValueAtTime(0.55, now + 1.2);
      evIndex = 0;
      loopStart = now + 0.2;
      timer = setInterval(schedule, 220);
      schedule();
    } else {
      master.gain.linearRampToValueAtTime(0, now + 0.7);
      setTimeout(() => clearInterval(timer), 900);
    }
    return playing;
  }

  function chime() {
    if (!ensure()) return;
    if (actx.state === "suspended") actx.resume();
    const t = actx.currentTime + 0.02;
    pluckTo(chimeBus, midiHz(88), t, 0.4, 2.2);
    pluckTo(chimeBus, midiHz(91), t + 0.14, 0.3, 2.0);
  }

  function suspend() { if (actx && playing) actx.suspend(); }
  function resume() { if (actx && playing) actx.resume(); }

  return { toggle, chime, suspend, resume };
})();

function initMusic() {
  const btn = $("#musicBtn");
  btn.addEventListener("click", () => {
    const on = Audio.toggle();
    btn.classList.toggle("playing", on);
    btn.setAttribute("aria-pressed", String(on));
    btn.setAttribute("aria-label", on ? "Müziği kapat" : "Müziği aç");
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) Audio.suspend();
    else Audio.resume();
  });
}

/* ------------------------------------------------------------
   Takvime ekle (.ics)
   ------------------------------------------------------------ */

function icsPad(n) { return String(n).padStart(2, "0"); }

function icsFmt(d) {
  return d.getUTCFullYear() + icsPad(d.getUTCMonth() + 1) + icsPad(d.getUTCDate()) +
    "T" + icsPad(d.getUTCHours()) + icsPad(d.getUTCMinutes()) + icsPad(d.getUTCSeconds()) + "Z";
}

function toAscii(s) {
  const map = { "ç": "c", "Ç": "C", "ğ": "g", "Ğ": "G", "ı": "i", "İ": "I", "ö": "o", "Ö": "O",
    "ş": "s", "Ş": "S", "ü": "u", "Ü": "U", "â": "a", "î": "i", "û": "u" };
  return s.replace(/[çÇğĞıİöÖşŞüÜâîû]/g, (ch) => map[ch] || ch);
}

function initIcs() {
  $("#icsBtn").addEventListener("click", () => {
    const dt = new Date(CONFIG.dateISO);
    const end = new Date(dt.getTime() + 4 * 3600000);
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//dugun davetiyesi//TR//",
      "BEGIN:VEVENT",
      "UID:" + Date.now() + "-dugun@davetiye",
      "DTSTAMP:" + icsFmt(new Date()),
      "DTSTART:" + icsFmt(dt),
      "DTEND:" + icsFmt(end),
      "SUMMARY:" + toAscii(CONFIG.nameA) + " & " + toAscii(CONFIG.nameB) + " - Dugun",
      "DESCRIPTION:" + toAscii("Düğün davetiyemiz. Sizi aramızda görmek bizi çok mutlu eder."),
      "LOCATION:" + toAscii(CONFIG.venueName + ", " + CONFIG.venueCity),
      "END:VEVENT",
      "END:VCALENDAR"
    ];
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dugun-davetiyesi.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  });
}

/* ------------------------------------------------------------
   Baslat
   ------------------------------------------------------------ */

fillConfig();
initPreloader();
initPetals();
countdownTick();
initReveals();
initLetterFallback();
initTimeline();
initEnvelope();
initMusic();
initIcs();
