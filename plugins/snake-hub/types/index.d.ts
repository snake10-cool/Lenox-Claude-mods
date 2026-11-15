export type Fortschritt = { prozent: number; aufgabe: string; schritt: string; laeuft: boolean; manuell: boolean }
export type DesktopExtras = { groesse: string; menge: string; wind: boolean; sammeln: boolean; autopause: boolean; kontext: boolean; regeln: Record<string, string> }
export type HubSettings = {
  theme: string
  modus: string
  staerke: string
  kompakt: boolean
  ambient: string
  desk: DesktopExtras
  mods: Record<string, boolean>
  skills: Record<string, boolean>
}
export type Aktivitaet = { id: string; icon: string; text: string; fertig: boolean; fehler: boolean }
export type Statistik = { antworten: number; werkzeuge: number; dateien: string[]; start: number }
export type Fokus = { phase: string; ende: number; rest: number; runden: number }
export type Ziel = { text: string; fertig: boolean }
export type WetterInfo = { ort: string; temp: number | null; code: number | null }

declare module 'claude-code' {
  interface PluginState {
    'snake-hub': {
      fortschritt: Shaped<Fortschritt>
      settings: Shaped<HubSettings>
      aktivitaet: Shaped<Aktivitaet[]>
      statistik: Shaped<Statistik>
      tab: Shaped<string>
      fokus: Shaped<Fokus>
      notizen: Shaped<string[]>
      ziele: Shaped<Ziel[]>
      erfolge: Shaped<string[]>
      wetter: Shaped<WetterInfo>
      uhrzeit: Shaped<number>
    }
  }
}
