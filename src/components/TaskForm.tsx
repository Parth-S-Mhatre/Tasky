import React, { useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Text, TextInput, Button, SegmentedButtons, HelperText, Chip } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskInputSchema, type TaskInput, type Task } from "../domain/task";
import { addDays, formatFullDate, startOfDay } from "../core/date";
import { palette, ios } from "../core/theme";

export function TaskForm({
  initial,
  initialDueDate,
  saving,
  error,
  submitLabel,
  onSubmit,
}: {
  initial?: Task;
  initialDueDate?: Date;
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
      dueDate: initial?.dueDate ?? initialDueDate ?? new Date(),
      priority: initial?.priority ?? "medium",
    },
  });
  const [showPicker, setShowPicker] = useState(false);
  const [pickerRange, setPickerRange] = useState<"any" | "week" | "month">("any");
  const dueDate = watch("dueDate");
  const today = startOfDay(new Date());
  const dateChoices = [
    { label: "Today", date: today },
    { label: "Tomorrow", date: addDays(today, 1) },
  ];
  const weekEnd = addDays(today, 7);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const pickerMinDate = pickerRange === "any" ? undefined : today;
  const pickerMaxDate = pickerRange === "week" ? weekEnd : pickerRange === "month" ? monthEnd : undefined;
  const pickerValue = pickerMaxDate && dueDate > pickerMaxDate ? pickerMaxDate :
    pickerMinDate && dueDate < pickerMinDate ? pickerMinDate : dueDate;

  const openPicker = (range: "any" | "week" | "month") => {
    setPickerRange(range);
    setShowPicker(true);
  };

  const submit = handleSubmit(async (v) => {
    if (saving) return; // duplicate-tap guard
    await onSubmit(v);
  });

  const flatProps = {
    mode: "outlined" as const,
    outlineStyle: styles.inputOutline,
    activeOutlineColor: palette.primary,
  };

  return (
    <View>
      <Text style={styles.label}>Title</Text>
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, value }, fieldState }) => (
          <>
            <TextInput
              {...flatProps}
              placeholder="e.g. Prepare team meeting"
              value={value}
              onChangeText={onChange}
              error={!!fieldState.error}
              style={styles.input}
              contentStyle={styles.fieldContent}
            />
            {fieldState.error && (
              <HelperText type="error">{fieldState.error.message}</HelperText>
            )}
          </>
        )}
      />

      <Text style={styles.label}>Notes</Text>
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <TextInput
            {...flatProps}
            placeholder="Details, notes, links…"
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.multiline]}
            contentStyle={styles.fieldContent}
          />
        )}
      />

      <Text style={styles.label}>Due date</Text>
      <View style={styles.dateChoices}>
        {dateChoices.map((choice) => {
          const selected = dueDate.toDateString() === choice.date.toDateString();
          return (
            <Chip
              key={choice.label}
              compact
              selected={selected}
              showSelectedCheck={false}
              onPress={() => setValue("dueDate", choice.date, { shouldValidate: true, shouldDirty: true })}
              style={[styles.dateChoice, selected && styles.dateChoiceSelected]}
              textStyle={[styles.dateChoiceText, selected && styles.dateChoiceTextSelected]}
            >
              {choice.label}
            </Chip>
          );
        })}
      </View>
      <View style={styles.rangeChoices}>
        <Button
          mode="outlined"
          compact
          icon="calendar-week"
          onPress={() => openPicker("week")}
          style={styles.rangeChoice}
          contentStyle={styles.rangeChoiceContent}
          labelStyle={styles.rangeChoiceLabel}
        >
          This week
        </Button>
        <Button
          mode="outlined"
          compact
          icon="calendar-month-outline"
          onPress={() => openPicker("month")}
          style={styles.rangeChoice}
          contentStyle={styles.rangeChoiceContent}
          labelStyle={styles.rangeChoiceLabel}
        >
          This month
        </Button>
      </View>
      <Controller
        control={control}
        name="dueDate"
        render={({ fieldState }) => (
          <>
            <Button
              mode="contained-tonal"
              onPress={() => openPicker("any")}
              style={styles.dateBtn}
              contentStyle={styles.dateContent}
              textColor={palette.text}
              labelStyle={styles.dateLabel}
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
          value={pickerValue}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          minimumDate={pickerMinDate}
          maximumDate={pickerMaxDate}
          onChange={(_, d) => {
            if (Platform.OS !== "ios") setShowPicker(false);
            if (d) setValue("dueDate", d, { shouldValidate: true, shouldDirty: true });
          }}
        />
      )}
      {Platform.OS === "ios" && showPicker && (
        <Button onPress={() => setShowPicker(false)} textColor={palette.primary}>Done</Button>
      )}

      <Text style={styles.label}>Priority</Text>
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
        contentStyle={styles.submitContent}
        labelStyle={styles.submitLabel}
      >
        {submitLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "700", color: palette.text, marginTop: 18, marginBottom: 7, letterSpacing: 0.15 },
  input: { backgroundColor: "#fff", justifyContent: "center" },
  inputOutline: { borderRadius: ios.radius, borderColor: palette.border },
  multiline: { minHeight: 102 },
  fieldContent: { paddingHorizontal: 4 },
  dateBtn: { borderRadius: ios.radius, backgroundColor: palette.field },
  dateContent: { height: ios.buttonHeight },
  dateLabel: { fontSize: 16 },
  dateChoices: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 9 },
  rangeChoices: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  rangeChoice: { borderRadius: 16, borderColor: palette.border, backgroundColor: "#fff" },
  rangeChoiceContent: { minHeight: 34, paddingHorizontal: 2 },
  rangeChoiceLabel: { fontSize: 12, color: palette.text, marginVertical: 0 },
  dateChoice: { backgroundColor: "#fff", borderRadius: 16, borderColor: palette.border, borderWidth: StyleSheet.hairlineWidth },
  dateChoiceSelected: { backgroundColor: palette.primaryContainer, borderColor: palette.primary },
  dateChoiceText: { color: palette.muted, fontSize: 12, marginVertical: 0 },
  dateChoiceTextSelected: { color: palette.primary, fontWeight: "700" },
  submit: { borderRadius: 14, marginTop: 22, backgroundColor: palette.primary },
  submitContent: { height: ios.buttonHeight },
  submitLabel: { fontSize: 17, fontWeight: "600" },
});
