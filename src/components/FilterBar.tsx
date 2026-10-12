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
      <Text style={styles.h}>Priority</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {(["all", "low", "medium", "high"] as PriorityFilter[]).map((f) => (
          <Chip
            key={f}
            selected={priority === f}
            onPress={() => onPriority(f)}
            style={[styles.chip, priority === f && styles.active]}
            textStyle={{ color: priority === f ? "#fff" : palette.text }}
            showSelectedCheck={false}
          >
            {f === "all" ? "All" : f[0]!.toUpperCase() + f.slice(1)}
          </Chip>
        ))}
      </ScrollView>
      <Text style={styles.h}>Status</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {(["all", "completed", "incomplete"] as StatusFilter[]).map((f) => (
          <Chip
            key={f}
            selected={status === f}
            onPress={() => onStatus(f)}
            style={[styles.chip, status === f && styles.active]}
            textStyle={{ color: status === f ? "#fff" : palette.text }}
            showSelectedCheck={false}
          >
            {f === "all" ? "All" : f === "completed" ? "Completed" : "Pending"}
          </Chip>
        ))}
        {showClear && (
          <Chip onPress={onClear} style={styles.clear}>
            Clear
          </Chip>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  h: { fontSize: 12, fontWeight: "700", color: palette.muted, marginTop: 10, marginBottom: 6 },
  chip: { marginRight: 8, backgroundColor: "#fff", borderColor: palette.border, borderWidth: 1 },
  active: { backgroundColor: palette.primary },
  clear: { backgroundColor: palette.primaryContainer },
});
