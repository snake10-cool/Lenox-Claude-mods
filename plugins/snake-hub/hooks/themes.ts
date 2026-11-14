// Die fünf Themes des Snake-Hub. Jedes hat einen hellen und einen dunklen Modus.
type Anchors = { "surface-0": string; "text-primary": string } & Partial<Record<"surface-1" | "surface-2" | "surface-3" | "text-secondary" | "text-muted", string>>
type Seed = { name: string; emoji: string; roles: Record<"accent" | "danger" | "success" | "warning" | "pro", string>; light: Anchors; dark: Anchors }
export const THEME_SEEDS: Record<string, Seed> = {
  herbst: {
    name: 'Herbstlaub', emoji: '🍂',
    roles: { accent: '#c8641e', danger: '#b33a2a', success: '#5b7d2e', warning: '#b07a12', pro: '#8a4f7a' },
    light: { 'surface-0': '#efd9b8', 'surface-1': '#f5e4c9', 'surface-2': '#faeedb', 'text-primary': '#2b2018', 'text-secondary': '#55432f', 'text-muted': '#6b5843' },
    dark: { 'surface-0': '#24160c', 'surface-1': '#2f1d10', 'surface-2': '#3a2414', 'surface-3': '#422a17', 'text-primary': '#f3e6d4', 'text-secondary': '#d6c3aa', 'text-muted': '#b09a80' },
  },
  sakura: {
    name: 'Sakura', emoji: '🌸',
    roles: { accent: '#c2406e', danger: '#b3352f', success: '#4f7d4a', warning: '#a8701a', pro: '#7a52a0' },
    light: { 'surface-0': '#f7d9e4', 'surface-1': '#fae4ec', 'surface-2': '#fcf0f4', 'text-primary': '#2c1d22', 'text-secondary': '#57404a', 'text-muted': '#6e5660' },
    dark: { 'surface-0': '#24121b', 'surface-1': '#2f1823', 'surface-2': '#3a1e2b', 'surface-3': '#412231', 'text-primary': '#f5e6eb', 'text-secondary': '#dbc3cc', 'text-muted': '#b79ba6' },
  },
  mitternacht: {
    name: 'Mitternacht', emoji: '🌙',
    roles: { accent: '#5468d4', danger: '#c0392b', success: '#3f8a5a', warning: '#b07d12', pro: '#8b5cc4' },
    light: { 'surface-0': '#d9ddf2', 'surface-1': '#e4e7f6', 'surface-2': '#eff1fa', 'text-primary': '#191c2b', 'text-secondary': '#3d4258', 'text-muted': '#555b72' },
    dark: { 'surface-0': '#0c0f22', 'surface-1': '#131730', 'surface-2': '#1a1f3d', 'surface-3': '#202645', 'text-primary': '#e6e8f4', 'text-secondary': '#c1c5da', 'text-muted': '#999fb8' },
  },
  ozean: {
    name: 'Ozean', emoji: '🌊',
    roles: { accent: '#1f7fa3', danger: '#b8402f', success: '#2f8566', warning: '#a87612', pro: '#6058b0' },
    light: { 'surface-0': '#d3ecf2', 'surface-1': '#e0f2f6', 'surface-2': '#edf8fa', 'text-primary': '#12242b', 'text-secondary': '#36505a', 'text-muted': '#4d6772' },
    dark: { 'surface-0': '#08202a', 'surface-1': '#0d2a36', 'surface-2': '#123441', 'surface-3': '#163b49', 'text-primary': '#e2f0f3', 'text-secondary': '#bcd3d9', 'text-muted': '#93afb7' },
  },
  wald: {
    name: 'Wald', emoji: '🌲',
    roles: { accent: '#3f7a3a', danger: '#b33a2a', success: '#2f7a46', warning: '#a87a12', pro: '#7a5a94' },
    light: { 'surface-0': '#d8e6cc', 'surface-1': '#e3eed9', 'surface-2': '#eff6e8', 'text-primary': '#1b2417', 'text-secondary': '#3f4c38', 'text-muted': '#56634d' },
    dark: { 'surface-0': '#0d1a0e', 'surface-1': '#132415', 'surface-2': '#192d1b', 'surface-3': '#1e3421', 'text-primary': '#e7eee2', 'text-secondary': '#c4d1bb', 'text-muted': '#9eae93' },
  },
}
