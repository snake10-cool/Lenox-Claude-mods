const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('snake', {
  onSzene: fn => ipcRenderer.on('szene', (_e, data) => fn(data)),
  // true: das Fenster nimmt gerade Klicks an (Maus über einem Blatt), false: Klicks gehen durch.
  fangen: an => ipcRenderer.send('fangen', an === true),
})
