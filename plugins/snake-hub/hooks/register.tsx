import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, RenderChildren, ThemeSetArgs } from 'claude-code'

import type { Aktivitaet, Fokus, Fortschritt, HubSettings, Statistik, WetterInfo, Ziel } from '../types'
import { makeColors } from './make-colors.js'
import { SCENE_ALT, SCENES } from './scenes'
import { THEME_SEEDS } from './themes'

// ---------- Kataloge ----------

const MODS: { id: string; name: string }[] = [
  { id: 'szenen', name: '🎞️ Animierter Hintergrund' },
  { id: 'desktop', name: '🖥️ Auch auf dem ganzen PC (Snake-Desktop)' },
  { id: 'tageszeit', name: '🌗 Theme nach Tageszeit (nachts dunkler)' },
  { id: 'wetter', name: '🌦️ Theme nach Wetter (Regen, Schnee)' },
  { id: 'saison', name: '🎃 Saison-Themes (Halloween, Weihnachten)' },
  { id: 'fokus', name: '🍅 Fokus-Timer' },
  { id: 'ziele', name: '🎯 Tagesziele' },
  { id: 'notizen', name: '📝 Notizblock' },
  { id: 'erfolge', name: '🏆 Erfolge' },
  { id: 'sound', name: '🔔 Sanfte Sounds' },
  { id: 'fortschritt', name: '📊 Fortschrittsbalken' },
  { id: 'leiste', name: '▶️ Leiste über dem Eingabefeld' },
  { id: 'aktivitaet', name: '📜 Aktivitäts-Feed' },
  { id: 'statistik', name: '📈 Statistik' },
  { id: 'knoepfe', name: '🎛️ Schnellknöpfe' },
  { id: 'uhr', name: '🕒 Sitzungs-Uhr' },
  { id: 'pause', name: '☕ Pausen-Erinnerung' },
  { id: 'schutz', name: '🛡️ Datei-Schutz' },
  { id: 'fertig', name: '✅ Fertig-Meldung' },
]

const SKILLS: { id: string; name: string; context: string }[] = [
  { id: 'spiel-bauen', name: '🎮 Spiel bauen', context: 'Skill „snake-skills:spiel-bauen“ ist AN: Wenn der Nutzer ein Spiel bauen will, lade diesen Skill und folge ihm.' },
  { id: 'bug-jagd', name: '🐞 Bug-Jagd', context: 'Skill „snake-skills:bug-jagd“ ist AN: Bei Fehlern, Abstürzen oder „geht nicht“ lade diesen Skill und folge ihm.' },
  { id: 'flutter-release', name: '📱 Flutter-Release', context: 'Skill „snake-skills:flutter-release“ ist AN: Bei Play-Store-Veröffentlichung oder Release-Version lade diesen Skill und folge ihm.' },
  { id: 'einfach-erklaert', name: '🧠 Einfach erklärt', context: 'Skill „snake-skills:einfach-erklaert“ ist AN: Wenn der Nutzer etwas verstehen will, lade diesen Skill und folge ihm.' },
  { id: 'game-guide', name: '🕹️ Game-Guide', context: 'Skill „snake-skills:game-guide“ ist AN: Bei Fragen zu Videospielen, Achievements oder Spieltipps lade diesen Skill und folge ihm.' },
  { id: 'ordner-aufraeumen', name: '🗂️ Ordner aufräumen', context: 'Skill „snake-skills:ordner-aufraeumen“ ist AN: Wenn der Nutzer Desktop oder Ordner aufräumen will, lade diesen Skill und folge ihm.' },
  { id: 'kurz-knapp', name: '✂️ Kurz & knapp', context: 'Modus „Kurz & knapp“ ist AN: Antworte so kurz wie möglich, ohne Einleitung und Wiederholungen.' },
  { id: 'deutsch-immer', name: '🇩🇪 Immer Deutsch', context: 'Modus „Immer Deutsch“ ist AN: Antworte immer auf Deutsch und schreibe Code-Kommentare auf Deutsch.' },
]

const KNOEPFE: { label: string; prompt: string }[] = [
  { label: '✨ Mehr Details', prompt: 'Füge dem aktuellen Projekt mehr Details hinzu, die gut dazu passen (Grafik, Effekte, Inhalte).' },
  { label: '🎮 Neues Level', prompt: 'Füge dem aktuellen Spiel ein neues, passendes Level oder einen neuen Abschnitt hinzu.' },
  { label: '🐞 Bugs suchen', prompt: 'Suche im aktuellen Projekt nach Fehlern und behebe sie.' },
  { label: '💡 Ideen', prompt: 'Schlage mir 5 kurze Ideen vor, was ich am aktuellen Projekt als Nächstes verbessern könnte.' },
]

const MODI: { id: string; name: string }[] = [
  { id: 'dunkel', name: '🌑 Dunkel' },
  { id: 'hell', name: '☀️ Hell' },
  { id: 'auto', name: '🖥️ Wie Windows' },
]

const STAERKEN: { id: string; name: string; glass: { blur: number; opacity: number } }[] = [
  { id: 'dezent', name: '🌫️ Dezent', glass: { blur: 10, opacity: 0.5 } },
  { id: 'normal', name: '🍂 Normal', glass: { blur: 4, opacity: 0.28 } },
  { id: 'kraeftig', name: '🍁 Kräftig', glass: { blur: 0, opacity: 0.1 } },
]

const GERAEUSCHE: { id: string; name: string }[] = [
  { id: 'aus', name: '🔇 Aus' },
  { id: 'regen', name: '🌧️ Regen' },
  { id: 'feuer', name: '🔥 Kaminfeuer' },
  { id: 'wind', name: '🍃 Wind' },
]

const GROESSEN = [{ id: 'klein', name: 'Klein' }, { id: 'mittel', name: 'Mittel' }, { id: 'gross', name: 'Groß' }]
const MENGEN = [{ id: 'wenig', name: 'Wenig' }, { id: 'normal', name: 'Normal' }, { id: 'viel', name: 'Viel' }]

const APP_EFFEKTE: { id: string; name: string }[] = [
  { id: 'theme', name: '🍂 Theme' }, { id: 'matrix', name: '💚 Matrix' }, { id: 'glitch', name: '📺 Glitch' },
  { id: 'pixel', name: '🟪 Pixel' }, { id: 'bloecke', name: '🟫 Blöcke' }, { id: 'raster', name: '📐 Raster' },
  { id: 'funkeln', name: '✨ Funkeln' }, { id: 'heu', name: '🧵 Heu' }, { id: 'kasse', name: '🪙 Münzen' },
  { id: 'weltraum', name: '🚀 Weltraum' }, { id: 'formen', name: '🔷 Formen' }, { id: 'traenen', name: '💧 Tropfen' },
  { id: 'aus', name: '⭕ Nichts' },
]

const ERFOLGE: { id: string; name: string; info: string }[] = [
  { id: 'erster', name: '🌱 Erster Auftrag', info: 'Den ersten Auftrag an Claude geschickt' },
  { id: 'zehn', name: '🔟 Zehn Aufträge', info: '10 Aufträge insgesamt' },
  { id: 'hundert', name: '💯 Hundert Aufträge', info: '100 Aufträge insgesamt' },
  { id: 'nachteule', name: '🦉 Nachteule', info: 'Zwischen 0 und 4 Uhr gearbeitet' },
  { id: 'frueh', name: '🐓 Frühaufsteher', info: 'Vor 7 Uhr gearbeitet' },
  { id: 'themes5', name: '🎨 Stilwechsler', info: '5 verschiedene Themes gesehen' },
  { id: 'themesAlle', name: '🌈 Alle Welten', info: 'Alle Themes gesehen' },
  { id: 'fokus1', name: '🍅 Erste Fokus-Runde', info: 'Eine Fokus-Runde durchgezogen' },
  { id: 'fokus10', name: '🧘 Fokus-Profi', info: '10 Fokus-Runden insgesamt' },
  { id: 'ziele', name: '🎯 Alles erledigt', info: 'Mindestens 3 Tagesziele an einem Tag geschafft' },
  { id: 'notiz', name: '📝 Gedankenstütze', info: 'Die erste Notiz geschrieben' },
]

const DEFAULTS: HubSettings = {
  theme: 'herbst',
  modus: 'dunkel',
  staerke: 'normal',
  kompakt: false,
  ambient: 'aus',
  desk: { groesse: 'mittel', menge: 'normal', wind: true, sammeln: true, autopause: true, kontext: true, regeln: {} },
  mods: { szenen: true, desktop: true, tageszeit: false, wetter: false, saison: true, fokus: true, ziele: true, notizen: true, erfolge: true, sound: false, fortschritt: true, leiste: true, aktivitaet: true, statistik: true, knoepfe: true, uhr: false, pause: false, schutz: true, fertig: true },
  skills: { 'spiel-bauen': true, 'bug-jagd': true, 'flutter-release': true, 'einfach-erklaert': true, 'game-guide': true, 'ordner-aufraeumen': true, 'kurz-knapp': false, 'deutsch-immer': true },
}

// ---------- Themes ----------

const PALETTES: Record<string, ThemeSetArgs['colors']> = {}
for (const [id, s] of Object.entries(THEME_SEEDS)) {
  PALETTES[id] = makeColors({ label: s.name, roles: s.roles, light: { gray: { anchors: s.light } }, dark: { gray: { anchors: s.dark } } }).theme
}

// ---------- Zustand ----------

const VERSION = '0.9.0'
const MARKETPLACE_URL = 'https://raw.githubusercontent.com/snake10-cool/Lenox-Claude-mods/main/.claude-plugin/marketplace.json'
const PANE = 'snake-hub'
const TITEL = '🐍 Snake-Hub'
const TOOL_ID = 'mcp__snake-hub__fortschritt'
const PAUSE_MS = 45 * 60 * 1000
const SCHUTZ = /(^|[\\/])(\.env(\..*)?|key\.properties|.*\.jks|.*\.keystore|.*\.pem|id_rsa.*)$/i

const LEER: Fortschritt = { prozent: 0, aufgabe: '', schritt: '', laeuft: false, manuell: false }
const fortschritt = atom({ plugin: 'snake-hub', key: 'fortschritt' } as const, LEER, { shape: 'fortschritt-2' })
const settings = atom({ plugin: 'snake-hub', key: 'settings' } as const, DEFAULTS, { shape: 'settings-4' })
const aktivitaet = atom({ plugin: 'snake-hub', key: 'aktivitaet' } as const, [] as Aktivitaet[], { shape: 'aktivitaet-1' })
const tab = atom({ plugin: 'snake-hub', key: 'tab' } as const, 'start', { shape: 'tab-1' })
const fokus = atom({ plugin: 'snake-hub', key: 'fokus' } as const, { phase: 'aus', ende: 0, rest: 0, runden: 0 } as Fokus, { shape: 'fokus-1' })
const notizen = atom({ plugin: 'snake-hub', key: 'notizen' } as const, [] as string[], { shape: 'notizen-1' })
const ziele = atom({ plugin: 'snake-hub', key: 'ziele' } as const, [] as Ziel[], { shape: 'ziele-1' })
const erfolge = atom({ plugin: 'snake-hub', key: 'erfolge' } as const, [] as string[], { shape: 'erfolge-1' })
const wetterInfo = atom({ plugin: 'snake-hub', key: 'wetter' } as const, { ort: '', temp: null, code: null } as WetterInfo, { shape: 'wetter-1' })
const uhrzeit = atom({ plugin: 'snake-hub', key: 'uhrzeit' } as const, 0, { shape: 'uhrzeit-1' })
const statistik = atom({ plugin: 'snake-hub', key: 'statistik' } as const, { antworten: 0, werkzeuge: 0, dateien: [], start: 0 } as Statistik, { shape: 'statistik-1' })

let uhrTimer: { cancel: () => void } | undefined
let tickTimer: { cancel: () => void } | undefined
let fokusTimer: { cancel: () => void } | undefined
let ambientStopp: { abort: () => void } | undefined
let autoTimer: { cancel: () => void } | undefined
let wetterLage: 'regen' | 'schnee' | 'klar' | undefined
let letztesEff = ''
let neueVersion: string | undefined

function neuer(a: string, b: string): boolean {
  const x = a.split('.').map(Number), y = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) > (y[i] ?? 0)
  }
  return false
}

async function updatePruefen($: EngineInterface): Promise<void> {
  const res = await $.http.fetch(MARKETPLACE_URL)
  if (!res.ok) return
  const eintrag = (JSON.parse(res.text) as { plugins?: { name: string; version?: string }[] }).plugins?.find(p => p.name === 'snake-hub')
  if (eintrag?.version !== undefined && neuer(eintrag.version, VERSION)) {
    neueVersion = eintrag.version
    $.ui.toast(`🐍 Snake-Hub ${eintrag.version} ist da. Tipp /hub-update für die zwei Klicks.`)
  }
}

const UPDATE_TEXT = [
  'So holst du das Update (Desktop-App):',
  '1. Plus neben dem Eingabefeld → Plugins (oder Einstellungen → Deine Plugins)',
  '2. Beim Marketplace lenox-claude-mods auf „Synchronisieren“',
  '3. Bei Snake hub auf „Aktualisieren“, dann eine neue Sitzung starten',
  'Tipp: Wenn die App beim Marketplace „Automatisch aktualisieren“ anbietet, schalte es ein, dann entfällt Schritt 2 und 3.',
].join('\n')

type Ort = { name: string; lat: number; lon: number }

// Was gerade wirklich angezeigt wird: gewähltes Theme, ggf. ersetzt durch Wetter oder Nacht.
function effektiv(s: HubSettings, d: Date): { id: string; grund: string } {
  const stunde = d.getHours()
  if (s.theme === 'aus' || PALETTES[s.theme] === undefined) {
    return { id: s.theme, grund: '' }
  }
  if (s.mods.wetter && wetterLage === 'regen') {
    return { id: 'regen', grund: 'wegen Regen' }
  }
  if (s.mods.wetter && wetterLage === 'schnee') {
    return { id: 'schnee', grund: 'wegen Schnee' }
  }
  const monat = d.getMonth() + 1
  const tag = d.getDate()
  if (s.mods.saison && ((monat === 10 && tag >= 24) || (monat === 11 && tag <= 2))) {
    return { id: 'halloween', grund: 'Halloween-Zeit' }
  }
  if (s.mods.saison && monat === 12 && tag <= 26) {
    return { id: 'weihnachten', grund: 'Weihnachtszeit' }
  }
  const nacht = stunde >= 20 || stunde < 6
  if (s.mods.tageszeit && nacht && !['mitternacht', 'herbstnacht', 'lagerfeuer', 'polarlicht', 'gewitter', 'unterwasser', 'halloween'].includes(s.theme)) {
    return { id: s.theme === 'herbst' ? 'herbstnacht' : 'mitternacht', grund: 'weil Nacht ist' }
  }
  return { id: s.theme, grund: '' }
}

async function datum($: EngineInterface): Promise<Date> {
  return new Date(await $.clock.now())
}

async function wetterHolen($: EngineInterface): Promise<void> {
  const ort = (await $.store.get('ort')) as Ort | undefined
  if (ort === undefined) {
    wetterLage = undefined
    return
  }
  const res = await $.http.fetch(`https://api.open-meteo.com/v1/forecast?latitude=${ort.lat}&longitude=${ort.lon}&current=weather_code,temperature_2m`)
  if (!res.ok) {
    return
  }
  const aktuell = (JSON.parse(res.text) as { current?: { weather_code?: number; temperature_2m?: number } }).current
  const code = Number(aktuell?.weather_code ?? 0)
  await update($, wetterInfo, () => ({ ort: ort.name.split(',')[0] ?? ort.name, temp: aktuell?.temperature_2m ?? null, code }))
  wetterLage = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95 ? 'regen' : (code >= 71 && code <= 77) || code === 85 || code === 86 ? 'schnee' : 'klar'
}

async function klang($: EngineInterface, datei: string): Promise<void> {
  const s = await read($, settings)
  if (s.mods.sound) {
    await $.audio.play({ asset: `sounds/${datei}` }, { gain: 0.5 }).catch(() => undefined)
  }
}
function wetterEmoji(code: number | null): string {
  if (code === null) return '🌡️'
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 67 || (code >= 80 && code <= 82)) return '🌧️'
  if (code <= 77 || code === 85 || code === 86) return '❄️'
  return '⛈️'
}

async function erfolg($: EngineInterface, id: string): Promise<void> {
  const s = await read($, settings)
  const liste = await read($, erfolge)
  const e = ERFOLGE.find(x => x.id === id)
  if (!s.mods.erfolge || e === undefined || liste.includes(id)) return
  const neu = [...liste, id]
  await update($, erfolge, () => neu)
  await $.store.set('erfolge', neu)
  $.ui.toast(`🏆 Erfolg: ${e.name} – ${e.info}`)
  void klang($, 'fertig.wav')
}

async function zaehlen($: EngineInterface, key: string, plus = 1): Promise<number> {
  const n = Number((await $.store.get(key)) ?? 0) + plus
  await $.store.set(key, n)
  return n
}

function ambientSetzen($: EngineInterface, art: string): void {
  ambientStopp?.abort()
  ambientStopp = undefined
  if (art === 'aus' || typeof AbortController === 'undefined') return
  const ctl = new AbortController()
  ambientStopp = ctl
  void $.audio.play({ asset: `sounds/ambient-${art}.wav` }, { shouldLoop: true, gain: 0.35, signal: ctl.signal }).catch(() => undefined)
}

async function fokusStarten($: EngineInterface, minuten: number, phase: string): Promise<void> {
  fokusTimer?.cancel()
  const ende = (await $.clock.now()) + minuten * 60000
  await update($, fokus, f => ({ ...f, phase, ende, rest: minuten }))
  fokusTimer = $.clock.every(15000, async () => {
    const jetzt = await $.clock.now()
    const f = await read($, fokus)
    const rest = Math.max(0, Math.ceil((f.ende - jetzt) / 60000))
    if (f.ende - jetzt > 0) {
      await update($, fokus, x => ({ ...x, rest }))
      return
    }
    fokusTimer?.cancel()
    fokusTimer = undefined
    if (f.phase === 'fokus') {
      await update($, fokus, x => ({ ...x, phase: 'aus', rest: 0, runden: x.runden + 1 }))
      const gesamt = await zaehlen($, 'fokusGesamt')
      $.ui.toast('🍅 Fokus-Runde geschafft! Gönn dir 5 Minuten Pause.')
      void klang($, 'fertig.wav')
      void erfolg($, 'fokus1')
      if (gesamt >= 10) void erfolg($, 'fokus10')
    } else {
      await update($, fokus, x => ({ ...x, phase: 'aus', rest: 0 }))
      $.ui.toast('☕ Pause vorbei. Weiter geht’s!')
      void klang($, 'fertig.wav')
    }
  })
}

async function zieleHeute($: EngineInterface): Promise<Ziel[]> {
  const heute = (await datum($)).toDateString()
  if ((await $.store.get('zieleDatum')) !== heute) {
    await $.store.set('zieleDatum', heute)
    await $.store.set('ziele', [])
    return []
  }
  return ((await $.store.get('ziele')) as Ziel[] | undefined) ?? []
}

let pauseTimer: { cancel: () => void } | undefined
let schritte = 0
let letzterKlick = 0

// ---------- Hilfsfunktionen ----------


function kurz(text: string, n: number): string {
  const t = text.replace(/\s+/g, ' ').trim()
  return t.length > n ? `${t.slice(0, n - 1)}…` : t
}

function dateiname(p: unknown): string {
  return String(p ?? '').split(/[\\/]/).pop() ?? ''
}

function beschreibe(tool: string, e: Record<string, unknown>): { icon: string; text: string; datei?: string } {
  switch (tool) {
    case 'Bash': return { icon: '⌨️', text: `Befehl: ${kurz(String(e.command ?? ''), 40)}` }
    case 'Edit': return { icon: '✏️', text: `Bearbeitet ${dateiname(e.file_path)}`, datei: String(e.file_path ?? '') }
    case 'Write': return { icon: '📝', text: `Schreibt ${dateiname(e.file_path)}`, datei: String(e.file_path ?? '') }
    case 'Read': return { icon: '📖', text: `Liest ${dateiname(e.file_path)}` }
    case 'Grep': case 'Glob': return { icon: '🔍', text: 'Durchsucht Dateien' }
    case 'WebSearch': return { icon: '🌐', text: `Websuche: ${kurz(String(e.query ?? ''), 34)}` }
    case 'WebFetch': return { icon: '🌐', text: 'Lädt eine Webseite' }
    case 'Agent': return { icon: '🤖', text: 'Startet einen Helfer' }
    case 'Skill': return { icon: '🧩', text: `Skill: ${String(e.skill ?? '')}` }
    default: return { icon: '🔧', text: tool.replace(/^mcp__[^_]+__/, '') }
  }
}

function merge(saved: unknown): HubSettings {
  const s = (saved ?? {}) as Partial<HubSettings>
  return {
    theme: typeof s.theme === 'string' ? s.theme : DEFAULTS.theme,
    modus: typeof s.modus === 'string' ? s.modus : DEFAULTS.modus,
    staerke: typeof s.staerke === 'string' ? s.staerke : DEFAULTS.staerke,
    kompakt: s.kompakt === true,
    ambient: typeof s.ambient === 'string' ? s.ambient : DEFAULTS.ambient,
    desk: { ...DEFAULTS.desk, ...(s.desk ?? {}) },
    mods: { ...DEFAULTS.mods, ...(s.mods ?? {}) },
    skills: { ...DEFAULTS.skills, ...(s.skills ?? {}) },
  }
}

async function desktopSync($: EngineInterface, s: HubSettings, theme: string): Promise<void> {
  const home = (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME'))
  if (home === undefined) {
    return
  }
  const pfad = `${home}/.snake-hub/desktop.json`
  let alt: Record<string, unknown> = {}
  try {
    alt = JSON.parse(String(await $.fs.read(pfad))) as Record<string, unknown>
  } catch {
    alt = {}
  }
  const daten = { ...alt, an: s.mods.desktop === true && SCENES[theme] !== undefined, theme, modus: s.modus, staerke: s.staerke, ...s.desk }
  await $.fs.write(pfad, JSON.stringify(daten, null, 2))
}

async function applyTheme($: EngineInterface, s: HubSettings): Promise<string> {
  const eff = effektiv(s, await datum($))
  void desktopSync($, s, eff.id).catch(() => undefined)
  if (letztesEff !== '' && letztesEff !== eff.id) {
    void klang($, 'rascheln.wav')
  }
  letztesEff = eff.id
  if (PALETTES[eff.id] !== undefined) {
    const gesehen = ((await $.store.get('themesGesehen')) as string[] | undefined) ?? []
    if (!gesehen.includes(eff.id)) {
      const neu = [...gesehen, eff.id]
      await $.store.set('themesGesehen', neu)
      if (neu.length >= 5) void erfolg($, 'themes5')
      if (neu.length >= Object.keys(PALETTES).length) void erfolg($, 'themesAlle')
    }
  }
  const colors = PALETTES[eff.id]
  if (colors === undefined) {
    await $.theme.clear()
    return 'Theme aus (Standard-Aussehen der App)'
  }
  const glass = (STAERKEN.find(x => x.id === s.staerke) ?? STAERKEN[1])?.glass ?? { blur: 3, opacity: 0.4 }
  const scheme = s.modus === 'dunkel' ? { overrideColorScheme: 'dark' as const } : s.modus === 'hell' ? { overrideColorScheme: 'light' as const } : {}
  const look: ThemeSetArgs = s.mods.szenen && SCENES[eff.id] !== undefined
    ? { colors, backdrop: { scene: eff.id, glass }, ...scheme }
    : { colors, ...scheme }
  const set = await $.theme.set(look)
  const t = THEME_SEEDS[eff.id]
  const name = `${t?.emoji ?? ''} ${t?.name ?? eff.id}${eff.grund ? ` (${eff.grund})` : ''}`
  return set.isDrawn ? `Theme: ${name}` : `Theme: ${name} (wird gezeichnet, sobald die Desktop- oder Handy-App angeschlossen ist)`
}

function applyTimers($: EngineInterface, s: HubSettings): void {
  uhrTimer?.cancel()
  pauseTimer?.cancel()
  autoTimer?.cancel()
  autoTimer = undefined
  if (s.mods.tageszeit || s.mods.wetter) {
    const pruefen = async () => {
      const x = await read($, settings)
      if (x.mods.wetter) {
        await wetterHolen($).catch(() => undefined)
      }
      if (effektiv(x, await datum($)).id !== letztesEff) {
        await applyTheme($, x)
      }
    }
    void pruefen()
    autoTimer = $.clock.every(10 * 60 * 1000, pruefen)
  }
  uhrTimer = undefined
  pauseTimer = undefined
  tickTimer?.cancel()
  tickTimer = $.clock.every(30000, async () => {
    await update($, uhrzeit, () => Date.now())
  })
  if (s.mods.uhr) {
    const tick = async () => {
      const now = await $.clock.now()
      const st = await read($, statistik)
      const min = Math.floor((now - st.start) / 60000)
      const zeit = new Date(now).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
      $.ui.status(`🕒 ${zeit} · Sitzung ${min} min`)
    }
    void tick()
    uhrTimer = $.clock.every(30000, tick)
  } else {
    $.ui.status(undefined)
  }
  if (s.mods.pause) {
    pauseTimer = $.clock.every(PAUSE_MS, () => $.ui.toast('☕ Du bist seit 45 Minuten dran. Zeit für eine kurze Pause!'))
  }
}

async function save($: EngineInterface, fn: (s: HubSettings) => HubSettings): Promise<HubSettings> {
  let next = DEFAULTS
  await update($, settings, s => (next = fn(s)))
  await $.store.set('settings', next)
  return next
}

async function sende($: EngineInterface, text: string): Promise<void> {
  const now = await $.clock.now()
  if (now - letzterKlick < 2000) {
    return
  }
  letzterKlick = now
  void $.prompt.submit({ text })
}

// ---------- Mod ----------

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const start = await $.clock.now()
    await update($, statistik, () => ({ antworten: 0, werkzeuge: 0, dateien: [], start }))
    const s = merge(await $.store.get('settings'))
    await update($, settings, () => s)
    const gespeicherteNotizen = ((await $.store.get('notizen')) as string[] | undefined) ?? []
    await update($, notizen, () => gespeicherteNotizen)
    const heutigeZiele = await zieleHeute($)
    await update($, ziele, () => heutigeZiele)
    const meineErfolge = ((await $.store.get('erfolge')) as string[] | undefined) ?? []
    await update($, erfolge, () => meineErfolge)
    await update($, uhrzeit, () => start)
    await applyTheme($, s)
    applyTimers($, s)
    ambientSetzen($, s.ambient)

    await $.command.register({ name: 'hub', description: 'Öffnet den Snake-Hub und zeigt, was an und aus ist' })
    await $.command.register({ name: 'look', description: 'Theme wechseln: herbst, herbstnacht, sakura, mitternacht, ozean, wald, schnee, regen, lagerfeuer, polarlicht, gewitter, strand, unterwasser, wueste, halloween, weihnachten oder aus' })
    await $.command.register({ name: 'fokus', description: 'Fokus-Timer starten: /fokus (25 min), /fokus 50, /fokus pause, /fokus stopp' })
    await $.command.register({ name: 'notiz', description: 'Notiz in den Snake-Hub schreiben: /notiz Text' })
    await $.command.register({ name: 'ziel', description: 'Tagesziel hinzufügen: /ziel Text' })
    await $.command.register({ name: 'erfolge', description: 'Zeigt deine Snake-Hub-Erfolge' })
    await $.command.register({ name: 'geraeusch', description: 'Umgebungsgeräusch: regen, feuer, wind oder aus' })
    await $.command.register({ name: 'hub-update', description: 'Zeigt, ob es ein Snake-Hub-Update gibt und wie man es holt' })
    await $.command.register({ name: 'wetter', description: 'Ort fürs Wetter-Theme setzen, z. B. /wetter Braunau am Inn' })
    await $.command.register({ name: 'modus', description: 'Hell oder dunkel: dunkel, hell oder auto' })
    await $.command.register({ name: 'blaetter', description: 'Wie stark der Hintergrund zu sehen ist: dezent, normal oder kraeftig' })
    await $.command.register({ name: 'mod', description: 'Mod an/aus: szenen, desktop, tageszeit, wetter, saison, fokus, ziele, notizen, erfolge, sound, fortschritt, leiste, aktivitaet, statistik, knoepfe, uhr, pause, schutz, fertig' })
    await $.command.register({ name: 'skill', description: 'Skill an/aus: spiel-bauen, bug-jagd, flutter-release, einfach-erklaert, game-guide, ordner-aufraeumen, kurz-knapp, deutsch-immer' })
    await $.command.register({ name: 'mehr-details', description: 'Claude fügt dem Projekt mehr passende Details hinzu' })
    await $.tool.register({
      name: 'fortschritt',
      description:
        'Optional: setzt den Ladebalken im Snake-Hub genauer, als die automatische Anzeige es kann. ' +
        'Bei großen Projekten nach jedem Schritt aufrufen (z. B. 20 %, 50 %, 80 %); am Ende setzt der Hub selbst 100 %.',
      inputSchema: {
        type: 'object',
        properties: {
          prozent: { type: 'number', minimum: 0, maximum: 100, description: 'Fortschritt in Prozent' },
          aufgabe: { type: 'string', description: 'Kurzer Name des Projekts, z. B. "Laub-Spiel"' },
          schritt: { type: 'string', description: 'Was gerade passiert, z. B. "Grafik wird gebaut"' },
        },
        required: ['prozent', 'aufgabe'],
      },
    })
    void $.ui.open({ id: PANE, title: TITEL })
    void updatePruefen($).catch(() => undefined)
    return next(e)
  })

  // ---------- Befehle ----------

  on('command.run', { command: 'hub' }, async $ => {
    const pane = await $.ui.open({ id: PANE, title: TITEL })
    const s = await read($, settings)
    const an = (b: boolean | undefined) => (b ? '●' : '○')
    return {
      text: [
        '🐍 Snake-Hub',
        `Theme: ${THEME_SEEDS[s.theme]?.name ?? 'aus'}`,
        'Mods: ' + MODS.map(m => `${an(s.mods[m.id])} ${m.id}`).join('  '),
        'Skills: ' + SKILLS.map(k => `${an(s.skills[k.id])} ${k.id}`).join('  '),
        pane.isPlaced ? '' : 'Panel wird hier nicht angezeigt. Nutze /look, /mod und /skill.',
      ].filter(Boolean).join('\n'),
    }
  })

  on('command.run', { command: 'look' }, async ($, e) => {
    const wahl = (e.args ?? '').trim().toLowerCase()
    if (wahl !== 'aus' && PALETTES[wahl] === undefined) {
      return { text: `Unbekanntes Theme „${wahl}“. Möglich: ${Object.keys(PALETTES).join(', ')}, aus` }
    }
    const s = await save($, x => ({ ...x, theme: wahl }))
    return { text: await applyTheme($, s) }
  }).catch(() => ({ text: 'Theme konnte nicht gewechselt werden.' }))

  on('command.run', { command: 'modus' }, async ($, e) => {
    const wahl = (e.args ?? '').trim().toLowerCase()
    const m = MODI.find(x => x.id === wahl)
    if (m === undefined) {
      return { text: `Möglich: ${MODI.map(x => x.id).join(', ')}` }
    }
    const s = await save($, x => ({ ...x, modus: wahl }))
    await applyTheme($, s)
    return { text: `Modus: ${m.name}` }
  })

  on('command.run', { command: 'blaetter' }, async ($, e) => {
    const wahl = (e.args ?? '').trim().toLowerCase().replace('ä', 'ae')
    const st = STAERKEN.find(x => x.id === wahl)
    if (st === undefined) {
      return { text: `Möglich: ${STAERKEN.map(x => x.id).join(', ')}` }
    }
    const s = await save($, x => ({ ...x, staerke: wahl }))
    await applyTheme($, s)
    return { text: `Hintergrund: ${st.name}` }
  })

  on('command.run', { command: 'fokus' }, async ($, e) => {
    const arg = (e.args ?? '').trim().toLowerCase()
    if (arg === 'stopp' || arg === 'stop') {
      fokusTimer?.cancel()
      fokusTimer = undefined
      await update($, fokus, f => ({ ...f, phase: 'aus', rest: 0 }))
      return { text: '🍅 Fokus-Timer gestoppt.' }
    }
    if (arg === 'pause') {
      await fokusStarten($, 5, 'pause')
      return { text: '☕ 5 Minuten Pause gestartet.' }
    }
    const min = Math.max(1, Math.min(180, Number(arg) || 25))
    await fokusStarten($, min, 'fokus')
    return { text: `🍅 Fokus-Runde: ${min} Minuten. Los geht’s!` }
  })

  on('command.run', { command: 'notiz' }, async ($, e) => {
    const text = (e.args ?? '').trim()
    if (text === '') {
      const n = await read($, notizen)
      return { text: n.length ? `📝 Notizen:\n${n.map(x => `• ${x}`).join('\n')}` : '📝 Noch keine Notizen. Beispiel: /notiz Trashketball probieren' }
    }
    const neu = [...(await read($, notizen)), text].slice(-30)
    await update($, notizen, () => neu)
    await $.store.set('notizen', neu)
    void erfolg($, 'notiz')
    return { text: `📝 Notiert: ${text}` }
  })

  on('command.run', { command: 'ziel' }, async ($, e) => {
    const text = (e.args ?? '').trim()
    if (text === '') {
      const z = await read($, ziele)
      return { text: z.length ? `🎯 Heute:\n${z.map(x => `${x.fertig ? '✓' : '○'} ${x.text}`).join('\n')}` : '🎯 Noch keine Ziele für heute. Beispiel: /ziel Sakura fertig machen' }
    }
    const neu = [...(await zieleHeute($)), { text, fertig: false }].slice(-10)
    await update($, ziele, () => neu)
    await $.store.set('ziele', neu)
    return { text: `🎯 Ziel für heute: ${text}` }
  })

  on('command.run', { command: 'erfolge' }, async $ => {
    const liste = await read($, erfolge)
    return { text: `🏆 ${liste.length}/${ERFOLGE.length} Erfolge\n` + ERFOLGE.map(x => `${liste.includes(x.id) ? '✓' : '○'} ${x.name}: ${x.info}`).join('\n') }
  })

  on('command.run', { command: 'geraeusch' }, async ($, e) => {
    const art = (e.args ?? '').trim().toLowerCase()
    const g = GERAEUSCHE.find(x => x.id === art)
    if (g === undefined) {
      return { text: `Möglich: ${GERAEUSCHE.map(x => x.id).join(', ')}` }
    }
    await save($, x => ({ ...x, ambient: art }))
    ambientSetzen($, art)
    return { text: `Geräusch: ${g.name}` }
  })

  on('command.run', { command: 'hub-update' }, async $ => {
    await updatePruefen($).catch(() => undefined)
    return { text: neueVersion ? `🐍 Snake-Hub ${neueVersion} ist verfügbar (du hast ${VERSION}).\n${UPDATE_TEXT}` : `✅ Snake-Hub ${VERSION} ist aktuell.` }
  })

  on('command.run', { command: 'wetter' }, async ($, e) => {
    const name = (e.args ?? '').trim()
    if (name === '') {
      const ort = (await $.store.get('ort')) as Ort | undefined
      return { text: ort ? `Wetter-Ort: ${ort.name} (gerade: ${wetterLage ?? 'unbekannt'})` : 'Noch kein Ort. Beispiel: /wetter Braunau am Inn' }
    }
    const res = await $.http.fetch(`https://geocoding-api.open-meteo.com/v1/search?count=1&language=de&name=${encodeURIComponent(name)}`)
    const treffer = res.ok ? (JSON.parse(res.text) as { results?: { name: string; latitude: number; longitude: number; country?: string }[] }).results?.[0] : undefined
    if (treffer === undefined) {
      return { text: `Ort „${name}“ nicht gefunden.` }
    }
    await $.store.set('ort', { name: `${treffer.name}${treffer.country ? `, ${treffer.country}` : ''}`, lat: treffer.latitude, lon: treffer.longitude })
    await wetterHolen($).catch(() => undefined)
    const s = await save($, x => ({ ...x, mods: { ...x.mods, wetter: true } }))
    applyTimers($, s)
    return { text: `Wetter-Ort: ${treffer.name}. Gerade: ${wetterLage ?? 'unbekannt'}. ${await applyTheme($, s)}` }
  }).catch(() => ({ text: 'Wetter konnte nicht abgefragt werden.' }))

  on('command.run', { command: 'mod' }, async ($, e) => {
    const id = (e.args ?? '').trim().toLowerCase()
    const mod = MODS.find(m => m.id === id)
    if (mod === undefined) {
      return { text: `Unbekannte Mod „${id}“. Möglich: ${MODS.map(m => m.id).join(', ')}` }
    }
    const s = await save($, x => ({ ...x, mods: { ...x.mods, [id]: !x.mods[id] } }))
    applyTimers($, s)
    if (['szenen', 'desktop', 'tageszeit', 'wetter'].includes(id)) {
      await applyTheme($, s)
    }
    return { text: `${mod.name}: ${s.mods[id] ? 'AN' : 'AUS'}` }
  })

  on('command.run', { command: 'skill' }, async ($, e) => {
    const id = (e.args ?? '').trim().toLowerCase()
    const skill = SKILLS.find(k => k.id === id)
    if (skill === undefined) {
      return { text: `Unbekannter Skill „${id}“. Möglich: ${SKILLS.map(k => k.id).join(', ')}` }
    }
    const s = await save($, x => ({ ...x, skills: { ...x.skills, [id]: !x.skills[id] } }))
    return { text: `${skill.name}: ${s.skills[id] ? 'AN' : 'AUS'} (gilt ab deiner nächsten Nachricht)` }
  })

  on('command.run', { command: 'mehr-details' }, async $ => {
    await sende($, KNOEPFE[0]?.prompt ?? 'Füge dem aktuellen Projekt mehr passende Details hinzu.')
    return { text: 'Okay, ich füge mehr Details hinzu ✨' }
  })

  // ---------- Jede Nachricht: Skills mitteilen, Fortschritt starten ----------

  on('prompt.submit', async ($, e, next) => {
    if (e.command !== undefined || e.text.trim().startsWith('/')) {
      return next(e)
    }
    const s = await read($, settings)
    schritte = 0
    await update($, fortschritt, () => ({ prozent: 3, aufgabe: kurz(e.text, 48), schritt: 'Claude denkt nach …', laeuft: true, manuell: false }))
    await update($, statistik, st => ({ ...st, antworten: st.antworten + 1 }))
    const gesamt = await zaehlen($, 'auftraegeGesamt')
    void erfolg($, 'erster')
    if (gesamt >= 10) void erfolg($, 'zehn')
    if (gesamt >= 100) void erfolg($, 'hundert')
    const h = (await datum($)).getHours()
    if (h < 4) void erfolg($, 'nachteule')
    if (h >= 4 && h < 7) void erfolg($, 'frueh')

    const an = SKILLS.filter(k => s.skills[k.id]).map(k => k.context)
    const aus = SKILLS.filter(k => !s.skills[k.id]).map(k => k.id)
    const hinweis = [
      'Snake-Hub (vom Nutzer gewählte Einstellungen):',
      ...an,
      aus.length > 0 ? `Ausgeschaltet, also nicht verwenden: ${aus.join(', ')}.` : '',
      s.mods.fortschritt ? 'Der Ladebalken läuft automatisch mit; bei großen Projekten kannst du ihn mit dem fortschritt-Werkzeug genauer setzen.' : 'Das fortschritt-Werkzeug nicht verwenden.',
    ].filter(Boolean).join('\n')
    return next({ ...e, context: [...(e.context ?? []), hinweis] })
  }).catch(($, e, next) => next(e))

  // ---------- Werkzeug-Aufrufe: Feed, Statistik, Auto-Fortschritt, Schutz ----------

  on('tool.call', { tool: TOOL_ID }, async ($, e) => {
    const s = await read($, settings)
    if (!s.mods.fortschritt) {
      return { result: 'Der Fortschrittsbalken ist ausgeschaltet.' }
    }
    const input = (e as unknown as { input?: Record<string, unknown> }).input ?? (e as unknown as Record<string, unknown>)
    const prozent = Math.max(0, Math.min(99, Number(input.prozent) || 0))
    await update($, fortschritt, f => ({
      ...f,
      prozent,
      aufgabe: String(input.aufgabe ?? f.aufgabe),
      schritt: String(input.schritt ?? f.schritt),
      laeuft: true,
      manuell: true,
    }))
    return { result: `Fortschritt angezeigt: ${Math.round(prozent)} %` }
  })

  on('tool.call', async ($, e, next) => {
    if (e.tool === TOOL_ID) {
      return next(e)
    }
    const s = await read($, settings)
    const roh = e as unknown as Record<string, unknown>
    const was = beschreibe(e.tool, roh)

    if (s.mods.schutz && (e.tool === 'Edit' || e.tool === 'Write') && SCHUTZ.test(String(roh.file_path ?? ''))) {
      return { deny: `🛡️ Datei-Schutz: ${dateiname(roh.file_path)} ist geschützt. Schalte die Mod „schutz“ im Snake-Hub aus, wenn du sie wirklich ändern willst.` }
    }

    const id = `${e.tool_use_id}`
    schritte += 1
    await update($, aktivitaet, list => [...list, { id, icon: was.icon, text: was.text, fertig: false, fehler: false }].slice(-12))
    await update($, statistik, st => ({
      ...st,
      werkzeuge: st.werkzeuge + 1,
      dateien: was.datei !== undefined && !st.dateien.includes(was.datei) ? [...st.dateien, was.datei] : st.dateien,
    }))
    await update($, fortschritt, f => (f.manuell ? { ...f, schritt: was.text } : {
      ...f,
      prozent: Math.min(92, Math.round(5 + 87 * (1 - Math.pow(0.82, schritte)))),
      schritt: was.text,
      laeuft: true,
    }))

    const ran = await next(e)
    const fehler = ran.deny !== undefined || ran.isError === true
    await update($, aktivitaet, list => list.map(a => (a.id === id ? { ...a, fertig: true, fehler } : a)))
    return ran
  }).catch(($, e, next) => (next.called ? next(e) : next(e)))

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    const s = await read($, settings)
    const f = await read($, fortschritt)
    if (f.laeuft) {
      await update($, fortschritt, x => ({ ...x, prozent: 100, schritt: 'Fertig', laeuft: false }))
      if (s.mods.fertig) {
        $.ui.toast(`✅ Fertig: ${f.aufgabe}`)
      }
      void klang($, 'fertig.wav')
    }
    return result
  })

  // ---------- Leiste über dem Eingabefeld ----------

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const s = await read($, settings)
    const f = await read($, fortschritt)
    if (!s.mods.leiste || !s.mods.fortschritt || f.aufgabe === '' || e.props.hasSurvey) {
      return next(e)
    }
    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box gap={1}>
        <Text color={f.laeuft ? 'claude' : 'success'}>{f.laeuft ? '▶' : '✓'}</Text>
        <Text mono>
          <Text backgroundColor={f.laeuft ? 'claude' : 'success'}>{' '.repeat(Math.round((f.prozent / 100) * 24))}</Text>
          <Text backgroundColor="subtle">{' '.repeat(24 - Math.round((f.prozent / 100) * 24))}</Text>
        </Text>
        <Text tabular weight="semibold">{Math.round(f.prozent)} %</Text>
        <Text dimColor>{kurz(f.laeuft ? f.schritt : f.aufgabe, 46)}</Text>
      </Box>
    )
  })

  // ---------- Animierter Hintergrund ----------

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    const svg = SCENES[e.props.scene]
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || svg === undefined) {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)
    return <Svg source={svg} alt={SCENE_ALT[e.props.scene] ?? 'Animierter Hintergrund'} isInteractive />
  })

  // ---------- Panel ----------

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button, Input } = $.ui.resolve(e)
    const s = await read($, settings)
    const f = await read($, fortschritt)
    const feed = await read($, aktivitaet)
    const st = await read($, statistik)
    const reiter = await read($, tab)
    const fk = await read($, fokus)
    const meineNotizen = await read($, notizen)
    const meineZiele = await read($, ziele)
    const meineErfolge = await read($, erfolge)
    const w = await read($, wetterInfo)
    await read($, uhrzeit)
    const jetzt = new Date(await $.clock.now())
    const eff = effektiv(s, jetzt)
    const t = THEME_SEEDS[eff.id]
    const k = s.kompakt

    const setSetting = (patch: Partial<HubSettings>) => async () => {
      const x = await save($, y => ({ ...y, ...patch }))
      await applyTheme($, x)
    }
    const setDesk = (patch: Partial<HubSettings['desk']>) => async () => {
      const x = await save($, y => ({ ...y, desk: { ...y.desk, ...patch } }))
      await applyTheme($, x)
    }
    let appStatus: { app?: string; kategorie?: string; effekt?: string } = {}
    if (s.mods.desktop && reiter === 'look') {
      try {
        const home = (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME'))
        appStatus = JSON.parse(String(await $.fs.read(`${home}/.snake-hub/status.json`))) as typeof appStatus
      } catch {
        appStatus = {}
      }
    }
    const toggleMod = (id: string) => async () => {
      const x = await save($, y => ({ ...y, mods: { ...y.mods, [id]: !y.mods[id] } }))
      applyTimers($, x)
      if (['szenen', 'desktop', 'tageszeit', 'wetter', 'saison'].includes(id)) {
        await applyTheme($, x)
      }
    }
    const toggleSkill = (id: string) => async () => {
      await save($, y => ({ ...y, skills: { ...y.skills, [id]: !y.skills[id] } }))
    }
    const notizDazu = async (text: string) => {
      if (text.trim() === '') return
      const neu = [...(await read($, notizen)), text.trim()].slice(-30)
      await update($, notizen, () => neu)
      await $.store.set('notizen', neu)
      void erfolg($, 'notiz')
    }
    const notizWeg = (idx: number) => async () => {
      const neu = (await read($, notizen)).filter((_, j) => j !== idx)
      await update($, notizen, () => neu)
      await $.store.set('notizen', neu)
    }
    const zielDazu = async (text: string) => {
      if (text.trim() === '') return
      const neu = [...(await zieleHeute($)), { text: text.trim(), fertig: false }].slice(-10)
      await update($, ziele, () => neu)
      await $.store.set('ziele', neu)
    }
    const zielUm = (idx: number) => async () => {
      const neu = (await read($, ziele)).map((z, j) => (j === idx ? { ...z, fertig: !z.fertig } : z))
      await update($, ziele, () => neu)
      await $.store.set('ziele', neu)
      if (neu.length >= 3 && neu.every(z => z.fertig)) void erfolg($, 'ziele')
    }

    const Abschnitt = (titel: string, kinder: RenderChildren) => k ? (
      <Box flexDirection="column" gap={0}>
        <Text size="footnote" weight="bold" dimColor>{titel}</Text>
        {kinder}
      </Box>
    ) : (
      <Box flexDirection="column" borderStyle="round" paddingX={1} paddingY={0} gap={0}>
        <Text size="heading" weight="bold">{titel}</Text>
        {kinder}
      </Box>
    )

    const Chips = (items: { id: string; label: string; aktiv: boolean; los: () => void }[]) => (
      <Box flexDirection="row" flexWrap="wrap" gap={1}>
        {items.map(c => (
          <Button key={c.id} label={c.label} variant={c.aktiv ? 'primary' : 'secondary'} onPress={c.los} />
        ))}
      </Box>
    )

    const Schalter = (key: string, name: string, an: boolean, los: () => void) => (
      <Box key={key} flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text dimColor={!an}>{name}</Text>
        <Button key={`${key}-b`} label={an ? 'An' : 'Aus'} variant={an ? 'primary' : 'secondary'} onPress={los} />
      </Box>
    )

    const Balken = (prozent: number, breite: number, farbe: string) => (
      <Text mono>
        <Text backgroundColor={farbe}>{' '.repeat(Math.round((prozent / 100) * breite))}</Text>
        <Text backgroundColor="subtle">{' '.repeat(breite - Math.round((prozent / 100) * breite))}</Text>
      </Text>
    )

    const REITER = [
      { id: 'start', label: '🏠 Start' },
      { id: 'extras', label: '🍅 Extras' },
      { id: 'look', label: '🎨 Aussehen' },
      { id: 'mods', label: '🧩 Mods' },
      { id: 'skills', label: '🧠 Skills' },
    ]
    const zeit = jetzt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    const minuten = Math.max(0, Math.floor((jetzt.getTime() - st.start) / 60000))
    const fokusAn = fk.phase !== 'aus'
    const fokusDauer = fk.phase === 'pause' ? 5 : 25

    return (
      <Box flexDirection="column" gap={1}>
        <Box flexDirection="column">
          <Text size={k ? 'heading' : 'title'} weight="bold">🐍 Snake-Hub <Text size="caption" dimColor>v{VERSION}</Text></Text>
          <Text size="footnote">
            🕒 {zeit}{w.ort !== '' && w.temp !== null ? `  ·  ${wetterEmoji(w.code)} ${Math.round(w.temp)} °C ${w.ort}` : ''}  ·  ⏱️ {minuten} min{fokusAn ? `  ·  ${fk.phase === 'fokus' ? '🍅' : '☕'} ${fk.rest} min` : ''}
          </Text>
          <Text dimColor size="caption">
            {t ? `${t.emoji} ${t.name}` : 'Kein Theme'}{eff.grund ? ` (${eff.grund})` : ''} · {s.modus === 'hell' ? 'Hell' : s.modus === 'auto' ? 'Wie Windows' : 'Dunkel'} · {MODS.filter(m => s.mods[m.id]).length}/{MODS.length} Mods · {SKILLS.filter(x => s.skills[x.id]).length}/{SKILLS.length} Skills
          </Text>
        </Box>

        {neueVersion !== undefined && (
          <Box borderStyle="round" paddingX={1} flexDirection="column">
            <Text weight="bold" color="claude">⬆️ Snake-Hub {neueVersion} ist da</Text>
            <Text size="footnote" dimColor>Plugins → Marketplace synchronisieren → Snake hub aktualisieren. Details: /hub-update</Text>
          </Box>
        )}

        {Chips(REITER.map(r => ({ id: `r-${r.id}`, label: r.label, aktiv: reiter === r.id, los: () => void update($, tab, () => r.id) })))}

        {reiter === 'start' && (
          <Box flexDirection="column" gap={1}>
            {s.mods.fortschritt && Abschnitt('📊 Fortschritt', f.aufgabe === '' ? (
              <Text dimColor>Schick mir eine Aufgabe, dann läuft hier der Balken mit.</Text>
            ) : (
              <Box flexDirection="column">
                <Text weight="semibold">{f.aufgabe}</Text>
                <Box flexDirection="row" gap={1} alignItems="center">
                  {Balken(f.prozent, k ? 18 : 26, f.laeuft ? 'claude' : 'success')}
                  <Text tabular weight="semibold">{Math.round(f.prozent)} %</Text>
                </Box>
                <Text dimColor size="footnote">{f.laeuft ? f.schritt : '🎉 Fertig – kann abgeholt werden!'}</Text>
              </Box>
            ))}

            {s.mods.statistik && Abschnitt('📈 Diese Sitzung', (
              <Box flexDirection="row" flexWrap="wrap" columnGap={3}>
                <Text tabular>💬 {st.antworten} Aufträge</Text>
                <Text tabular>🔧 {st.werkzeuge} Schritte</Text>
                <Text tabular>📁 {st.dateien.length} Dateien</Text>
                {s.mods.erfolge && <Text tabular>🏆 {meineErfolge.length}/{ERFOLGE.length}</Text>}
              </Box>
            ))}

            {s.mods.aktivitaet && !k && Abschnitt('📜 Was Claude gerade tut', (
              <Box flexDirection="column">
                {feed.length === 0 && <Text dimColor>Noch nichts passiert.</Text>}
                {feed.slice(-6).reverse().map(a => (
                  <Text key={a.id} size="footnote" dimColor={a.fertig && !a.fehler} color={a.fehler ? 'error' : undefined}>
                    {a.fertig ? (a.fehler ? '✗' : '✓') : '…'} {a.icon} {a.text}
                  </Text>
                ))}
              </Box>
            ))}

            {s.mods.knoepfe && Abschnitt('🎛️ Schnellknöpfe', Chips(KNOEPFE.map(x => ({ id: `k-${x.label}`, label: x.label, aktiv: false, los: () => void sende($, x.prompt) }))))}
          </Box>
        )}

        {reiter === 'extras' && (
          <Box flexDirection="column" gap={1}>
            {s.mods.fokus && Abschnitt('🍅 Fokus-Timer', (
              <Box flexDirection="column">
                {fokusAn ? (
                  <Box flexDirection="column">
                    <Text weight="semibold">{fk.phase === 'fokus' ? '🍅 Fokus' : '☕ Pause'}: noch {fk.rest} min</Text>
                    {Balken(100 - (fk.rest / fokusDauer) * 100, k ? 18 : 26, fk.phase === 'fokus' ? 'claude' : 'success')}
                  </Box>
                ) : (
                  <Text dimColor>Heute {fk.runden} {fk.runden === 1 ? 'Runde' : 'Runden'} geschafft.</Text>
                )}
                {Chips([
                  { id: 'f25', label: '🍅 25 min', aktiv: fk.phase === 'fokus', los: () => void fokusStarten($, 25, 'fokus') },
                  { id: 'f50', label: '🍅 50 min', aktiv: false, los: () => void fokusStarten($, 50, 'fokus') },
                  { id: 'fp', label: '☕ 5 min Pause', aktiv: fk.phase === 'pause', los: () => void fokusStarten($, 5, 'pause') },
                  { id: 'fs', label: '⏹ Stopp', aktiv: false, los: () => { fokusTimer?.cancel(); fokusTimer = undefined; void update($, fokus, x => ({ ...x, phase: 'aus', rest: 0 })) } },
                ])}
              </Box>
            ))}

            {s.mods.ziele && Abschnitt(`🎯 Tagesziele ${meineZiele.filter(z => z.fertig).length}/${meineZiele.length}`, (
              <Box flexDirection="column">
                {meineZiele.map((z, j) => (
                  <Box key={`z-${j}`} flexDirection="row" justifyContent="space-between" alignItems="center">
                    <Text strikethrough={z.fertig} dimColor={z.fertig}>{z.text}</Text>
                    <Button key={`zb-${j}`} label={z.fertig ? '✓' : '○'} variant={z.fertig ? 'primary' : 'secondary'} onPress={() => void zielUm(j)()} />
                  </Box>
                ))}
                <Input key="ziel-neu" placeholder="Neues Ziel für heute …" submitLabel="Dazu" onSubmit={v => void zielDazu(v)} />
              </Box>
            ))}

            {s.mods.notizen && Abschnitt('📝 Notizen', (
              <Box flexDirection="column">
                {meineNotizen.length === 0 && <Text dimColor size="footnote">Noch leer. Schreib unten etwas rein.</Text>}
                {meineNotizen.map((n, j) => (
                  <Box key={`n-${j}`} flexDirection="row" justifyContent="space-between" alignItems="center">
                    <Text size="footnote">• {n}</Text>
                    <Button key={`nb-${j}`} label="✕" variant="secondary" onPress={() => void notizWeg(j)()} />
                  </Box>
                ))}
                <Input key="notiz-neu" placeholder="Notiz …" submitLabel="Merken" onSubmit={v => void notizDazu(v)} />
              </Box>
            ))}

            {Abschnitt('🎧 Geräusche', (
              <Box flexDirection="column">
                {Chips(GERAEUSCHE.map(g => ({ id: `a-${g.id}`, label: g.name, aktiv: s.ambient === g.id, los: () => { void save($, x => ({ ...x, ambient: g.id })); ambientSetzen($, g.id) } })))}
                <Text dimColor size="caption">Leises Endlos-Geräusch im Hintergrund.</Text>
              </Box>
            ))}

            {s.mods.erfolge && Abschnitt(`🏆 Erfolge ${meineErfolge.length}/${ERFOLGE.length}`, (
              <Box flexDirection="column">
                {ERFOLGE.map(x => (
                  <Text key={`e-${x.id}`} size="footnote" dimColor={!meineErfolge.includes(x.id)}>
                    {meineErfolge.includes(x.id) ? '✓' : '○'} {x.name} <Text dimColor size="caption">{x.info}</Text>
                  </Text>
                ))}
              </Box>
            ))}
          </Box>
        )}

        {reiter === 'look' && (
          <Box flexDirection="column" gap={1}>
            {Abschnitt('🎨 Theme', Chips([
              ...Object.entries(THEME_SEEDS).map(([id, th]) => ({ id: `t-${id}`, label: `${th.emoji} ${th.name}`, aktiv: s.theme === id, los: () => void setSetting({ theme: id })() })),
              { id: 't-aus', label: 'Aus', aktiv: s.theme === 'aus', los: () => void setSetting({ theme: 'aus' })() },
            ]))}
            {Abschnitt('🌓 Hell oder dunkel', Chips(MODI.map(m => ({ id: `d-${m.id}`, label: m.name, aktiv: s.modus === m.id, los: () => void setSetting({ modus: m.id })() }))))}
            {Abschnitt('🍃 Hintergrund-Stärke', (
              <Box flexDirection="column">
                {Chips(STAERKEN.map(m => ({ id: `g-${m.id}`, label: m.name, aktiv: s.staerke === m.id, los: () => void setSetting({ staerke: m.id })() })))}
                <Text dimColor size="caption">Fahr mit der Maus an Blätter, Blüten oder Flocken heran: Sie weichen dir aus.</Text>
              </Box>
            ))}
            {Abschnitt('🖥️ Wo und wann', (
              <Box flexDirection="column">
                {Schalter('w-szenen', 'In Claude', s.mods.szenen === true, () => void toggleMod('szenen')())}
                {Schalter('w-desktop', 'Auf dem ganzen PC (Snake-Desktop)', s.mods.desktop === true, () => void toggleMod('desktop')())}
                {Schalter('w-tag', 'Nachts automatisch dunkler', s.mods.tageszeit === true, () => void toggleMod('tageszeit')())}
                {Schalter('w-wetter', 'Theme nach Wetter (Ort mit /wetter)', s.mods.wetter === true, () => void toggleMod('wetter')())}
                {Schalter('w-saison', 'Halloween und Weihnachten automatisch', s.mods.saison === true, () => void toggleMod('saison')())}
              </Box>
            ))}
            {s.mods.desktop && Abschnitt('🖥️ Snake-Desktop', (
              <Box flexDirection="column">
                <Text size="footnote" dimColor>Größe</Text>
                {Chips(GROESSEN.map(g => ({ id: `dg-${g.id}`, label: g.name, aktiv: s.desk.groesse === g.id, los: () => void setDesk({ groesse: g.id })() })))}
                <Text size="footnote" dimColor>Menge</Text>
                {Chips(MENGEN.map(g => ({ id: `dm-${g.id}`, label: g.name, aktiv: s.desk.menge === g.id, los: () => void setDesk({ menge: g.id })() })))}
                {Schalter('dw', '🌬️ Windböen', s.desk.wind, () => void setDesk({ wind: !s.desk.wind })())}
                {Schalter('ds', '🍂 Blätter sammeln sich unten', s.desk.sammeln, () => void setDesk({ sammeln: !s.desk.sammeln })())}
                {Schalter('dp', '🎮 Bei Vollbild-Spielen pausieren', s.desk.autopause, () => void setDesk({ autopause: !s.desk.autopause })())}
                {Schalter('dk', '🧠 Passende Animation zur offenen App', s.desk.kontext, () => void setDesk({ kontext: !s.desk.kontext })())}
                {s.desk.kontext && appStatus.kategorie !== undefined && (
                  <Box flexDirection="column">
                    <Text size="footnote">Gerade offen: <Text weight="semibold">{appStatus.app || 'Desktop'}</Text> ({appStatus.kategorie}) → {APP_EFFEKTE.find(x => x.id === appStatus.effekt)?.name ?? appStatus.effekt}</Text>
                    {Chips(APP_EFFEKTE.map(x => ({ id: `ae-${x.id}`, label: x.name, aktiv: appStatus.effekt === x.id, los: () => void setDesk({ regeln: { ...s.desk.regeln, [appStatus.kategorie ?? 'sonst']: x.id } })() })))}
                    <Text dimColor size="caption">Gilt für alle Apps dieser Art. Ändern auch per Rechtsklick aufs Blatt-Symbol → Passend zur App.</Text>
                  </Box>
                )}
              </Box>
            ))}
            {Abschnitt('📐 Ansicht', Schalter('kompakt', 'Kompakt (weniger Rahmen, weniger Platz)', k, () => void save($, y => ({ ...y, kompakt: !y.kompakt })))) }
          </Box>
        )}

        {reiter === 'mods' && Abschnitt('🧩 Mods', (
          <Box flexDirection="column">
            {MODS.map(m => Schalter(`m-${m.id}`, m.name, s.mods[m.id] === true, () => void toggleMod(m.id)()))}
          </Box>
        ))}

        {reiter === 'skills' && Abschnitt('🧠 Skills', (
          <Box flexDirection="column">
            {SKILLS.map(x => Schalter(`s-${x.id}`, x.name, s.skills[x.id] === true, () => void toggleSkill(x.id)()))}
            <Text dimColor size="caption">Änderungen gelten ab deiner nächsten Nachricht.</Text>
          </Box>
        ))}
      </Box>
    )
  })
}
