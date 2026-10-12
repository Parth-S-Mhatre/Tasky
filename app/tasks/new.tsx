import React from "react";
import { ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { HelperText } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { TaskForm } from "../../src/components/TaskForm";
import { useTaskStore } from "../../src/state/taskStore";
import { palette } from "../../src/core/theme";
import type { TaskInput } from "../../src/domain/task";

export default function NewTask() {
  const router = useRouter();
  const { create, saving, error } = useTaskStore();

  const onSubmit = async (input: TaskInput) => {
    const ok = await create(input);
    if (ok) router.back();
  };

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
            saving={saving}
            error={error}
            submitLabel="Create task"
            onSubmit={onSubmit}
          />
          {error ? (
            <HelperText type="error">
              If this persists, check your connection and try again.
            </HelperText>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  body: { padding: 16 },
});
