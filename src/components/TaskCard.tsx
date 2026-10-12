import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text, Checkbox, IconButton, Dialog, Portal, Button } from "react-native-paper";
import type { Task } from "../domain/task";
import { formatDueDate } from "../core/date";
import { palette } from "../core/theme";

const priorityStyle: Record<Task["priority"], { bg: string; fg: string; label: string }> = {
  low: { bg: palette.low, fg: palette.lowText, label: "Low" },
  medium: { bg: palette.medium, fg: palette.mediumText, label: "Medium" },
  high: { bg: palette.high, fg: palette.highText, label: "High" },
};

export function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const p = priorityStyle[task.priority];

  return (
    <>
      <View style={[styles.card, task.completed && styles.doneCard]}>
        <Checkbox.Android
          status={task.completed ? "checked" : "unchecked"}
          onPress={onToggle}
          color={palette.primary}
          accessibilityLabel={task.completed ? "Mark as incomplete" : "Mark as complete"}
        />
        <Pressable style={styles.body} onPress={onEdit} accessibilityRole="button">
          <Text
            style={[styles.title, task.completed && styles.doneTitle]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          <Text style={styles.date}>{formatDueDate(task.dueDate)}</Text>
        </Pressable>
        <View style={[styles.chip, { backgroundColor: p.bg }]}>
          <Text style={[styles.chipText, { color: p.fg }]}>{p.label}</Text>
        </View>
        <IconButton
          icon="delete-outline"
          iconColor={palette.danger}
          size={20}
          onPress={() => setConfirm(true)}
          accessibilityLabel={`Delete ${task.title}`}
        />
      </View>

      <Portal>
        <Dialog visible={confirm} onDismiss={() => setConfirm(false)}>
          <Dialog.Title>Delete task?</Dialog.Title>
          <Dialog.Content>
            <Text>“{task.title}” will be permanently removed.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirm(false)}>Cancel</Button>
            <Button
              textColor={palette.danger}
              onPress={() => {
                setConfirm(false);
                onDelete();
              }}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  doneCard: { opacity: 0.65 },
  body: { flex: 1, paddingHorizontal: 4 },
  title: { fontSize: 15, fontWeight: "600", color: palette.text },
  doneTitle: { textDecorationLine: "line-through", color: palette.muted },
  date: { fontSize: 12, color: palette.muted, marginTop: 2 },
  chip: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginRight: 2 },
  chipText: { fontSize: 11, fontWeight: "700" },
});
