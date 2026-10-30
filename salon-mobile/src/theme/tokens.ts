/** Max width of the app column on tablets and the web preview. */
export const APP_MAX_WIDTH = 480;

/**
 * Brown glass (BUILD-SPEC 1.1), the app's one look: brown studio backdrop, frosted cards,
 * gold for money and the one main action, Urbanist type. Cream on the deep brown is 15:1, gold 8.6:1.
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
