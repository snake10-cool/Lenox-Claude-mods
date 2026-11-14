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
      `<g transform="translate(${x.toFixed(0)} -60)"><g class="${cls}" style="animation-duration:${dur}s;animation-delay:${delay}s">` +
      `<g class="sway" style="animation-duration:${(3 + r() * 3).toFixed(1)}s;animation-delay:${delay}s"><g transform="scale(${scale})">${shape(i)}</g></g></g></g>`
  }
  return out
}

const FALL_STYLE =
  `.fall{animation:fall linear infinite}` +
  `@keyframes fall{from{transform:translateY(0)}to{transform:translateY(${H + 140}px)}}` +
  `.sway{animation:sway ease-in-out infinite alternate}` +
  `@keyframes sway{from{transform:translateX(-30px) rotate(-35deg)}to{transform:translateX(30px) rotate(40deg)}}`

function herbst(): string {
  const r = rng(7)
  const s = sky('herbst', ['#f6e4c8', '#e9c9a0'], ['#2a1c12', '#1a120c'])
  const colors = ['#d9622b', '#e0912f', '#b8461f', '#c97a1e', '#a5381c']
  const leaf = (i: number) =>
    `<path d="M0 -18 C12 -12 14 4 0 18 C-14 4 -12 -12 0 -18 Z M0 -18 L0 18" fill="${colors[i % colors.length]}" stroke="#7a3412" stroke-width="1" opacity="0.85"/>`
  const hills =
    `<path d="M0 880 C300 820 520 900 800 870 C1100 840 1300 900 1600 860 L1600 1000 L0 1000 Z" class="hill"/>` +
    `<ellipse cx="180" cy="905" rx="190" ry="34" fill="#d06a2a" opacity="0.55"/><ellipse cx="1420" cy="910" rx="220" ry="36" fill="#c4581f" opacity="0.5"/>`
  return wrap('herbst', s.defs, s.style + FALL_STYLE + `.hill{fill:#d9a46c;opacity:.55}@media (prefers-color-scheme: dark){.hill{fill:#3a2414;opacity:.8}}`, hills + fallers(r, 34, leaf, 'fall', 11, 22))
}

function sakura(): string {
  const r = rng(11)
  const s = sky('sakura', ['#fbe6ee', '#f3cddb'], ['#2a1620', '#170c12'])
  const petal = (i: number) =>
    `<path d="M0 -10 C8 -10 10 0 0 10 C-10 0 -8 -10 0 -10 Z" fill="${i % 3 === 0 ? '#f7a8c4' : i % 3 === 1 ? '#f4bfd3' : '#ec8fb2'}" opacity="0.9"/>`
  const branch =
    `<path d="M-20 140 C140 120 260 60 420 70 M200 108 C240 60 300 40 360 30" stroke="#5a3a3f" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.75"/>` +
    Array.from({ length: 16 }, (_, i) => `<circle cx="${(40 + i * 24 + r() * 20).toFixed(0)}" cy="${(70 + r() * 70).toFixed(0)}" r="${(10 + r() * 12).toFixed(0)}" fill="#f2a3c0" opacity="0.7"/>`).join('')
  return wrap('sakura', s.defs, s.style + FALL_STYLE, branch + fallers(r, 40, petal, 'fall', 13, 26))
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
    flies += `<circle cx="${x.toFixed(0)}" cy="${(450 + r() * 480).toFixed(0)}" r="${(2 + r() * 2.5).toFixed(1)}" class="fly" style="animation-duration:${(3 + r() * 4).toFixed(1)}s;animation-delay:${(-r() * 7).toFixed(1)}s"/>`
  }
  const style =
    s.style +
    `.p1{fill:#4f7a45;opacity:.55}.p2{fill:#2f5a2c;opacity:.6}` +
    `.fly{fill:#d7c84a;animation:fly ease-in-out infinite alternate}@keyframes fly{from{opacity:.1;transform:translate(0,0)}to{opacity:.95;transform:translate(14px,-22px)}}` +
    `@media (prefers-color-scheme: dark){.p1{fill:#1d3320;opacity:.9}.p2{fill:#14261a;opacity:.95}.fly{fill:#f3e66a}}`
  return wrap('wald', s.defs, style, trees + flies)
}

export const SCENES: Record<string, string> = {
  herbst: herbst(),
  sakura: sakura(),
  mitternacht: mitternacht(),
  ozean: ozean(),
  wald: wald(),
}

export const SCENE_ALT: Record<string, string> = {
  herbst: 'Herbstblätter fallen über sanfte Hügel',
  sakura: 'Kirschblüten fallen von einem blühenden Zweig',
  mitternacht: 'Funkelnde Sterne, Mondsichel und eine Sternschnuppe',
  ozean: 'Wellen ziehen vorbei, Luftblasen steigen auf',
  wald: 'Tannen am Rand, Glühwürmchen leuchten',
}
