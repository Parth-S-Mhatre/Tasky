import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Chip, Text } from "react-native-paper";
import type { PriorityFilter, StatusFilter } from "../domain/task";
import { palette } from "../core/theme";

export function FilterBar({
  priority,
  status,
  onPriority,
  onStatus,
  onClear,
}: {
  priority: PriorityFilter;
  status: StatusFilter;
  onPriority: (f: PriorityFilter) => void;
  onStatus: (f: StatusFilter) => void;
  onClear: () => void;
}) {
  const showClear = priority !== "all" || status !== "all";
  return (
    <View>
      <Text style={styles.h}>PRIORITY</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {(["all", "low", "medium", "high"] as PriorityFilter[]).map((f) => (
          <Chip
            key={f}
            selected={priority === f}
            onPress={() => onPriority(f)}
            style={[styles.chip, priority === f && styles.active]}
            textStyle={[styles.chipText, priority === f && styles.activeText]}
            showSelectedCheck={false}
          >
            {f === "all" ? "All" : f[0]!.toUpperCase() + f.slice(1)}
          </Chip>
        ))}
      </ScrollView>
      <Text style={styles.h}>STATUS</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {(["all", "completed", "incomplete"] as StatusFilter[]).map((f) => (
          <Chip
            key={f}
            selected={status === f}
            onPress={() => onStatus(f)}
            style={[styles.chip, status === f && styles.active]}
            textStyle={[styles.chipText, status === f && styles.activeText]}
            showSelectedCheck={false}
          >
            {f === "all" ? "All" : f === "completed" ? "Completed" : "Pending"}
          </Chip>
        ))}
        {showClear && (
          <Chip onPress={onClear} style={styles.clear} textStyle={styles.clearText}>
            Clear
          </Chip>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  h: { fontSize: 10, fontWeight: "800", letterSpacing: 1.1, color: palette.muted, marginTop: 17, marginBottom: 8 },
  chip: {
    marginRight: 8,
    backgroundColor: "#fff",
    borderColor: palette.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    height: 34,
  },
  chipText: { fontSize: 14, color: palette.text },
  active: { backgroundColor: palette.primaryContainer, borderColor: palette.lavender },
  activeText: { color: palette.primaryDark, fontWeight: "700" },
  clear: { backgroundColor: palette.primaryContainer, borderRadius: 16, height: 34 },
  clearText: { color: palette.primary, fontWeight: "600", fontSize: 14 },
});
