// Animierte Hintergründe für die Themes. Reines SVG mit CSS-Animationen, kein Skript.
// Die Motive bleiben an den Rändern, damit der Text in der Mitte lesbar bleibt.

function rng(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const W = 1600
const H = 1000

function wrap(id: string, defs: string, style: string, body: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
    `<defs>${defs}</defs><style>${style}` +
    `@media (prefers-reduced-motion: reduce){*{animation:none!important}}</style>` +
    `<rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>${body}</svg>`
  )
}

function sky(id: string, light: [string, string], dark: [string, string]): { defs: string; style: string } {
  return {
    defs: `<linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="s0"/><stop offset="1" class="s1"/></linearGradient>`,
    style:
      `.s0{stop-color:${light[0]}}.s1{stop-color:${light[1]}}` +
      `@media (prefers-color-scheme: dark){.s0{stop-color:${dark[0]}}.s1{stop-color:${dark[1]}}}`,
  }
}

// Vier unsichtbare Dreiecke um jedes Teilchen: Von welcher Seite die Maus kommt,
// in die Gegenrichtung wird es ein Stück weggeschubst (reines CSS, kein Skript).
const HIT =
  `<polygon class="hz hl" points="-40,-40 0,0 -40,40"/><polygon class="hz hr" points="40,-40 0,0 40,40"/>` +
  `<polygon class="hz ht" points="-40,-40 0,0 40,-40"/><polygon class="hz hb" points="-40,40 0,0 40,40"/>`

// Ein Teilchen, das von oben nach unten fällt und dabei schwankt und sich dreht.
function fallers(r: () => number, count: number, shape: (i: number) => string, cls: string, minDur: number, maxDur: number): string {
  let out = ''
  for (let i = 0; i < count; i++) {
    // Bevorzugt die Ränder: 70 % links oder rechts, 30 % irgendwo.
    const edge = r()
    const x = edge < 0.35 ? r() * 380 : edge < 0.7 ? W - r() * 380 : r() * W
    const dur = (minDur + r() * (maxDur - minDur)).toFixed(1)
    const delay = (-r() * Number(dur)).toFixed(1)
    const scale = (0.6 + r() * 0.9).toFixed(2)
    out +=
      `<g transform="translate(${x.toFixed(0)} -60)"><g class="mv"><g class="${cls}" style="animation-duration:${dur}s;animation-delay:${delay}s">${HIT}<g class="bod">` +
      `<g class="sway" style="animation-duration:${(3 + r() * 3).toFixed(1)}s;animation-delay:${delay}s"><g transform="scale(${scale})">${shape(i)}</g></g></g></g></g></g>`
  }
  return out
}

const FALL_STYLE =
  `.fall{animation:fall linear infinite}` +
  `.hz{fill:transparent;pointer-events:all}.bod{pointer-events:none;transition:transform 0s 100000s}` +
  `.hl:hover~.bod{transform:translate(70px,-10px);transition:transform 1.1s cubic-bezier(.22,1.25,.4,1)}` +
  `.hr:hover~.bod{transform:translate(-70px,-10px);transition:transform 1.1s cubic-bezier(.22,1.25,.4,1)}` +
  `.ht:hover~.bod{transform:translate(10px,60px);transition:transform 1.1s cubic-bezier(.22,1.25,.4,1)}` +
  `.hb:hover~.bod{transform:translate(-10px,-60px);transition:transform 1.1s cubic-bezier(.22,1.25,.4,1)}` +
  `@keyframes fall{from{transform:translateY(0)}to{transform:translateY(${H + 140}px)}}` +
  `.sway{animation:sway ease-in-out infinite alternate}` +
  `@keyframes sway{from{transform:translateX(-30px) rotate(-35deg)}to{transform:translateX(30px) rotate(40deg)}}`

function herbst(nacht = false): string {
  const r = rng(nacht ? 9 : 7)
  const s = nacht
    ? sky('herbstnacht', ['#3a2a3a', '#24161c'], ['#170d14', '#0d0709'])
    : sky('herbst', ['#f6e4c8', '#e9c9a0'], ['#2a1c12', '#1a120c'])
  const leaf = (i: number) =>
    `<path class="bit l${i % 5}" d="M0 -18 C12 -12 14 4 0 18 C-14 4 -12 -12 0 -18 Z M0 -18 L0 18" stroke-width="1"/>`
  const hills =
    `<path d="M0 880 C300 820 520 900 800 870 C1100 840 1300 900 1600 860 L1600 1000 L0 1000 Z" class="hill"/>` +
    `<ellipse cx="180" cy="905" rx="190" ry="34" class="pile"/><ellipse cx="1420" cy="910" rx="220" ry="36" class="pile"/>`
  const light = `.l0{fill:#d9622b}.l1{fill:#e0912f}.l2{fill:#b8461f}.l3{fill:#c97a1e}.l4{fill:#a5381c}.bit{stroke:#7a3412;opacity:.9}.hill{fill:#d9a46c;opacity:.55}.pile{fill:#d06a2a;opacity:.55}`
  const dark = `.l0{fill:#b84a1f}.l1{fill:#c97c24}.l2{fill:#9a3618}.l3{fill:#d08c2c}.l4{fill:#8c2e16}.bit{stroke:#2a1208;opacity:.95}.hill{fill:#2e1c10;opacity:.9}.pile{fill:#5a2a12;opacity:.8}`
  let extra = ''
  if (nacht) {
    for (let i = 0; i < 40; i++) {
      extra += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * 500).toFixed(0)}" r="${(0.8 + r() * 1.4).toFixed(1)}" class="star" style="animation-duration:${(2 + r() * 4).toFixed(1)}s;animation-delay:${(-r() * 6).toFixed(1)}s"/>`
    }
    extra += `<circle cx="1380" cy="160" r="54" fill="#e9d9b0" opacity=".85"/>`
  }
  const style =
    s.style + FALL_STYLE + (nacht ? dark : light + `@media (prefers-color-scheme: dark){${dark}}`) +
    `.star{fill:#f3e6c8;animation:tw ease-in-out infinite alternate}@keyframes tw{from{opacity:.1}to{opacity:.8}}`
  return wrap(nacht ? 'herbstnacht' : 'herbst', s.defs, style, extra + hills + fallers(r, 46, leaf, 'fall', 11, 22))
}

function sakura(): string {
  const r = rng(11)
  const s = sky('sakura', ['#fbe6ee', '#f3cddb'], ['#2a1620', '#170c12'])
  const petal = (i: number) =>
    `<path class="bit p${i % 3}" d="M0 -10 C8 -10 10 0 0 10 C-10 0 -8 -10 0 -10 Z"/>`
  const branch =
    `<path d="M-20 140 C140 120 260 60 420 70 M200 108 C240 60 300 40 360 30" stroke="#5a3a3f" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.75"/>` +
    Array.from({ length: 16 }, (_, i) => `<circle cx="${(40 + i * 24 + r() * 20).toFixed(0)}" cy="${(70 + r() * 70).toFixed(0)}" r="${(10 + r() * 12).toFixed(0)}" fill="#f2a3c0" opacity="0.7"/>`).join('')
  return wrap('sakura', s.defs, s.style + FALL_STYLE + `.p0{fill:#f7a8c4}.p1{fill:#f4bfd3}.p2{fill:#ec8fb2}.bit{opacity:.9}@media (prefers-color-scheme: dark){.p0{fill:#d27394}.p1{fill:#e294ae}.p2{fill:#b8577c}}`, branch + fallers(r, 48, petal, 'fall', 13, 26))
}

function mitternacht(): string {
  const r = rng(23)
  const s = sky('mitternacht', ['#dfe3f4', '#c6cde9'], ['#0b0d1a', '#151a33'])
  let stars = ''
  for (let i = 0; i < 90; i++) {
    const x = r() * W
    const y = r() * H * 0.75
    stars += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(0.8 + r() * 1.8).toFixed(1)}" class="star" style="animation-duration:${(2 + r() * 4).toFixed(1)}s;animation-delay:${(-r() * 6).toFixed(1)}s"/>`
  }
  const moon = `<g transform="translate(1390 170)"><circle r="70" class="moon"/><circle cx="26" cy="-14" r="64" class="moonbite"/></g>`
  const shoot = `<g class="shoot"><line x1="0" y1="0" x2="-120" y2="-40" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.8"/></g>`
  const style =
    s.style +
    `.star{fill:#5a64a8;animation:tw ease-in-out infinite alternate}@keyframes tw{from{opacity:.15}to{opacity:.9}}` +
    `.moon{fill:#f1e9c9}.moonbite{fill:#c6cde9}` +
    `.shoot{animation:shoot 9s ease-in infinite;opacity:0}@keyframes shoot{0%{transform:translate(300px,80px);opacity:0}3%{opacity:1}12%{transform:translate(900px,280px);opacity:0}100%{opacity:0}}` +
    `@media (prefers-color-scheme: dark){.star{fill:#e6e9ff}.moonbite{fill:#121631}}`
  return wrap('mitternacht', s.defs, style, stars + moon + shoot)
}

function ozean(): string {
  const r = rng(31)
  const s = sky('ozean', ['#e3f3f7', '#bfe1ea'], ['#0b1c22', '#06232c'])
  const wave = (y: number, cls: string, dur: number) =>
    `<g class="wave" style="animation-duration:${dur}s"><path class="${cls}" d="M0 ${y} ${Array.from({ length: 9 }, (_, i) => `Q ${i * 400 + 100} ${y - 26} ${i * 400 + 200} ${y} T ${i * 400 + 400} ${y}`).join(' ')} L 3600 ${H} L 0 ${H} Z"/></g>`
  let bubbles = ''
  for (let i = 0; i < 26; i++) {
    const x = r() < 0.5 ? r() * 360 : W - r() * 360
    bubbles += `<circle cx="${x.toFixed(0)}" cy="${H + 20}" r="${(3 + r() * 7).toFixed(0)}" class="bub" style="animation-duration:${(8 + r() * 10).toFixed(1)}s;animation-delay:${(-r() * 18).toFixed(1)}s"/>`
  }
  const style =
    s.style +
    `.wave{animation:wave linear infinite}@keyframes wave{from{transform:translateX(0)}to{transform:translateX(-800px)}}` +
    `.w1{fill:#7cc4d6;opacity:.45}.w2{fill:#3f9cb8;opacity:.4}.w3{fill:#1f7fa3;opacity:.45}` +
    `.bub{fill:none;stroke:#2b8fb0;stroke-width:2;opacity:.5;animation:rise linear infinite}@keyframes rise{from{transform:translateY(0)}to{transform:translateY(-${H + 80}px)}}` +
    `@media (prefers-color-scheme: dark){.w1{fill:#12485a}.w2{fill:#0e3a4a}.w3{fill:#0a2d3a;opacity:.8}.bub{stroke:#5fc0dc}}`
  return wrap('ozean', s.defs, style, wave(820, 'w1', 18) + wave(860, 'w2', 13) + wave(910, 'w3', 9) + bubbles)
}

function wald(): string {
  const r = rng(43)
  const s = sky('wald', ['#e8efe0', '#cfdcc1'], ['#0f1710', '#0a120b'])
  const pine = (x: number, h: number, cls: string) =>
    `<path class="${cls}" d="M${x} ${H - h} L${x - h * 0.28} ${H - h * 0.55} L${x - h * 0.14} ${H - h * 0.55} L${x - h * 0.36} ${H - h * 0.2} L${x - h * 0.08} ${H - h * 0.2} L${x - h * 0.08} ${H} L${x + h * 0.08} ${H} L${x + h * 0.08} ${H - h * 0.2} L${x + h * 0.36} ${H - h * 0.2} L${x + h * 0.14} ${H - h * 0.55} L${x + h * 0.28} ${H - h * 0.55} Z"/>`
  let trees = ''
  for (let i = 0; i < 9; i++) trees += pine(r() * 420, 260 + r() * 260, i % 2 ? 'p1' : 'p2')
  for (let i = 0; i < 9; i++) trees += pine(W - r() * 420, 260 + r() * 260, i % 2 ? 'p1' : 'p2')
  let flies = ''
  for (let i = 0; i < 30; i++) {
    const x = r() < 0.5 ? r() * 480 : W - r() * 480
    flies += `<circle cx="${x.toFixed(0)}" cy="${(450 + r() * 480).toFixed(0)}" r="${(2 + r() * 2.5).toFixed(1)}" class="bit fly" style="animation-duration:${(3 + r() * 4).toFixed(1)}s;animation-delay:${(-r() * 7).toFixed(1)}s"/>`
  }
  const style =
    s.style + `.bit{transform-box:fill-box;transform-origin:center;transition:transform .9s ease}.bit:hover{transform:scale(3)}` +
    `.p1{fill:#4f7a45;opacity:.55}.p2{fill:#2f5a2c;opacity:.6}` +
    `.fly{fill:#d7c84a;animation:fly ease-in-out infinite alternate}@keyframes fly{from{opacity:.1;transform:translate(0,0)}to{opacity:.95;transform:translate(14px,-22px)}}` +
    `@media (prefers-color-scheme: dark){.p1{fill:#1d3320;opacity:.9}.p2{fill:#14261a;opacity:.95}.fly{fill:#f3e66a}}`
  return wrap('wald', s.defs, style, trees + flies)
}


function schnee(): string {
  const r = rng(53)
  const s = sky('schnee', ['#eef3f8', '#d7e2ee'], ['#0e1622', '#18243a'])
  const flake = () => `<circle class="bit flake" r="${(3 + r() * 5).toFixed(1)}"/>`
  const ground = `<path d="M0 900 C260 870 520 920 800 895 C1080 870 1340 915 1600 890 L1600 1000 L0 1000 Z" class="snowg"/>`
  const style = s.style + FALL_STYLE +
    `.flake{fill:#ffffff;stroke:#b9c8da;stroke-width:1;opacity:.95}.snowg{fill:#ffffff;opacity:.8}` +
    `@media (prefers-color-scheme: dark){.flake{fill:#dfe8f5;stroke:none;opacity:.8}.snowg{fill:#2a3a52;opacity:.9}}`
  return wrap('schnee', s.defs, style, ground + fallers(r, 70, flake, 'fall', 16, 32))
}

function regen(): string {
  const r = rng(61)
  const s = sky('regen', ['#dfe5ea', '#c3ccd5'], ['#11161c', '#1b232c'])
  let drops = ''
  for (let i = 0; i < 110; i++) {
    const x = r() * (W + 300)
    drops += `<line x1="${x.toFixed(0)}" y1="-40" x2="${(x - 14).toFixed(0)}" y2="0" class="drop" style="animation-duration:${(0.7 + r() * 0.6).toFixed(2)}s;animation-delay:${(-r() * 2).toFixed(2)}s"/>`
  }
  let ripples = ''
  for (let i = 0; i < 14; i++) {
    const x = r() < 0.5 ? r() * 420 : W - r() * 420
    ripples += `<ellipse cx="${x.toFixed(0)}" cy="${(930 + r() * 50).toFixed(0)}" rx="18" ry="5" class="rip" style="animation-delay:${(-r() * 2.4).toFixed(2)}s"/>`
  }
  const style = s.style +
    `.drop{stroke:#7a8a9c;stroke-width:1.6;opacity:.55;animation:rain linear infinite}@keyframes rain{from{transform:translate(0,0)}to{transform:translate(-140px,${H + 80}px)}}` +
    `.rip{fill:none;stroke:#7a8a9c;stroke-width:1.5;transform-box:fill-box;transform-origin:center;animation:rip 2.4s ease-out infinite}@keyframes rip{from{transform:scale(.2);opacity:.8}to{transform:scale(2.4);opacity:0}}` +
    `@media (prefers-color-scheme: dark){.drop{stroke:#5d7088;opacity:.6}.rip{stroke:#5d7088}}`
  return wrap('regen', s.defs, style, drops + ripples)
}

function lagerfeuer(): string {
  const r = rng(71)
  const s = sky('lagerfeuer', ['#f3e2cc', '#e7c49c'], ['#140c08', '#22120a'])
  const fire = (x: number) =>
    `<g transform="translate(${x} 960)"><ellipse rx="90" ry="14" class="logs"/>` +
    `<path class="fl f1" d="M-46 0 C-60 -70 -10 -90 -18 -150 C20 -110 50 -80 40 0 Z"/>` +
    `<path class="fl f2" d="M-20 0 C-30 -50 0 -70 4 -110 C24 -70 36 -50 26 0 Z"/>` +
    `<path class="fl f3" d="M-8 0 C-14 -26 4 -40 6 -60 C16 -36 20 -20 14 0 Z"/></g>`
  let sparks = ''
  for (let i = 0; i < 40; i++) {
    const base = i % 2 ? 160 : 1440
    sparks += `<circle cx="${(base - 60 + r() * 120).toFixed(0)}" cy="930" r="${(1.5 + r() * 2.5).toFixed(1)}" class="bit spark" style="animation-duration:${(3 + r() * 4).toFixed(1)}s;animation-delay:${(-r() * 7).toFixed(1)}s"/>`
  }
  const style = s.style +
    `.bit{transform-box:fill-box;transform-origin:center}` +
    `.logs{fill:#4a2a18}.fl{transform-box:fill-box;transform-origin:bottom center;animation:flick ease-in-out infinite alternate}` +
    `.f1{fill:#e2552a;animation-duration:.9s}.f2{fill:#f39a2b;animation-duration:.7s}.f3{fill:#ffd36a;animation-duration:.5s}` +
    `@keyframes flick{from{transform:scaleY(.9) skewX(-3deg)}to{transform:scaleY(1.08) skewX(3deg)}}` +
    `.spark{fill:#ffb347;animation:up linear infinite}@keyframes up{from{transform:translate(0,0);opacity:1}to{transform:translate(40px,-700px);opacity:0}}`
  return wrap('lagerfeuer', s.defs, style, fire(160) + fire(1440) + sparks)
}

function polarlicht(): string {
  const r = rng(83)
  const s = sky('polarlicht', ['#d8e6ee', '#c4d6e2'], ['#050b14', '#0b1a24'])
  const band = (y: number, cls: string, dur: number) =>
    `<path class="band ${cls}" style="animation-duration:${dur}s" d="M-200 ${y} C200 ${y - 90} 500 ${y + 70} 800 ${y - 20} S1400 ${y - 110} 1800 ${y - 10} L1800 ${y + 140} C1400 ${y + 40} 1100 ${y + 170} 800 ${y + 100} S200 ${y + 60} -200 ${y + 150} Z"/>`
  let stars = ''
  for (let i = 0; i < 80; i++) {
    stars += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * H * 0.8).toFixed(0)}" r="${(0.7 + r() * 1.5).toFixed(1)}" class="star" style="animation-duration:${(2 + r() * 4).toFixed(1)}s;animation-delay:${(-r() * 6).toFixed(1)}s"/>`
  }
  const style = s.style +
    `.band{mix-blend-mode:screen;filter:blur(18px);transform-box:fill-box;transform-origin:center;animation:wogen ease-in-out infinite alternate}` +
    `.a1{fill:#3fd8a0;opacity:.35}.a2{fill:#2fb6d8;opacity:.28}.a3{fill:#9a6ae0;opacity:.22}` +
    `@keyframes wogen{from{transform:translateX(-60px) scaleY(.85)}to{transform:translateX(60px) scaleY(1.15)}}` +
    `.star{fill:#6a7d94;animation:tw ease-in-out infinite alternate}@keyframes tw{from{opacity:.15}to{opacity:.9}}` +
    `@media (prefers-color-scheme: dark){.a1{opacity:.55}.a2{opacity:.45}.a3{opacity:.38}.star{fill:#e8f2ff}}`
  return wrap('polarlicht', s.defs, style, stars + band(200, 'a1', 11) + band(300, 'a2', 14) + band(130, 'a3', 17))
}

function gewitter(): string {
  const r = rng(97)
  const s = sky('gewitter', ['#c9ced8', '#aab2c0'], ['#0a0d14', '#141a24'])
  let drops = ''
  for (let i = 0; i < 140; i++) {
    const x = r() * (W + 400)
    drops += `<line x1="${x.toFixed(0)}" y1="-40" x2="${(x - 20).toFixed(0)}" y2="0" class="drop" style="animation-duration:${(0.5 + r() * 0.4).toFixed(2)}s;animation-delay:${(-r() * 2).toFixed(2)}s"/>`
  }
  const blitz = (x: number, d: number) =>
    `<polyline class="blitz" style="animation-delay:${d}s" points="${x},0 ${x - 30},160 ${x + 10},170 ${x - 40},360 ${x + 5},370 ${x - 60},560" />`
  const style = s.style +
    `.drop{stroke:#6c7a8c;stroke-width:1.4;opacity:.5;animation:rain linear infinite}@keyframes rain{from{transform:translate(0,0)}to{transform:translate(-200px,${H + 80}px)}}` +
    `.flash{fill:#ffffff;opacity:0;animation:flash 9s infinite}.flash2{animation-delay:5.5s}@keyframes flash{0%,88%,92%,96%,100%{opacity:0}89%{opacity:.35}94%{opacity:.18}}` +
    `.blitz{fill:none;stroke:#fff6c8;stroke-width:4;stroke-linejoin:round;opacity:0;animation:bl 9s infinite;filter:drop-shadow(0 0 8px #fff6c8)}@keyframes bl{0%,88%,93%,100%{opacity:0}89%,91%{opacity:1}}` +
    `@media (prefers-color-scheme: dark){.drop{stroke:#55657a}}`
  return wrap('gewitter', s.defs, style, drops + blitz(260, 0) + blitz(1380, 5.5) + `<rect width="${W}" height="${H}" class="flash"/><rect width="${W}" height="${H}" class="flash flash2"/>`)
}

function strand(): string {
  const r = rng(101)
  const s = sky('strand', ['#bfe6f2', '#f6dfb4'], ['#0d1630', '#2a1f3a'])
  const sonne = `<circle cx="1360" cy="210" r="90" class="sonne"/>`
  const wolke = (y: number, d: number, sc: number) =>
    `<g class="wolke" style="animation-duration:${d}s;animation-delay:${(-r() * d).toFixed(1)}s"><g transform="translate(0 ${y}) scale(${sc})"><ellipse cx="0" cy="0" rx="90" ry="28" class="wk"/><ellipse cx="50" cy="-18" rx="60" ry="30" class="wk"/><ellipse cx="-45" cy="-10" rx="50" ry="24" class="wk"/></g></g>`
  const welle = (y: number, cls: string, dur: number) =>
    `<g class="wave" style="animation-duration:${dur}s"><path class="${cls}" d="M0 ${y} ${Array.from({ length: 9 }, (_, i) => `Q ${i * 400 + 100} ${y - 18} ${i * 400 + 200} ${y} T ${i * 400 + 400} ${y}`).join(' ')} L 3600 ${H} L 0 ${H} Z"/></g>`
  const sand = `<path d="M0 930 C400 900 900 950 1600 915 L1600 1000 L0 1000 Z" class="sand"/>`
  const style = s.style +
    `.sonne{fill:#ffd36a;opacity:.85;animation:glow 6s ease-in-out infinite alternate}@keyframes glow{from{opacity:.7}to{opacity:.95}}` +
    `.wk{fill:#ffffff;opacity:.75}.wolke{animation:zieh linear infinite}@keyframes zieh{from{transform:translateX(-300px)}to{transform:translateX(1900px)}}` +
    `.wave{animation:wave linear infinite}@keyframes wave{from{transform:translateX(0)}to{transform:translateX(-800px)}}` +
    `.w1{fill:#5fc3d8;opacity:.55}.w2{fill:#2f9fc0;opacity:.5}.sand{fill:#ecd29c}` +
    `@media (prefers-color-scheme: dark){.sonne{fill:#f2e6c0;opacity:.7}.wk{fill:#3a3a5a;opacity:.6}.w1{fill:#1d3f5c}.w2{fill:#16304a}.sand{fill:#3a2f2a}}`
  return wrap('strand', s.defs, style, sonne + wolke(140, 70, 1) + wolke(260, 95, 0.7) + wolke(90, 120, 1.3) + welle(860, 'w1', 16) + welle(890, 'w2', 11) + sand)
}

function unterwasser(): string {
  const r = rng(107)
  const s = sky('unterwasser', ['#9fd6e2', '#3f8ea8'], ['#062030', '#020c14'])
  let strahlen = ''
  for (let i = 0; i < 6; i++) {
    const x = 200 + i * 260 + r() * 80
    strahlen += `<polygon class="strahl" style="animation-delay:${(-r() * 8).toFixed(1)}s" points="${x},-20 ${x + 60},-20 ${x + 260},${H} ${x + 120},${H}"/>`
  }
  const fisch = (y: number, d: number, sc: number, links: boolean) =>
    `<g class="${links ? 'schwimmL' : 'schwimmR'}" style="animation-duration:${d}s;animation-delay:${(-r() * d).toFixed(1)}s"><g transform="translate(0 ${y}) scale(${links ? -sc : sc} ${sc})"><path class="fisch" d="M0 0 C20 -16 50 -16 66 0 C50 16 20 16 0 0 Z M0 0 L-18 -12 L-18 12 Z"/><circle cx="52" cy="-3" r="2.5" class="auge"/></g></g>`
  let blasen = ''
  for (let i = 0; i < 30; i++) {
    const x = r() < 0.5 ? r() * 420 : W - r() * 420
    blasen += `<circle cx="${x.toFixed(0)}" cy="${H + 20}" r="${(2 + r() * 6).toFixed(0)}" class="bub" style="animation-duration:${(7 + r() * 9).toFixed(1)}s;animation-delay:${(-r() * 16).toFixed(1)}s"/>`
  }
  let fische = ''
  for (let i = 0; i < 7; i++) fische += fisch(200 + r() * 650, 30 + r() * 30, 0.6 + r() * 0.8, r() < 0.5)
  const style = s.style +
    `.strahl{fill:#ffffff;opacity:.08;animation:schimmer 8s ease-in-out infinite alternate}@keyframes schimmer{from{opacity:.03}to{opacity:.12}}` +
    `.fisch{fill:#e88a3a;opacity:.85}.auge{fill:#1a1a1a}` +
    `.schwimmR{animation:sr linear infinite}@keyframes sr{from{transform:translateX(-200px)}to{transform:translateX(1800px)}}` +
    `.schwimmL{animation:sl linear infinite}@keyframes sl{from{transform:translateX(1800px)}to{transform:translateX(-200px)}}` +
    `.bub{fill:none;stroke:#d8f4ff;stroke-width:2;opacity:.6;animation:rise linear infinite}@keyframes rise{from{transform:translateY(0)}to{transform:translateY(-${H + 80}px)}}` +
    `@media (prefers-color-scheme: dark){.fisch{fill:#c8702e;opacity:.7}.bub{stroke:#7fc8e0}.strahl{fill:#9fdcff}}`
  return wrap('unterwasser', s.defs, style, strahlen + fische + blasen)
}

function wueste(): string {
  const r = rng(113)
  const s = sky('wueste', ['#f7e2b8', '#eab676'], ['#1c1020', '#3a2018'])
  const duenen =
    `<path d="M0 820 C250 740 500 760 760 830 C1000 890 1250 760 1600 800 L1600 1000 L0 1000 Z" class="d1"/>` +
    `<path d="M0 900 C300 850 600 900 900 870 C1200 840 1400 900 1600 880 L1600 1000 L0 1000 Z" class="d2"/>`
  let sand = ''
  for (let i = 0; i < 90; i++) {
    sand += `<circle cx="-20" cy="${(600 + r() * 380).toFixed(0)}" r="${(1 + r() * 1.8).toFixed(1)}" class="korn" style="animation-duration:${(4 + r() * 6).toFixed(1)}s;animation-delay:${(-r() * 10).toFixed(1)}s"/>`
  }
  const kaktus = (x: number, h: number) =>
    `<g transform="translate(${x} ${H - 80})" class="kaktus"><rect x="-10" y="${-h}" width="20" height="${h}" rx="10"/><rect x="-34" y="${-h * 0.7}" width="14" height="${h * 0.35}" rx="7"/><rect x="-34" y="${-h * 0.42}" width="30" height="12" rx="6"/><rect x="20" y="${-h * 0.8}" width="14" height="${h * 0.3}" rx="7"/><rect x="4" y="${-h * 0.56}" width="30" height="12" rx="6"/></g>`
  const style = s.style +
    `.d1{fill:#e2a862}.d2{fill:#cf8c48}.kaktus{fill:#5b7d3a}` +
    `.korn{fill:#f3d7a4;opacity:.7;animation:weh linear infinite}@keyframes weh{from{transform:translate(0,0)}to{transform:translate(${W + 60}px,-40px)}}` +
    `@media (prefers-color-scheme: dark){.d1{fill:#4a2c1e}.d2{fill:#38201a}.kaktus{fill:#253a1e}.korn{fill:#a8805a;opacity:.5}}`
  return wrap('wueste', s.defs, style, duenen + kaktus(170, 170) + kaktus(1440, 140) + sand)
}

function halloween(): string {
  const r = rng(127)
  const s = sky('halloween', ['#e8c6a8', '#c48a6a'], ['#140a1c', '#2a1020'])
  const mond = `<circle cx="1360" cy="180" r="80" class="mond"/>`
  const fledermaus = (y: number, d: number, sc: number) =>
    `<g class="flug" style="animation-duration:${d}s;animation-delay:${(-r() * d).toFixed(1)}s"><g transform="translate(0 ${y}) scale(${sc})"><g class="fluegel" style="animation-duration:${(0.25 + r() * 0.15).toFixed(2)}s"><path class="fm" d="M0 0 C-10 -14 -26 -16 -40 -6 C-30 -6 -26 0 -24 6 C-16 0 -8 2 0 8 C8 2 16 0 24 6 C26 0 30 -6 40 -6 C26 -16 10 -14 0 0 Z"/></g></g></g>`
  let flieger = ''
  for (let i = 0; i < 9; i++) flieger += fledermaus(80 + r() * 420, 18 + r() * 16, 0.6 + r() * 0.7)
  const kuerbis = (x: number, sc: number) =>
    `<g transform="translate(${x} ${H - 40}) scale(${sc})"><ellipse rx="46" ry="36" class="kb"/><ellipse rx="22" ry="36" class="kb2"/><rect x="-5" y="-48" width="10" height="16" rx="3" class="stiel"/>` +
    `<path d="M-24 -6 L-12 -18 L-4 -6 Z M24 -6 L12 -18 L4 -6 Z M-22 10 L-12 18 L-4 12 L4 18 L12 12 L22 10 L12 24 L-12 24 Z" class="gesicht"/></g>`
  const leaf = (i: number) => `<path class="bit l${i % 3}" d="M0 -14 C10 -10 11 3 0 14 C-11 3 -10 -10 0 -14 Z"/>`
  const style = s.style + FALL_STYLE +
    `.mond{fill:#f3e3b0;opacity:.85}.fm{fill:#2a1a2a}.flug{animation:fliegen linear infinite}@keyframes fliegen{from{transform:translate(-120px,0)}50%{transform:translate(800px,40px)}to{transform:translate(1760px,-20px)}}` +
    `.fluegel{transform-box:fill-box;transform-origin:center;animation:flatter ease-in-out infinite alternate}@keyframes flatter{from{transform:scaleY(1)}to{transform:scaleY(.35)}}` +
    `.kb{fill:#e2741e}.kb2{fill:#c95e14}.stiel{fill:#5a6a2a}.gesicht{fill:#ffd36a;animation:flacker 1.4s ease-in-out infinite alternate}@keyframes flacker{from{opacity:.7}to{opacity:1}}` +
    `.l0{fill:#d9622b}.l1{fill:#7a3a8a}.l2{fill:#b8461f}.bit{opacity:.85}` +
    `@media (prefers-color-scheme: dark){.fm{fill:#06040a}.mond{fill:#f0d890}}`
  return wrap('halloween', s.defs, style, mond + flieger + kuerbis(160, 1.2) + kuerbis(270, 0.8) + kuerbis(1450, 1) + fallers(r, 26, leaf, 'fall', 12, 22))
}

function weihnachten(): string {
  const r = rng(131)
  const s = sky('weihnachten', ['#dfe8f2', '#c6d4e6'], ['#0a1222', '#142038'])
  const flake = () => `<circle class="bit flake" r="${(2.5 + r() * 4).toFixed(1)}"/>`
  const farben = ['#e2483a', '#f2c23a', '#3fae5a', '#3a8ae2']
  let lichter = `<path d="M-20 40 Q 200 110 400 50 T 800 50 T 1200 50 T 1620 40" class="kabel"/>`
  for (let i = 0; i < 26; i++) {
    const x = i * 64
    const y = 50 + Math.sin((x / 400) * Math.PI) * 30 + 12
    lichter += `<circle cx="${x}" cy="${y.toFixed(0)}" r="7" fill="${farben[i % 4]}" class="licht" style="animation-delay:${(-(i % 4) * 0.6).toFixed(1)}s"/>`
  }
  const baum = (x: number, h: number) =>
    `<g transform="translate(${x} ${H})"><path class="tanne" d="M0 ${-h} L${h * 0.32} ${-h * 0.5} L${h * 0.16} ${-h * 0.5} L${h * 0.4} ${-h * 0.12} L${-h * 0.4} ${-h * 0.12} L${-h * 0.16} ${-h * 0.5} L${-h * 0.32} ${-h * 0.5} Z"/><rect x="-10" y="${-h * 0.12}" width="20" height="${h * 0.12}" class="stamm"/><circle cy="${-h - 6}" r="9" class="stern"/></g>`
  const ground = `<path d="M0 930 C300 905 700 945 1100 920 C1300 910 1450 930 1600 920 L1600 1000 L0 1000 Z" class="snowg"/>`
  const style = s.style + FALL_STYLE +
    `.flake{fill:#ffffff;stroke:#b9c8da;stroke-width:1;opacity:.95}.snowg{fill:#ffffff;opacity:.85}` +
    `.kabel{fill:none;stroke:#2a3a2a;stroke-width:2}.licht{animation:blink 2.4s ease-in-out infinite alternate;filter:drop-shadow(0 0 6px currentColor)}@keyframes blink{from{opacity:.35}to{opacity:1}}` +
    `.tanne{fill:#2f6a3a}.stamm{fill:#5a3a22}.stern{fill:#f2c23a;animation:blink 1.6s ease-in-out infinite alternate}` +
    `@media (prefers-color-scheme: dark){.flake{fill:#e2ecf8;stroke:none;opacity:.85}.snowg{fill:#22324a;opacity:.95}.tanne{fill:#183a22}.kabel{stroke:#0a0f0a}}`
  return wrap('weihnachten', s.defs, style, lichter + baum(170, 300) + baum(1450, 260) + ground + fallers(r, 60, flake, 'fall', 14, 28))
}

export const SCENES: Record<string, string> = {
  herbst: herbst(),
  sakura: sakura(),
  mitternacht: mitternacht(),
  ozean: ozean(),
  wald: wald(),
  herbstnacht: herbst(true),
  schnee: schnee(),
  regen: regen(),
  lagerfeuer: lagerfeuer(),
  polarlicht: polarlicht(),
  gewitter: gewitter(),
  strand: strand(),
  unterwasser: unterwasser(),
  wueste: wueste(),
  halloween: halloween(),
  weihnachten: weihnachten(),
}

export const SCENE_ALT: Record<string, string> = {
  herbst: 'Herbstblätter fallen über sanfte Hügel',
  sakura: 'Kirschblüten fallen von einem blühenden Zweig',
  mitternacht: 'Funkelnde Sterne, Mondsichel und eine Sternschnuppe',
  ozean: 'Wellen ziehen vorbei, Luftblasen steigen auf',
  wald: 'Tannen am Rand, Glühwürmchen leuchten',
  herbstnacht: 'Dunkle Herbstblätter fallen unter Mond und Sternen',
  schnee: 'Schneeflocken fallen auf eine Schneedecke',
  regen: 'Regen fällt schräg, unten bilden sich Pfützenringe',
  lagerfeuer: 'Zwei Lagerfeuer flackern, Funken steigen auf',
  polarlicht: 'Grüne und violette Polarlichter wogen über einem Sternenhimmel',
  gewitter: 'Starkregen, Blitze zucken, der Himmel leuchtet kurz auf',
  strand: 'Sonne, ziehende Wolken und Wellen am Sandstrand',
  unterwasser: 'Lichtstrahlen im Wasser, Fische schwimmen vorbei, Blasen steigen auf',
  wueste: 'Sanddünen, Kakteen und vorbeiwehende Sandkörner',
  halloween: 'Fledermäuse vor dem Mond, leuchtende Kürbisse, fallende Blätter',
  weihnachten: 'Lichterkette, Tannen mit Stern und fallender Schnee',
}
