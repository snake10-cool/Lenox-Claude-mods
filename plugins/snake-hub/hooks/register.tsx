import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import type { Aktivitaet, Fortschritt, HubSettings, Statistik } from '../types'
import { makeColors } from './make-colors.js'
import { SCENE_ALT, SCENES } from './scenes'
import { THEME_SEEDS } from './themes'

// ---------- Kataloge ----------

const MODS: { id: string; name: string }[] = [
  { id: 'szenen', name: '🎞️ Animierter Hintergrund' },
  { id: 'desktop', name: '🖥️ Auch auf dem ganzen PC (Snake-Desktop)' },
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
  { id: 'dezent', name: '🌫️ Dezent', glass: { blur: 8, opacity: 0.6 } },
  { id: 'normal', name: '🍂 Normal', glass: { blur: 3, opacity: 0.4 } },
  { id: 'kraeftig', name: '🍁 Kräftig', glass: { blur: 0, opacity: 0.18 } },
]

const DEFAULTS: HubSettings = {
  theme: 'herbst',
  modus: 'dunkel',
  staerke: 'normal',
  mods: { szenen: true, desktop: true, fortschritt: true, leiste: true, aktivitaet: true, statistik: true, knoepfe: true, uhr: false, pause: false, schutz: true, fertig: true },
  skills: { 'spiel-bauen': true, 'bug-jagd': true, 'flutter-release': true, 'einfach-erklaert': true, 'game-guide': true, 'kurz-knapp': false, 'deutsch-immer': true },
}

// ---------- Themes ----------

const PALETTES: Record<string, ThemeSetArgs['colors']> = {}
for (const [id, s] of Object.entries(THEME_SEEDS)) {
  PALETTES[id] = makeColors({ label: s.name, roles: s.roles, light: { gray: { anchors: s.light } }, dark: { gray: { anchors: s.dark } } }).theme
}

// ---------- Zustand ----------

const PANE = 'snake-hub'
const TITEL = '🐍 Snake-Hub'
const TOOL_ID = 'mcp__snake-hub__fortschritt'
const PAUSE_MS = 45 * 60 * 1000
const SCHUTZ = /(^|[\\/])(\.env(\..*)?|key\.properties|.*\.jks|.*\.keystore|.*\.pem|id_rsa.*)$/i

const LEER: Fortschritt = { prozent: 0, aufgabe: '', schritt: '', laeuft: false, manuell: false }
const fortschritt = atom({ plugin: 'snake-hub', key: 'fortschritt' } as const, LEER, { shape: 'fortschritt-2' })
const settings = atom({ plugin: 'snake-hub', key: 'settings' } as const, DEFAULTS, { shape: 'settings-3' })
const aktivitaet = atom({ plugin: 'snake-hub', key: 'aktivitaet' } as const, [] as Aktivitaet[], { shape: 'aktivitaet-1' })
const statistik = atom({ plugin: 'snake-hub', key: 'statistik' } as const, { antworten: 0, werkzeuge: 0, dateien: [], start: 0 } as Statistik, { shape: 'statistik-1' })

let uhrTimer: { cancel: () => void } | undefined
let pauseTimer: { cancel: () => void } | undefined
let schritte = 0
let letzterKlick = 0

// ---------- Hilfsfunktionen ----------

function balken(prozent: number, breite = 22): string {
  const voll = Math.round((prozent / 100) * breite)
  return '█'.repeat(voll) + '░'.repeat(breite - voll)
}

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
    mods: { ...DEFAULTS.mods, ...(s.mods ?? {}) },
    skills: { ...DEFAULTS.skills, ...(s.skills ?? {}) },
  }
}

async function desktopSync($: EngineInterface, s: HubSettings): Promise<void> {
  const home = (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME'))
  if (home === undefined) {
    return
  }
  const daten = { an: s.mods.desktop === true && SCENES[s.theme] !== undefined, theme: s.theme, modus: s.modus, staerke: s.staerke }
  await $.fs.write(`${home}/.snake-hub/desktop.json`, JSON.stringify(daten, null, 2))
}

async function applyTheme($: EngineInterface, s: HubSettings): Promise<string> {
  void desktopSync($, s).catch(() => undefined)
  const colors = PALETTES[s.theme]
  if (colors === undefined) {
    await $.theme.clear()
    return 'Theme aus (Standard-Aussehen der App)'
  }
  const glass = (STAERKEN.find(x => x.id === s.staerke) ?? STAERKEN[1])?.glass ?? { blur: 3, opacity: 0.4 }
  const scheme = s.modus === 'dunkel' ? { overrideColorScheme: 'dark' as const } : s.modus === 'hell' ? { overrideColorScheme: 'light' as const } : {}
  const look: ThemeSetArgs = s.mods.szenen && SCENES[s.theme] !== undefined
    ? { colors, backdrop: { scene: s.theme, glass }, ...scheme }
    : { colors, ...scheme }
  const set = await $.theme.set(look)
  const t = THEME_SEEDS[s.theme]
  const name = `${t?.emoji ?? ''} ${t?.name ?? s.theme}`
  return set.isDrawn ? `Theme: ${name}` : `Theme: ${name} (wird gezeichnet, sobald die Desktop- oder Handy-App angeschlossen ist)`
}

function applyTimers($: EngineInterface, s: HubSettings): void {
  uhrTimer?.cancel()
  pauseTimer?.cancel()
  uhrTimer = undefined
  pauseTimer = undefined
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
    await applyTheme($, s)
    applyTimers($, s)

    await $.command.register({ name: 'hub', description: 'Öffnet den Snake-Hub und zeigt, was an und aus ist' })
    await $.command.register({ name: 'look', description: 'Theme wechseln: herbst, herbstnacht, sakura, mitternacht, ozean, wald, schnee, regen, lagerfeuer oder aus' })
    await $.command.register({ name: 'modus', description: 'Hell oder dunkel: dunkel, hell oder auto' })
    await $.command.register({ name: 'blaetter', description: 'Wie stark der Hintergrund zu sehen ist: dezent, normal oder kraeftig' })
    await $.command.register({ name: 'mod', description: 'Mod an/aus: szenen, desktop, fortschritt, leiste, aktivitaet, statistik, knoepfe, uhr, pause, schutz, fertig' })
    await $.command.register({ name: 'skill', description: 'Skill an/aus: spiel-bauen, bug-jagd, flutter-release, einfach-erklaert, game-guide, kurz-knapp, deutsch-immer' })
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

  on('command.run', { command: 'mod' }, async ($, e) => {
    const id = (e.args ?? '').trim().toLowerCase()
    const mod = MODS.find(m => m.id === id)
    if (mod === undefined) {
      return { text: `Unbekannte Mod „${id}“. Möglich: ${MODS.map(m => m.id).join(', ')}` }
    }
    const s = await save($, x => ({ ...x, mods: { ...x.mods, [id]: !x.mods[id] } }))
    applyTimers($, s)
    if (id === 'szenen' || id === 'desktop') {
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
        <Text mono color={f.laeuft ? 'claude' : 'success'}>{balken(f.prozent, 16)}</Text>
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
    const { Box, Text, Button } = $.ui.resolve(e)
    const s = await read($, settings)
    const f = await read($, fortschritt)
    const feed = await read($, aktivitaet)
    const st = await read($, statistik)
    const jetzt = await $.clock.now()
    const t = THEME_SEEDS[s.theme]

    const setTheme = (id: string) => async () => {
      const x = await save($, y => ({ ...y, theme: id }))
      await applyTheme($, x)
    }
    const setSetting = (patch: Partial<HubSettings>) => async () => {
      const x = await save($, y => ({ ...y, ...patch }))
      await applyTheme($, x)
    }
    const toggleMod = (id: string) => async () => {
      const x = await save($, y => ({ ...y, mods: { ...y.mods, [id]: !y.mods[id] } }))
      applyTimers($, x)
      if (id === 'szenen' || id === 'desktop') {
        await applyTheme($, x)
      }
    }
    const toggleSkill = (id: string) => async () => {
      await save($, y => ({ ...y, skills: { ...y.skills, [id]: !y.skills[id] } }))
    }

    return (
      <Box flexDirection="column" gap={1}>
        <Box flexDirection="column">
          <Text size="title" weight="bold">🐍 Snake-Hub</Text>
          <Text dimColor>{t ? `${t.emoji} ${t.name}` : 'Kein Theme'} · {SKILLS.filter(k => s.skills[k.id]).length} Skills · {MODS.filter(m => s.mods[m.id]).length} Mods aktiv</Text>
        </Box>

        {s.mods.fortschritt && (
          <Box flexDirection="column" borderStyle="round" paddingX={1}>
            <Text size="heading" weight="bold">📊 Fortschritt</Text>
            {f.aufgabe === '' ? (
              <Text dimColor>Schick mir eine Aufgabe, dann läuft hier der Balken mit.</Text>
            ) : (
              <Box flexDirection="column">
                <Text weight="semibold">{f.aufgabe}</Text>
                <Text mono color={f.laeuft ? 'claude' : 'success'}>{balken(f.prozent)} {Math.round(f.prozent)} %</Text>
                <Text dimColor>{f.laeuft ? f.schritt : '🎉 Fertig – kann abgeholt werden!'}</Text>
              </Box>
            )}
          </Box>
        )}

        {s.mods.statistik && (
          <Box flexDirection="column" borderStyle="round" paddingX={1}>
            <Text size="heading" weight="bold">📈 Diese Sitzung</Text>
            <Text tabular>⏱️ {Math.max(0, Math.floor((jetzt - st.start) / 60000))} min   💬 {st.antworten} Aufträge</Text>
            <Text tabular>🔧 {st.werkzeuge} Werkzeug-Schritte   📁 {st.dateien.length} Dateien geändert</Text>
          </Box>
        )}

        {s.mods.aktivitaet && (
          <Box flexDirection="column" borderStyle="round" paddingX={1}>
            <Text size="heading" weight="bold">📜 Was Claude gerade tut</Text>
            {feed.length === 0 && <Text dimColor>Noch nichts passiert.</Text>}
            {feed.slice(-8).reverse().map(a => (
              <Text key={a.id} dimColor={a.fertig && !a.fehler} color={a.fehler ? 'error' : undefined}>
                {a.fertig ? (a.fehler ? '✗' : '✓') : '…'} {a.icon} {a.text}
              </Text>
            ))}
          </Box>
        )}

        {s.mods.knoepfe && (
          <Box flexDirection="column" borderStyle="round" paddingX={1}>
            <Text size="heading" weight="bold">🎛️ Schnellknöpfe</Text>
            {KNOEPFE.map(k => (
              <Button key={`k-${k.label}`} label={k.label} onPress={() => void sende($, k.prompt)} />
            ))}
          </Box>
        )}

        <Box flexDirection="column" borderStyle="round" paddingX={1}>
          <Text size="heading" weight="bold">🎨 Theme</Text>
          {Object.entries(THEME_SEEDS).map(([id, th]) => (
            <Button key={`t-${id}`} label={`${s.theme === id ? '●' : '○'} ${th.emoji} ${th.name}`} onPress={() => void setTheme(id)()} />
          ))}
          <Button key="t-aus" label={`${s.theme === 'aus' ? '●' : '○'} Aus`} onPress={() => void setTheme('aus')()} />
        </Box>

        <Box flexDirection="column" borderStyle="round" paddingX={1}>
          <Text size="heading" weight="bold">🌓 Hell oder dunkel</Text>
          {MODI.map(m => (
            <Button key={`d-${m.id}`} label={`${s.modus === m.id ? '●' : '○'} ${m.name}`} onPress={() => void setSetting({ modus: m.id })()} />
          ))}
          <Text size="heading" weight="bold">🍃 Hintergrund-Stärke</Text>
          {STAERKEN.map(m => (
            <Button key={`g-${m.id}`} label={`${s.staerke === m.id ? '●' : '○'} ${m.name}`} onPress={() => void setSetting({ staerke: m.id })()} />
          ))}
          <Text dimColor size="caption">Fahr mit der Maus über Blätter, Blüten oder Flocken.</Text>
        </Box>

        <Box flexDirection="column" borderStyle="round" paddingX={1}>
          <Text size="heading" weight="bold">🧩 Mods</Text>
          {MODS.map(m => (
            <Button key={`m-${m.id}`} label={`${s.mods[m.id] ? '● AN ' : '○ AUS'}  ${m.name}`} onPress={() => void toggleMod(m.id)()} />
          ))}
        </Box>

        <Box flexDirection="column" borderStyle="round" paddingX={1}>
          <Text size="heading" weight="bold">🧠 Skills</Text>
          {SKILLS.map(k => (
            <Button key={`s-${k.id}`} label={`${s.skills[k.id] ? '● AN ' : '○ AUS'}  ${k.name}`} onPress={() => void toggleSkill(k.id)()} />
          ))}
          <Text dimColor size="caption">Skill-Änderungen gelten ab deiner nächsten Nachricht.</Text>
        </Box>
      </Box>
    )
  })
}
