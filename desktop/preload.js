const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('snake', {
  onSzene: fn => ipcRenderer.on('szene', (_e, data) => fn(data)),
})
