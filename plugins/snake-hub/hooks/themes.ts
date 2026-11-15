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
  herbstnacht: {
    name: 'Herbstnacht', emoji: '🍁',
    roles: { accent: '#d0702a', danger: '#c0402f', success: '#6b8a3a', warning: '#c08a1e', pro: '#9a5a8a' },
    light: { 'surface-0': '#e8d6c6', 'surface-1': '#efe0d2', 'surface-2': '#f6ebe0', 'text-primary': '#2a1a14', 'text-secondary': '#523a2e', 'text-muted': '#6a5044' },
    dark: { 'surface-0': '#170d12', 'surface-1': '#21131a', 'surface-2': '#2b1a21', 'surface-3': '#331f27', 'text-primary': '#f1e2d6', 'text-secondary': '#d4bfb0', 'text-muted': '#b09a8c' },
  },
  schnee: {
    name: 'Schnee', emoji: '❄️',
    roles: { accent: '#3a78b8', danger: '#b8402f', success: '#3a8460', warning: '#a87a1a', pro: '#6a5ab0' },
    light: { 'surface-0': '#e4ebf3', 'surface-1': '#edf2f8', 'surface-2': '#f6f9fc', 'text-primary': '#16202c', 'text-secondary': '#3a4a5c', 'text-muted': '#516174' },
    dark: { 'surface-0': '#0e1622', 'surface-1': '#142030', 'surface-2': '#1a293c', 'surface-3': '#1f3044', 'text-primary': '#e6eef8', 'text-secondary': '#c2d0e2', 'text-muted': '#9aabc2' },
  },
  regen: {
    name: 'Regen', emoji: '🌧️',
    roles: { accent: '#4a7a9c', danger: '#b8452f', success: '#3f8060', warning: '#a87c1e', pro: '#6a5aa0' },
    light: { 'surface-0': '#dde3e9', 'surface-1': '#e6ebf0', 'surface-2': '#f0f3f6', 'text-primary': '#1a2028', 'text-secondary': '#3e4854', 'text-muted': '#54606c' },
    dark: { 'surface-0': '#11161c', 'surface-1': '#171e26', 'surface-2': '#1d2630', 'surface-3': '#222c37', 'text-primary': '#e4e9ef', 'text-secondary': '#c0c9d3', 'text-muted': '#98a4b1' },
  },
  lagerfeuer: {
    name: 'Lagerfeuer', emoji: '🔥',
    roles: { accent: '#e0682a', danger: '#c8402a', success: '#6a8a3a', warning: '#d09a20', pro: '#a05a7a' },
    light: { 'surface-0': '#f0dcc4', 'surface-1': '#f5e5d1', 'surface-2': '#faefe2', 'text-primary': '#2a1a10', 'text-secondary': '#54402c', 'text-muted': '#6c5440' },
    dark: { 'surface-0': '#140c08', 'surface-1': '#1e120b', 'surface-2': '#28180e', 'surface-3': '#301d11', 'text-primary': '#f6e6d4', 'text-secondary': '#dcc4a8', 'text-muted': '#b89c80' },
  },
  polarlicht: {
    name: 'Polarlicht', emoji: '🌌',
    roles: { accent: '#2fa88a', danger: '#c0402f', success: '#3f9a60', warning: '#b08a1e', pro: '#8a5ad0' },
    light: { 'surface-0': '#d8e6ee', 'surface-1': '#e3eef3', 'surface-2': '#eef5f8', 'text-primary': '#122028', 'text-secondary': '#36505c', 'text-muted': '#4c6672' },
    dark: { 'surface-0': '#07101a', 'surface-1': '#0c1822', 'surface-2': '#11202c', 'surface-3': '#152633', 'text-primary': '#e2f2f2', 'text-secondary': '#bcd6da', 'text-muted': '#93b2b8' },
  },
  gewitter: {
    name: 'Gewitter', emoji: '⛈️',
    roles: { accent: '#5a6ad0', danger: '#c0402f', success: '#3f8a5a', warning: '#b0801a', pro: '#7a5ab0' },
    light: { 'surface-0': '#d6dae2', 'surface-1': '#e0e3ea', 'surface-2': '#ebedf2', 'text-primary': '#161a22', 'text-secondary': '#3a414e', 'text-muted': '#525a68' },
    dark: { 'surface-0': '#0a0d14', 'surface-1': '#10141d', 'surface-2': '#161b26', 'surface-3': '#1b212d', 'text-primary': '#e4e8f0', 'text-secondary': '#c0c7d3', 'text-muted': '#98a1b0' },
  },
  strand: {
    name: 'Strand', emoji: '🏖️',
    roles: { accent: '#1f8fb0', danger: '#c0402f', success: '#3f8a5a', warning: '#b0801a', pro: '#7a5ab0' },
    light: { 'surface-0': '#f3e6cc', 'surface-1': '#f7eedb', 'surface-2': '#fbf5ea', 'text-primary': '#1e2a2e', 'text-secondary': '#41535a', 'text-muted': '#566a72' },
    dark: { 'surface-0': '#0d1630', 'surface-1': '#121d3a', 'surface-2': '#182444', 'surface-3': '#1d2a4c', 'text-primary': '#e8eef8', 'text-secondary': '#c4cfe2', 'text-muted': '#9eabc4' },
  },
  unterwasser: {
    name: 'Unterwasser', emoji: '🐠',
    roles: { accent: '#1a8fb0', danger: '#c0402f', success: '#3f8a5a', warning: '#b0801a', pro: '#7a5ab0' },
    light: { 'surface-0': '#d2eaf0', 'surface-1': '#dff1f5', 'surface-2': '#ecf7fa', 'text-primary': '#0e2228', 'text-secondary': '#30505a', 'text-muted': '#466670' },
    dark: { 'surface-0': '#031520', 'surface-1': '#071d2a', 'surface-2': '#0b2534', 'surface-3': '#0f2c3c', 'text-primary': '#dff2f8', 'text-secondary': '#b8d8e2', 'text-muted': '#8eb8c6' },
  },
  wueste: {
    name: 'Wüste', emoji: '🏜️',
    roles: { accent: '#c0702a', danger: '#c0402f', success: '#3f8a5a', warning: '#b0801a', pro: '#7a5ab0' },
    light: { 'surface-0': '#f2dfc0', 'surface-1': '#f6e8d0', 'surface-2': '#faf1e2', 'text-primary': '#2a1c10', 'text-secondary': '#54402a', 'text-muted': '#6c5640' },
    dark: { 'surface-0': '#1a0f12', 'surface-1': '#231518', 'surface-2': '#2c1b1e', 'surface-3': '#332024', 'text-primary': '#f4e6d6', 'text-secondary': '#d8c2ac', 'text-muted': '#b49c86' },
  },
  halloween: {
    name: 'Halloween', emoji: '🎃',
    roles: { accent: '#e2741e', danger: '#c0402f', success: '#3f8a5a', warning: '#b0801a', pro: '#7a5ab0' },
    light: { 'surface-0': '#ead6c6', 'surface-1': '#f0e0d2', 'surface-2': '#f6ebe0', 'text-primary': '#24141e', 'text-secondary': '#4e3444', 'text-muted': '#644a58' },
    dark: { 'surface-0': '#110818', 'surface-1': '#190c22', 'surface-2': '#21102c', 'surface-3': '#271332', 'text-primary': '#f2e4ec', 'text-secondary': '#d4bfcc', 'text-muted': '#ae98a8' },
  },
  weihnachten: {
    name: 'Weihnachten', emoji: '🎄',
    roles: { accent: '#c8382a', danger: '#c0402f', success: '#3f8a5a', warning: '#b0801a', pro: '#7a5ab0' },
    light: { 'surface-0': '#e4ebf2', 'surface-1': '#ecf1f6', 'surface-2': '#f5f8fb', 'text-primary': '#141c26', 'text-secondary': '#38465a', 'text-muted': '#4e5e72' },
    dark: { 'surface-0': '#0a1222', 'surface-1': '#0f182c', 'surface-2': '#141f36', 'surface-3': '#18243e', 'text-primary': '#e8eef8', 'text-secondary': '#c4d0e2', 'text-muted': '#9eaec4' },
  },
}
