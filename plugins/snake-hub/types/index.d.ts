export type Fortschritt = { prozent: number; aufgabe: string; schritt: string; laeuft: boolean; manuell: boolean }
export type HubSettings = { theme: string; mods: Record<string, boolean>; skills: Record<string, boolean> }
export type Aktivitaet = { id: string; icon: string; text: string; fertig: boolean; fehler: boolean }
export type Statistik = { antworten: number; werkzeuge: number; dateien: string[]; start: number }

declare module 'claude-code' {
  interface PluginState {
    'snake-hub': {
      fortschritt: Shaped<Fortschritt>
      settings: Shaped<HubSettings>
      aktivitaet: Shaped<Aktivitaet[]>
      statistik: Shaped<Statistik>
    }
  }
}
