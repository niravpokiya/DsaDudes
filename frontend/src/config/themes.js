const light = {
  bg: {
    primary: "#F8FAFC",
    secondary: "#FFFFFF",
    tertiary: "#F1F5F9",
    accent: "#EEF2FF",
  },
  surface: {
    default: "#FFFFFF",
    card: "#FFFFFF",
    soft: "#F8FAFC",
    elevated: "#FFFFFF",
    code: "#F8FAFC",
    inverse: "#0F172A",
    indigo: "#EEF2FF",
    blue: "#EAF4FF",
    green: "#ECFDF5",
    amber: "#FFFBEB",
    rose: "#FFF1F2",
    violet: "#F5F3FF",
    tableHeader: "#FBFDFF",
    editor: "#0F172A",
    editorHeader: "#111827",
    editorMuted: "#94A3B8",
  },
  text: {
    primary: "#0F172A",
    secondary: "#64748B",
    body: "#475569",
    muted: "#94A3B8",
    accent: "#4F46E5",
    inverse: "#F8FAFC",
    code: "#0F172A",
  },
  accent: {
    primary: "#4F46E5",
    secondary: "#4338CA",
    light: "#818CF8",
    dark: "#312E81",
  },
  border: {
    primary: "#E2E8F0",
    secondary: "#EDF2F7",
    glass: "rgba(79, 70, 229, 0.14)",
  },
  scrollbar: {
    track: "#F1F5F9",
    thumb: "#CBD5E1",
    hover: "#94A3B8",
  },
  shadow: {
    sm: "0 1px 3px rgba(15, 23, 42, 0.05)",
    md: "0 8px 30px rgba(15, 23, 42, 0.06)",
    lg: "0 18px 60px rgba(15, 23, 42, 0.09)",
  },
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#2563EB",
};

const dark = {
  bg: {
    primary: "#0F172A",
    secondary: "#111827",
    tertiary: "#1E293B",
    accent: "#1E1B4B",
  },
  surface: {
    default: "#111827",
    card: "#1E293B",
    soft: "#162033",
    elevated: "#1E293B",
    code: "#0B1220",
    inverse: "#F8FAFC",
    indigo: "#1E1B4B",
    blue: "#172554",
    green: "#052E1B",
    amber: "#3A2A0A",
    rose: "#3B1118",
    violet: "#2E1065",
    tableHeader: "#162033",
    editor: "#0B1220",
    editorHeader: "#111827",
    editorMuted: "#94A3B8",
  },
  text: {
    primary: "#F8FAFC",
    secondary: "#CBD5E1",
    body: "#CBD5E1",
    muted: "#94A3B8",
    accent: "#818CF8",
    inverse: "#0F172A",
    code: "#F8FAFC",
  },
  accent: {
    primary: "#6366F1",
    secondary: "#818CF8",
    light: "#A5B4FC",
    dark: "#4338CA",
  },
  border: {
    primary: "#334155",
    secondary: "#243247",
    glass: "rgba(129, 140, 248, 0.18)",
  },
  scrollbar: {
    track: "#111827",
    thumb: "#475569",
    hover: "#64748B",
  },
  shadow: {
    sm: "0 1px 3px rgba(0, 0, 0, 0.24)",
    md: "0 10px 34px rgba(0, 0, 0, 0.28)",
    lg: "0 20px 70px rgba(0, 0, 0, 0.34)",
  },
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#818CF8",
};

export const themes = {
  dsaChamp: {
    name: "DSAChamp",
    light,
    dark,
  },
};

export const defaultTheme = "dsaChamp";
export const defaultMode = "light";
