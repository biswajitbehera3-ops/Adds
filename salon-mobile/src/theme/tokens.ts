/**
 * Grooming-tin label world: chocolate shell, cream label paper with double-rule
 * frames, burnt-orange wax seal for money and the one primary action.
 * Contrast-checked: ink on paper 14.1:1, seal on paper 5.1:1, inkMuted on paper 6.5:1,
 * creamMuted on chocolate 8.5:1, sealBright on chocolate 5.7:1.
 */
export const color = {
  choc950: "#160A06",
  choc900: "#1F0F09",
  choc: "#2A1710",
  choc700: "#3A2117",
  choc600: "#54321F",
  paper: "#F3E8D6",
  paperLight: "#FBF5EA",
  paperPressed: "#E8D8BF",
  rule: "#2A1710",
  ruleSoft: "#CDB89A",
  ink: "#2A1710",
  inkMuted: "#6B4A39",
  cream: "#F3E8D6",
  creamMuted: "#C9B49A",
  creamFaint: "rgba(243,232,214,0.16)",
  seal: "#A0471A",
  sealPressed: "#86391A",
  sealBright: "#E07A3F",
  positive: "#3F6B3A",
  danger: "#9B2C1F",
} as const;

export const font = {
  display: "RozhaOne_400Regular",
  regular: "Hind_400Regular",
  medium: "Hind_500Medium",
  semibold: "Hind_600SemiBold",
  bold: "Hind_700Bold",
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

/** Labels are printed paper: barely rounded. */
export const radius = { label: 6, control: 10, pill: 999 } as const;

/** Max width of the app column on tablets and the web preview. */
export const APP_MAX_WIDTH = 480;

/**
 * Brown glass (BUILD-SPEC 1.1), the look the app is moving to screen by screen; the
 * Calendar is the first screen built in it. Cream on the deep brown is 15:1, gold 8.6:1.
 */
export const glass = {
  glow: "#8E5B4E",
  mid: "#4A3029",
  deep: "#1A1210",
  gold: "#E4A67B",
  gold2: "#F5C9A0",
  cream: "#FFF8F1",
  soft: "rgba(255,248,241,0.72)",
  faint: "rgba(255,248,241,0.45)",
  card: "rgba(255,244,236,0.10)",
  card2: "rgba(255,244,236,0.16)",
  line: "rgba(255,244,236,0.20)",
  ink: "#2A1A12",
  ok: "#8FD6A4",
  late: "#F0A08A",
  sheet: "#4A3029",
  sheetDeep: "#221612",
  /** One colour per stylist column in the whole-salon day. */
  stylists: ["#E4A67B", "#E9B7C4", "#B9D3A0", "#B5C6EC", "#E9D59A", "#D7B3E8"],
} as const;

export const urbanist = {
  regular: "Urbanist_400Regular",
  medium: "Urbanist_500Medium",
  semibold: "Urbanist_600SemiBold",
  bold: "Urbanist_700Bold",
  heavy: "Urbanist_800ExtraBold",
} as const;
