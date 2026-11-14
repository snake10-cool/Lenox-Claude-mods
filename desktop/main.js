// Snake-Desktop: lässt die Snake-Hub-Hintergründe über den ganzen Bildschirm fallen.
// Ein durchsichtiges Fenster pro Bildschirm, immer im Vordergrund, alle Klicks gehen durch.

const { app, BrowserWindow, Tray, Menu, screen, nativeTheme, nativeImage } = require('electron')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { SCENES } = require('./scenes.js')

const DIR = path.join(os.homedir(), '.snake-hub')
const FILE = path.join(DIR, 'desktop.json')
const DEFAULTS = { an: true, theme: 'herbst', modus: 'dunkel', staerke: 'normal' }
const NAMEN = {
  herbst: '🍂 Herbstlaub', herbstnacht: '🍁 Herbstnacht', sakura: '🌸 Sakura', mitternacht: '🌙 Mitternacht',
  ozean: '🌊 Ozean', wald: '🌲 Wald', schnee: '❄️ Schnee', regen: '🌧️ Regen', lagerfeuer: '🔥 Lagerfeuer',
}
const STAERKEN = { dezent: 'Dezent', normal: 'Normal', kraeftig: 'Kräftig' }

let settings = { ...DEFAULTS }
let windows = []
let tray = null

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
  const zeigen = settings.an && SCENES[settings.theme] !== undefined
  for (const w of windows) {
    if (w.isDestroyed()) continue
    if (!zeigen) {
      w.hide()
      continue
    }
    w.webContents.send('szene', { svg: szene(), staerke: settings.staerke })
    w.showInactive()
  }
  menue()
}

function fensterBauen() {
  for (const w of windows) if (!w.isDestroyed()) w.destroy()
  windows = screen.getAllDisplays().map(d => {
    const w = new BrowserWindow({
      x: d.bounds.x, y: d.bounds.y, width: d.bounds.width, height: d.bounds.height,
      transparent: true, frame: false, resizable: false, movable: false, focusable: false,
      skipTaskbar: true, hasShadow: false, show: false, fullscreenable: false,
      backgroundColor: '#00000000',
      webPreferences: { preload: path.join(__dirname, 'preload.js'), backgroundThrottling: false },
    })
    w.setAlwaysOnTop(true, 'screen-saver')
    w.setVisibleOnAllWorkspaces(true)
    w.setIgnoreMouseEvents(true)
    w.loadFile(path.join(__dirname, 'overlay.html'))
    w.webContents.on('did-finish-load', () => anwenden())
    return w
  })
}

function menue() {
  if (tray === null) return
  const autostart = app.getLoginItemSettings().openAtLogin
  tray.setToolTip(settings.an ? `Snake-Desktop: ${NAMEN[settings.theme] || settings.theme}` : 'Snake-Desktop: aus')
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: settings.an ? 'Ausschalten' : 'Einschalten', click: () => schreiben({ an: !settings.an }) },
    { type: 'separator' },
    { label: 'Theme', submenu: Object.entries(NAMEN).map(([id, name]) => ({ label: name, type: 'radio', checked: settings.theme === id, click: () => schreiben({ theme: id, an: true }) })) },
    { label: 'Stärke', submenu: Object.entries(STAERKEN).map(([id, name]) => ({ label: name, type: 'radio', checked: settings.staerke === id, click: () => schreiben({ staerke: id }) })) },
    { label: 'Hell / Dunkel', submenu: [['dunkel', 'Dunkel'], ['hell', 'Hell'], ['auto', 'Wie Windows']].map(([id, name]) => ({ label: name, type: 'radio', checked: settings.modus === id, click: () => schreiben({ modus: id }) })) },
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

    // Der Snake-Hub in Claude schreibt dieselbe Datei: Änderungen dort gelten sofort hier.
    fs.mkdirSync(DIR, { recursive: true })
    fs.watchFile(FILE, { interval: 1000 }, () => {
      settings = lesen()
      anwenden()
    })
    screen.on('display-added', fensterBauen)
    screen.on('display-removed', fensterBauen)
    screen.on('display-metrics-changed', fensterBauen)
  })
  app.on('window-all-closed', e => e.preventDefault())
}
