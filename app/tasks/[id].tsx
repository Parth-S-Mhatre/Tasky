import React, { useState } from "react";
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import {
  Text,
  Button,
  Dialog,
  Portal,
  HelperText,
  ActivityIndicator,
  Checkbox,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TaskForm } from "../../src/components/TaskForm";
import { useTaskStore } from "../../src/state/taskStore";
import { formatFullDate } from "../../src/core/date";
import { palette } from "../../src/core/theme";
import type { TaskInput } from "../../src/domain/task";

/** Task details + edit. Tapping Edit swaps the read-only view for the form. */
export default function TaskDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tasks, loading, update, toggle, remove, saving, error } =
    useTaskStore();
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const task = tasks.find((t) => t.id === id);

  if (loading && !task) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={styles.muted}>Loading task…</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Task not found</Text>
        <Text style={styles.muted}>It may have been deleted.</Text>
        <Button mode="contained" onPress={() => router.back()} style={styles.btn}>
          Go back
        </Button>
      </View>
    );
  }

  const onSubmit = async (input: TaskInput) => {
    const ok = await update(task.id, input);
    if (ok) setEditing(false);
  };

  if (editing) {
    return (
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
          >
            <TaskForm
              initial={task}
              saving={saving}
              error={error}
              submitLabel="Save changes"
              onSubmit={onSubmit}
            />
            <Button onPress={() => setEditing(false)} style={{ marginTop: 8 }}>
              Cancel
            </Button>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Checkbox.Android
              status={task.completed ? "checked" : "unchecked"}
              onPress={() => void toggle(task.id, !task.completed)}
              color={palette.primary}
              accessibilityLabel={
                task.completed ? "Mark as incomplete" : "Mark as complete"
              }
            />
            <Text
              style={[styles.title, task.completed && styles.done]}
              accessibilityRole="header"
            >
              {task.title}
            </Text>
          </View>
          {task.description ? (
            <Text style={styles.desc}>{task.description}</Text>
          ) : null}
          <Text style={styles.meta}>
            Due {formatFullDate(task.dueDate)}  •  {task.priority} priority  •{" "}
            {task.completed ? "Completed" : "Pending"}
          </Text>
          {error ? <HelperText type="error">{error}</HelperText> : null}
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => setEditing(true)}
              style={styles.btn}
            >
              Edit
            </Button>
            <Button
              mode="outlined"
              textColor={palette.danger}
              onPress={() => setConfirm(true)}
            >
              Delete
            </Button>
          </View>
        </View>
      </ScrollView>
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
                void remove(task.id).then(() => router.back());
              }}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  body: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.border,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  title: { fontSize: 20, fontWeight: "800", color: palette.text, flex: 1 },
  done: { textDecorationLine: "line-through", color: palette.muted },
  desc: { fontSize: 15, color: palette.text, marginTop: 12, lineHeight: 22 },
  meta: { fontSize: 13, color: palette.muted, marginTop: 12 },
  actions: { flexDirection: "row", gap: 10, marginTop: 18 },
  btn: { backgroundColor: palette.primary, borderRadius: 24 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 8 },
  muted: { color: palette.muted, textAlign: "center" },
});
