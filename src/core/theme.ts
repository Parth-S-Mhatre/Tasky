import { MD3LightTheme as DefaultTheme } from "react-native-paper";

// Quiet lavender surfaces and deep violet accents keep the UI branded without
// relying on gradients or oversized decorative effects.
export const palette = {
  primary: "#7042D2",
  primaryDark: "#211A32",
  primaryContainer: "#F0EAFC",
  background: "#FBFAFC",
  surface: "#FFFFFF",
  field: "#FFFFFF",
  text: "#171824",
  muted: "#777783",
  border: "#DCDCE3",
  lavender: "#DCCBFB",
  lilac: "#9C73EC",
  gold: "#D2A85F",
  success: "#2E9E63",
  warning: "#C89037",
  danger: "#FF3B30",
  low: "#EEE8F7",
  lowText: "#644792",
  medium: "#F8EFDD",
  mediumText: "#946B2D",
  high: "#F8E6E4",
  highText: "#A14B48",
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: palette.primary,
    onPrimary: "#FFFFFF",
    primaryContainer: palette.primaryContainer,
    background: palette.background,
    surface: palette.surface,
    onSurface: palette.text,
    outline: palette.border,
  },
  roundness: 16,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

/** Consistent control geometry for forms, cards, and actions. */
export const ios = {
  hairline: 1,
  radius: 14,
  radiusLarge: 22,
  buttonHeight: 54,
  fieldHeight: 54,
};

export const typefaces = {
  display: "serif" as const,
};
