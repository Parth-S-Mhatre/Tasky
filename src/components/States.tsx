import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, ActivityIndicator } from "react-native-paper";
import { BrandMark } from "./BrandMark";
import { palette } from "../core/theme";

export function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={styles.wrap}>
      <BrandMark size={58} />
      <Text style={styles.t}>No tasks yet</Text>
      <Text style={styles.s}>Create your first task to get started.</Text>
      <Button mode="contained" onPress={onAdd} style={styles.btn} labelStyle={styles.btnLabel}>
        Add task
      </Button>
    </View>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" />
      <Text style={styles.s}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", padding: 32, gap: 8 },
  t: { fontSize: 19, fontWeight: "700", letterSpacing: -0.3, marginTop: 12, color: palette.text },
  s: { color: palette.muted, textAlign: "center", fontSize: 15 },
  btn: { marginTop: 12, borderRadius: 12, backgroundColor: palette.primary },
  btnLabel: { fontSize: 16, fontWeight: "600" },
});
