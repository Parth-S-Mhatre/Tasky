import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, ActivityIndicator } from "react-native-paper";
import { AppLogo } from "./AppLogo";

export function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={styles.wrap}>
      <AppLogo size={64} />
      <Text style={styles.t}>No tasks yet</Text>
      <Text style={styles.s}>Create your first task to get started.</Text>
      <Button mode="contained" onPress={onAdd} style={styles.btn}>
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
  t: { fontSize: 18, fontWeight: "700", marginTop: 12 },
  s: { color: "#8A8AA3", textAlign: "center" },
  btn: { marginTop: 12, borderRadius: 24 },
});
