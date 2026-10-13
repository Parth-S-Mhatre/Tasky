import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { palette } from "../core/theme";

/** Small standalone check mark used by the screens; the wordmark is app-icon only. */
export function BrandMark({ size = 64 }: { size?: number }) {
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <MaterialCommunityIcons name="check-bold" size={size * 0.72} color={palette.lilac} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
});
