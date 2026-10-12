import { MD3LightTheme as DefaultTheme } from "react-native-paper";

// Mockup-inspired palette: restrained indigo / blue-violet on neutral light bg.
export const palette = {
  primary: "#5B5BD6",
  primaryDark: "#4A4AC4",
  primaryContainer: "#E7E7FB",
  background: "#F6F6FA",
  surface: "#FFFFFF",
  text: "#1E1E2A",
  muted: "#8A8AA3",
  border: "#E6E6F0",
  success: "#2E9E63",
  warning: "#E39A2D",
  danger: "#D9534F",
  low: "#E0E7FF",
  lowText: "#4A5AC4",
  medium: "#FEF0C7",
  mediumText: "#B54708",
  high: "#FEE4E2",
  highText: "#B42318",
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
  roundness: 14,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
