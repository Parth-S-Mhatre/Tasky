import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { palette } from "../core/theme";

/** Rounded-square check mark echoing the reference mockups. Lightweight, no image asset. */
export function AppLogo({ size = 84 }: { size?: number }) {
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size * 0.28 }]}>
      <Text style={[styles.check, { fontSize: size * 0.5 }]}>✓</Text>
      {/* subtle confetti dots */}
      <View style={[styles.dot, { left: -10, top: 12, backgroundColor: "#FFB84D" }]} />
      <View style={[styles.dot, { right: -8, top: 20, backgroundColor: "#5B5BD6" }]} />
      <View style={[styles.dot, { left: 6, bottom: -6, backgroundColor: "#9AA0FF" }]} />
      <View style={[styles.dot, { right: 8, bottom: 6, backgroundColor: "#7ED6A7" }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5B5BD6",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  check: { color: "#fff", fontWeight: "800" },
  dot: { position: "absolute", width: 8, height: 8, borderRadius: 4 },
});
