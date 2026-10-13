import React from "react";
import { View, StyleSheet } from "react-native";
import { palette } from "../src/core/theme";

// The root route is only a handoff while auth state is restored. Keep it clear
// so the old onboarding preview never flashes during startup.
export default function IndexRoute() {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
});
