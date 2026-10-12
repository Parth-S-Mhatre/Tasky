import React, { useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Text, TextInput, Button, SegmentedButtons, HelperText } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskInputSchema, type TaskInput, type Task } from "../domain/task";
import { formatFullDate } from "../core/date";
import { palette } from "../core/theme";

export function TaskForm({
  initial,
  saving,
  error,
  submitLabel,
  onSubmit,
}: {
  initial?: Task;
  saving: boolean;
  error: string | null;
  submitLabel: string;
  onSubmit: (input: TaskInput) => Promise<void>;
}) {
  const { control, handleSubmit, formState, setValue, watch } = useForm<TaskInput>({
    resolver: zodResolver(taskInputSchema),
    mode: "onChange",
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      dueDate: initial?.dueDate ?? new Date(),
      priority: initial?.priority ?? "medium",
    },
  });
  const [showPicker, setShowPicker] = useState(false);
  const dueDate = watch("dueDate");

  const submit = handleSubmit(async (v) => {
    if (saving) return; // duplicate-tap guard
    await onSubmit(v);
  });

  return (
    <View>
      <Text style={styles.label}>TITLE</Text>
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, value }, fieldState }) => (
          <>
            <TextInput
              mode="outlined"
              placeholder="e.g. Prepare team meeting"
              value={value}
              onChangeText={onChange}
              error={!!fieldState.error}
              style={styles.input}
              outlineStyle={styles.outline}
            />
            {fieldState.error && (
              <HelperText type="error">{fieldState.error.message}</HelperText>
            )}
          </>
        )}
      />

      <Text style={styles.label}>DESCRIPTION (OPTIONAL)</Text>
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <TextInput
            mode="outlined"
            placeholder="Details, notes, links…"
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={3}
            style={styles.input}
            outlineStyle={styles.outline}
          />
        )}
      />

      <Text style={styles.label}>DUE DATE</Text>
      <Controller
        control={control}
        name="dueDate"
        render={({ fieldState }) => (
          <>
            <Button
              mode="outlined"
              onPress={() => setShowPicker(true)}
              style={styles.dateBtn}
              textColor={palette.text}
            >
              {formatFullDate(dueDate)}
            </Button>
            {fieldState.error && (
              <HelperText type="error">{fieldState.error.message}</HelperText>
            )}
          </>
        )}
      />
      {showPicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(_, d) => {
            if (Platform.OS !== "ios") setShowPicker(false);
            if (d) setValue("dueDate", d, { shouldValidate: true });
          }}
        />
      )}
      {Platform.OS === "ios" && showPicker && (
        <Button onPress={() => setShowPicker(false)}>Done</Button>
      )}

      <Text style={styles.label}>PRIORITY</Text>
      <Controller
        control={control}
        name="priority"
        render={({ field: { onChange, value } }) => (
          <SegmentedButtons
            value={value}
            onValueChange={(v) => onChange(v)}
            buttons={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
            style={{ marginBottom: 8 }}
          />
        )}
      />

      {error && <HelperText type="error">{error}</HelperText>}

      <Button
        mode="contained"
        onPress={submit}
        loading={saving}
        disabled={saving || !formState.isValid}
        style={styles.submit}
        contentStyle={{ height: 52 }}
      >
        {submitLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11, color: palette.muted, fontWeight: "700", marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: "#fff" },
  outline: { borderRadius: 14, borderColor: palette.border },
  dateBtn: { borderRadius: 14, borderColor: palette.border, backgroundColor: "#fff" },
  submit: { borderRadius: 28, marginTop: 20, backgroundColor: palette.primary },
});
