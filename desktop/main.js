// Snake-Desktop: lässt die Snake-Hub-Hintergründe über den ganzen Bildschirm fallen.
// Ein durchsichtiges Fenster pro Bildschirm, immer im Vordergrund, alle Klicks gehen durch.

const { app, BrowserWindow, Tray, Menu, screen, nativeTheme, nativeImage, ipcMain, net, Notification } = require('electron')
const { spawn } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { SCENES } = require('./scenes.js')

const DIR = path.join(os.homedir(), '.snake-hub')
const FILE = path.join(DIR, 'desktop.json')
const DEFAULTS = { an: true, theme: 'herbst', modus: 'dunkel', staerke: 'normal', groesse: 'mittel', menge: 'normal', wind: true, sammeln: true, autopause: true }
const NAMEN = {
  herbst: '🍂 Herbstlaub', herbstnacht: '🍁 Herbstnacht', sakura: '🌸 Sakura', mitternacht: '🌙 Mitternacht',
  ozean: '🌊 Ozean', wald: '🌲 Wald', schnee: '❄️ Schnee', regen: '🌧️ Regen', lagerfeuer: '🔥 Lagerfeuer', polarlicht: '🌌 Polarlicht',
  gewitter: '⛈️ Gewitter', strand: '🏖️ Strand', unterwasser: '🐠 Unterwasser', wueste: '🏜️ Wüste', halloween: '🎃 Halloween', weihnachten: '🎄 Weihnachten',
}
const STAERKEN = { dezent: 'Dezent', normal: 'Normal', kraeftig: 'Kräftig' }
const GROESSEN = { klein: 'Klein', mittel: 'Mittel', gross: 'Groß' }
const MENGEN = { wenig: 'Wenig', normal: 'Normal', viel: 'Viel' }

let settings = { ...DEFAULTS }
let windows = []
let tray = null
let updateStatus = ''
let pausiert = false
let waechter = null

// ---------- Pause bei Vollbild-Spielen ----------
// Ein kleines PowerShell-Skript prüft alle 1,5 s, ob das Fenster im Vordergrund den ganzen Bildschirm füllt.
const WAECHTER = `
Add-Type @"
using System; using System.Runtime.InteropServices; using System.Text;
public class W {
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out R r);
  [DllImport("user32.dll")] public static extern int GetClassName(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern IntPtr MonitorFromWindow(IntPtr h, uint f);
  [DllImport("user32.dll")] public static extern bool GetMonitorInfo(IntPtr m, ref MI i);
  public struct R { public int L, T, Ri, B; }
  [StructLayout(LayoutKind.Sequential)] public struct MI { public int cb; public R mon; public R work; public uint flags; }
}
"@
$last = ''
while ($true) {
  $h = [W]::GetForegroundWindow(); $r = New-Object W+R; [void][W]::GetWindowRect($h, [ref]$r)
  $sb = New-Object System.Text.StringBuilder 256; [void][W]::GetClassName($h, $sb, 256); $c = $sb.ToString()
  $m = [W]::MonitorFromWindow($h, 2); $mi = New-Object W+MI; $mi.cb = [Runtime.InteropServices.Marshal]::SizeOf($mi); [void][W]::GetMonitorInfo($m, [ref]$mi)
  $fs = ($c -ne 'Progman' -and $c -ne 'WorkerW' -and $c -ne 'Shell_TrayWnd' -and $r.L -le $mi.mon.L -and $r.T -le $mi.mon.T -and $r.Ri -ge $mi.mon.Ri -and $r.B -ge $mi.mon.B)
  $v = if ($fs) { '1' } else { '0' }
  if ($v -ne $last) { [Console]::Out.WriteLine($v); [Console]::Out.Flush(); $last = $v }
  Start-Sleep -Milliseconds 1500
}
`

function waechterSetzen() {
  const soll = process.platform === 'win32' && settings.autopause && settings.an
  if (soll && waechter === null) {
    const kodiert = Buffer.from(WAECHTER, 'utf16le').toString('base64')
    waechter = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', kodiert], { windowsHide: true })
    waechter.stdout.on('data', d => {
      const v = String(d).trim().split(/\s+/).pop()
      const neu = v === '1'
      if (neu !== pausiert) { pausiert = neu; anwenden() }
    })
    waechter.on('exit', () => { waechter = null })
  } else if (!soll && waechter !== null) {
    waechter.kill()
    waechter = null
    if (pausiert) { pausiert = false; anwenden() }
  }
}

// ---------- Selbst-Update ----------
// Prüft beim Start und alle 4 Stunden das neueste GitHub-Release "desktop-vX.Y.Z".
// Ist es neuer, wird die Setup-Datei geladen und still installiert; danach startet das Programm neu.

const RELEASES = 'https://api.github.com/repos/snake10-cool/Lenox-Claude-mods/releases?per_page=10'

function neuer(a, b) {
  const x = a.split('.').map(Number), y = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0)
  return false
}

async function updatePruefen(vonHand) {
  if (!app.isPackaged) return
  try {
    const res = await net.fetch(RELEASES, { headers: { 'User-Agent': 'Snake-Desktop', Accept: 'application/vnd.github+json' } })
    if (!res.ok) throw new Error(`GitHub antwortet ${res.status}`)
    const releases = await res.json()
    const passend = releases
      .filter(r => !r.draft && /^desktop-v\d+\.\d+\.\d+$/.test(r.tag_name))
      .map(r => ({ version: r.tag_name.replace('desktop-v', ''), asset: r.assets.find(a => a.name === 'Snake-Desktop-Setup.exe') }))
      .filter(r => r.asset !== undefined)
      .sort((a, b) => (neuer(a.version, b.version) ? -1 : 1))[0]
    if (passend === undefined || !neuer(passend.version, app.getVersion())) {
      updateStatus = `Aktuell (${app.getVersion()})`
      if (vonHand) hinweis('Snake-Desktop ist aktuell', `Version ${app.getVersion()}`)
      menue()
      return
    }
    updateStatus = `Lade ${passend.version} …`
    menue()
    const datei = path.join(os.tmpdir(), `Snake-Desktop-Setup-${passend.version}.exe`)
    const dl = await net.fetch(passend.asset.browser_download_url, { headers: { 'User-Agent': 'Snake-Desktop' } })
    if (!dl.ok) throw new Error(`Download fehlgeschlagen (${dl.status})`)
    fs.writeFileSync(datei, Buffer.from(await dl.arrayBuffer()))
    hinweis('Snake-Desktop wird aktualisiert', `Version ${passend.version} wird installiert, das dauert ein paar Sekunden.`)
    // Still installieren und danach wieder starten.
    spawn(datei, ['/S', '--force-run'], { detached: true, stdio: 'ignore' }).unref()
    setTimeout(() => app.quit(), 500)
  } catch (err) {
    updateStatus = 'Update-Prüfung fehlgeschlagen'
    if (vonHand) hinweis('Update-Prüfung fehlgeschlagen', String(err && err.message ? err.message : err))
    menue()
  }
}

function hinweis(titel, text) {
  if (Notification.isSupported()) new Notification({ title: titel, body: text, silent: true }).show()
}

function lesen() {
  try {
    return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(FILE, 'utf8')) }
  } catch {
    return { ...DEFAULTS }
  }
}

function schreiben(patch) {
  settings = { ...settings, ...patch }
  try {
    fs.mkdirSync(DIR, { recursive: true })
    fs.writeFileSync(FILE, JSON.stringify(settings, null, 2))
  } catch {
    // Datei nicht schreibbar: Einstellung gilt trotzdem bis zum Neustart.
  }
  anwenden()
}

function szene() {
  return SCENES[settings.theme] || SCENES.herbst
}

function anwenden() {
  nativeTheme.themeSource = settings.modus === 'hell' ? 'light' : settings.modus === 'dunkel' ? 'dark' : 'system'
  const zeigen = settings.an && !pausiert && SCENES[settings.theme] !== undefined
  for (const w of windows) {
    if (w.isDestroyed()) continue
    if (!zeigen) {
      w.hide()
      continue
    }
    w.webContents.send('szene', { svg: szene(), staerke: settings.staerke, groesse: settings.groesse, menge: settings.menge, wind: settings.wind, sammeln: settings.sammeln })
    w.showInactive()
  }
  menue()
  waechterSetzen()
}

function fensterBauen() {
  for (const w of windows) if (!w.isDestroyed()) w.destroy()
  windows = screen.getAllDisplays().map(d => {
    const w = new BrowserWindow({
      x: d.bounds.x, y: d.bounds.y, width: d.bounds.width, height: d.bounds.height,
      transparent: true, frame: false, resizable: false, movable: false, focusable: false,
      skipTaskbar: true, hasShadow: false, show: false, fullscreenable: false, enableLargerThanScreen: true, thickFrame: false,
      backgroundColor: '#00000000',
      webPreferences: { preload: path.join(__dirname, 'preload.js'), backgroundThrottling: false },
    })
    w.setAlwaysOnTop(true, 'screen-saver', 1)
    w.setVisibleOnAllWorkspaces(true)
    // Klicks gehen durch, aber Mausbewegungen kommen an: so können Blätter ausweichen.
    w.setIgnoreMouseEvents(true, { forward: true })
    w.loadFile(path.join(__dirname, 'overlay.html'))
    w.webContents.on('did-finish-load', () => anwenden())
    // Windows verkleinert neue Fenster auf den Bereich ohne Taskleiste: Größe danach erzwingen.
    w.on('show', () => w.setBounds(d.bounds))
    w.__bounds = d.bounds
    return w
  })
}

function menue() {
  if (tray === null) return
  const autostart = app.getLoginItemSettings().openAtLogin
  tray.setToolTip(!settings.an ? 'Snake-Desktop: aus' : pausiert ? 'Snake-Desktop: pausiert (Vollbild)' : `Snake-Desktop: ${NAMEN[settings.theme] || settings.theme}`)
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: settings.an ? 'Ausschalten' : 'Einschalten', click: () => schreiben({ an: !settings.an }) },
    { type: 'separator' },
    { label: 'Theme', submenu: Object.entries(NAMEN).map(([id, name]) => ({ label: name, type: 'radio', checked: settings.theme === id, click: () => schreiben({ theme: id, an: true }) })) },
    { label: 'Stärke', submenu: Object.entries(STAERKEN).map(([id, name]) => ({ label: name, type: 'radio', checked: settings.staerke === id, click: () => schreiben({ staerke: id }) })) },
    { label: 'Größe', submenu: Object.entries(GROESSEN).map(([id, name]) => ({ label: name, type: 'radio', checked: settings.groesse === id, click: () => schreiben({ groesse: id }) })) },
    { label: 'Menge', submenu: Object.entries(MENGEN).map(([id, name]) => ({ label: name, type: 'radio', checked: settings.menge === id, click: () => schreiben({ menge: id }) })) },
    { label: 'Windböen', type: 'checkbox', checked: settings.wind, click: () => schreiben({ wind: !settings.wind }) },
    { label: 'Blätter sammeln sich unten', type: 'checkbox', checked: settings.sammeln, click: () => schreiben({ sammeln: !settings.sammeln }) },
    { label: 'Bei Vollbild-Spielen pausieren', type: 'checkbox', checked: settings.autopause, click: () => schreiben({ autopause: !settings.autopause }) },
    { label: 'Hell / Dunkel', submenu: [['dunkel', 'Dunkel'], ['hell', 'Hell'], ['auto', 'Wie Windows']].map(([id, name]) => ({ label: name, type: 'radio', checked: settings.modus === id, click: () => schreiben({ modus: id }) })) },
    { type: 'separator' },
    { label: `Version ${app.getVersion()}${updateStatus ? ` · ${updateStatus}` : ''}`, enabled: false },
    { label: 'Nach Updates suchen', click: () => updatePruefen(true) },
    { type: 'separator' },
    { label: 'Mit Windows starten', type: 'checkbox', checked: autostart, click: () => { app.setLoginItemSettings({ openAtLogin: !autostart }); menue() } },
    { label: 'Beenden', click: () => app.quit() },
  ]))
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.whenReady().then(() => {
    settings = lesen()
    tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'tray.png')))
    tray.on('click', () => schreiben({ an: !settings.an }))
    fensterBauen()
    menue()

    // Maus direkt über einem Blatt: Fenster nimmt kurz Klicks an, sonst gehen sie durch.
    ipcMain.on('fangen', (e, an) => {
      const w = BrowserWindow.fromWebContents(e.sender)
      if (w === null || w.isDestroyed()) return
      if (an) {
        w.setIgnoreMouseEvents(false)
      } else {
        w.setIgnoreMouseEvents(true, { forward: true })
      }
    })

    // Der Snake-Hub in Claude schreibt dieselbe Datei: Änderungen dort gelten sofort hier.
    fs.mkdirSync(DIR, { recursive: true })
    fs.watchFile(FILE, { interval: 1000 }, () => {
      settings = lesen()
      anwenden()
    })
    // Windows schiebt die Taskleiste immer wieder nach vorn: regelmäßig wieder darüberlegen.
    setInterval(() => {
      for (const w of windows) {
        if (!w.isDestroyed() && w.isVisible()) {
          const b = w.getBounds()
          if (b.height !== w.__bounds.height || b.width !== w.__bounds.width || b.y !== w.__bounds.y) {
            w.setBounds(w.__bounds)
          }
          w.setAlwaysOnTop(true, 'screen-saver', 1)
          w.moveTop()
        }
      }
    }, 2000)
    setTimeout(() => updatePruefen(false), 15000)
    setInterval(() => updatePruefen(false), 4 * 60 * 60 * 1000)
    screen.on('display-added', fensterBauen)
    screen.on('display-removed', fensterBauen)
    screen.on('display-metrics-changed', fensterBauen)
  })
  app.on('window-all-closed', e => e.preventDefault())
  app.on('before-quit', () => { if (waechter !== null) waechter.kill() })
}
