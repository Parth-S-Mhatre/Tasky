import React, { memo } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text, Checkbox, IconButton } from "react-native-paper";
import type { Task } from "../domain/task";
import { formatDueDate } from "../core/date";
import { palette } from "../core/theme";

const priorityStyle: Record<Task["priority"], { bg: string; fg: string; label: string }> = {
  low: { bg: palette.low, fg: palette.lowText, label: "Low" },
  medium: { bg: palette.medium, fg: palette.mediumText, label: "Medium" },
  high: { bg: palette.high, fg: palette.highText, label: "High" },
};

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  /** Called when the user confirms deletion via the list-level dialog. */
  onDeleteRequest: () => void;
  grouped?: boolean;
  divider?: boolean;
}

/**
 * Pure task row. No Portal/Dialog here — the delete confirmation dialog is
 * owned by the list screen (one dialog for the whole list, not one per card).
 * Wrapped in React.memo so it only re-renders when its own props change.
 */
export const TaskCard = memo(function TaskCard({
  task,
  onToggle,
  onEdit,
  onDeleteRequest,
  grouped = false,
  divider = false,
}: TaskCardProps) {
  const p = priorityStyle[task.priority];

  return (
    <View style={[styles.card, grouped && styles.groupedCard, divider && styles.divider, task.completed && styles.doneCard]}>
      {/* Platform-appropriate checkbox */}
      <View
        accessible
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.completed }}
        accessibilityLabel={task.completed ? "Mark as incomplete" : "Mark as complete"}
      >
        <Checkbox
          status={task.completed ? "checked" : "unchecked"}
          onPress={onToggle}
          color={palette.primary}
        />
      </View>
      <Pressable style={styles.body} onPress={onEdit} accessibilityRole="button" accessibilityLabel={`Edit ${task.title}`}>
        <Text
          style={[styles.title, task.completed && styles.doneTitle]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.date}>{formatDueDate(task.dueDate)}</Text>
          <View style={[styles.chip, { backgroundColor: p.bg }]}>
            <Text style={[styles.chipText, { color: p.fg }]}>{p.label}</Text>
          </View>
        </View>
      </Pressable>
      <IconButton
        icon="trash-can-outline"
        iconColor={palette.muted}
        size={19}
        onPress={onDeleteRequest}
        accessibilityLabel={`Delete ${task.title}`}
        style={styles.delete}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingVertical: 7,
    paddingLeft: 1,
    paddingRight: 0,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: palette.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 1,
  },
  groupedCard: { borderWidth: 0, borderRadius: 0, paddingVertical: 3, marginBottom: 0, shadowOpacity: 0, elevation: 0 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.border },
  doneCard: { opacity: 0.6 },
  body: { flex: 1, paddingHorizontal: 5, paddingVertical: 5 },
  title: { fontSize: 14, fontWeight: "500", letterSpacing: -0.1, color: palette.text },
  doneTitle: { textDecorationLine: "line-through", color: palette.muted },
  meta: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 8 },
  date: { fontSize: 11, color: palette.muted },
  chip: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  chipText: { fontSize: 10, fontWeight: "600" },
  delete: { margin: 0, opacity: 0.55, width: 34 },
});
