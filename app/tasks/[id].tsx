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
import { palette, ios } from "../../src/core/theme";
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
        <Button mode="contained" onPress={() => router.back()} style={styles.primary}>
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
            <Button onPress={() => setEditing(false)} style={{ marginTop: 8 }} textColor={palette.primary}>
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
            <View
              accessible
              accessibilityRole="checkbox"
              accessibilityState={{ checked: task.completed }}
              accessibilityLabel={
                task.completed ? "Mark as incomplete" : "Mark as complete"
              }
            >
              <Checkbox
                status={task.completed ? "checked" : "unchecked"}
                onPress={() => void toggle(task.id, !task.completed)}
                color={palette.primary}
              />
            </View>
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
          <View style={styles.metaBox}>
            <Text style={styles.meta}>Due  {formatFullDate(task.dueDate)}</Text>
            <Text style={styles.meta}>Priority  {task.priority}</Text>
            <Text style={styles.meta}>Status  {task.completed ? "Completed" : "Pending"}</Text>
          </View>
          {error ? <HelperText type="error">{error}</HelperText> : null}
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => setEditing(true)}
              style={styles.primary}
              contentStyle={styles.btnContent}
              labelStyle={styles.btnLabel}
            >
              Edit
            </Button>
            <Button
              mode="outlined"
              textColor={palette.danger}
              onPress={() => setConfirm(true)}
              style={styles.destructive}
              contentStyle={styles.btnContent}
              labelStyle={styles.btnLabel}
            >
              Delete
            </Button>
          </View>
        </View>
      </ScrollView>
      <Portal>
        <Dialog visible={confirm} onDismiss={() => setConfirm(false)} style={styles.dialog}>
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
  body: { padding: 20, paddingBottom: 28 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 21,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: palette.primaryDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 1,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  title: { fontFamily: "serif", fontSize: 25, fontWeight: "700", letterSpacing: -0.2, color: palette.text, flex: 1 },
  done: { textDecorationLine: "line-through", color: palette.muted },
  desc: { fontSize: 16, color: palette.text, marginTop: 12, lineHeight: 23 },
  metaBox: { marginTop: 18, backgroundColor: palette.background, borderRadius: 16, padding: 15, gap: 9 },
  meta: { fontSize: 13, color: palette.muted },
  actions: { gap: 10, marginTop: 22 },
  primary: { backgroundColor: palette.primaryDark, borderRadius: 15 },
  btnContent: { height: ios.buttonHeight },
  btnLabel: { fontSize: 17, fontWeight: "600" },
  destructive: { borderRadius: 14, borderColor: palette.border, borderWidth: StyleSheet.hairlineWidth },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 8 },
  muted: { color: palette.muted, textAlign: "center", fontSize: 15 },
  dialog: { borderRadius: 16, backgroundColor: "#fff" },
});
