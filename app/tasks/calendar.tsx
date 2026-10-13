import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Dialog, IconButton, Portal, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { TaskCard } from "../../src/components/TaskCard";
import { TaskTabBar } from "../../src/components/TaskTabBar";
import { AppDrawer } from "../../src/components/AppDrawer";
import { useAuthStore } from "../../src/state/authStore";
import { useTaskStore } from "../../src/state/taskStore";
import { addMonths, dateKey, formatFullDate } from "../../src/core/date";
import { palette, ios } from "../../src/core/theme";
import type { Priority, Task } from "../../src/domain/task";

const PRIORITY_DOT: Record<Priority, string> = {
  low: palette.lowText,
  medium: palette.mediumText,
  high: palette.danger,
};
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function monthGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function tasksByDay(tasks: Task[]): Map<string, Task[]> {
  const map = new Map<string, Task[]>();
  for (const task of tasks) {
    const key = dateKey(task.dueDate);
    const current = map.get(key) ?? [];
    current.push(task);
    map.set(key, current);
  }
  return map;
}

export default function TaskCalendar() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { tasks, loading, error, subscribe, toggle, remove, retry } = useTaskStore();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const pendingDeleteTitle = useRef<string>("");
  const monthYear = selectedDate.getFullYear();
  const monthIndex = selectedDate.getMonth();
  const month = useMemo(
    () => new Date(monthYear, monthIndex, 1),
    [monthYear, monthIndex]
  );
  const cells = useMemo(() => monthGrid(month), [month]);
  const byDay = useMemo(() => tasksByDay(tasks), [tasks]);
  const selectedTasks = byDay.get(dateKey(selectedDate)) ?? [];
  const monthLabel = selectedDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const todayKey = dateKey(new Date());

  useEffect(() => {
    if (user?.uid) subscribe(user.uid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const changeMonth = (offset: number) => {
    setSelectedDate((current) => addMonths(current, offset));
  };

  const handleDeleteRequest = useCallback((id: string, title: string) => {
    pendingDeleteTitle.current = title;
    setPendingDeleteId(id);
  }, []);
  const handleDeleteConfirm = useCallback(() => {
    if (pendingDeleteId) void remove(pendingDeleteId);
    setPendingDeleteId(null);
  }, [pendingDeleteId, remove]);
  const handleDeleteCancel = useCallback(() => setPendingDeleteId(null), []);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.headerMain}>
            <View style={styles.menuLine}>
              <AppDrawer active="calendar" />
              <Text style={styles.eyebrow}>PLAN YOUR DAYS</Text>
            </View>
            <Text style={styles.title}>Calendar</Text>
          </View>
          <IconButton
            icon="plus"
            mode="contained-tonal"
            iconColor={palette.primary}
            containerColor={palette.primaryContainer}
            onPress={() => router.push({ pathname: "/tasks/new", params: { date: dateKey(selectedDate) } })}
            accessibilityLabel="Add task for selected date"
          />
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.monthRow}>
            <Text style={styles.monthTitle}>{monthLabel}</Text>
            <View style={styles.monthButtons}>
              <IconButton
                icon="chevron-left"
                size={22}
                onPress={() => changeMonth(-1)}
                accessibilityLabel="Previous month"
              />
              <IconButton
                icon="chevron-right"
                size={22}
                onPress={() => changeMonth(1)}
                accessibilityLabel="Next month"
              />
            </View>
          </View>

          <View style={styles.grid}>
            {WEEKDAYS.map((weekday, index) => (
              <Text key={`${weekday}-${index}`} style={styles.weekday}>{weekday}</Text>
            ))}
            {cells.map((day) => {
              const key = dateKey(day);
              const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
              const isSelected = key === dateKey(selectedDate);
              const dayTasks = byDay.get(key) ?? [];
              const priorities = Array.from(new Set(dayTasks.map((task) => task.priority)));
              return (
                <Pressable
                  key={key}
                  onPress={() => setSelectedDate(day)}
                  style={styles.dayCell}
                  accessibilityRole="button"
                  accessibilityLabel={`${formatFullDate(day)}, ${dayTasks.length} tasks`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <View
                    style={[
                      styles.dayNumberWrap,
                      isSelected && styles.selectedDay,
                      key === todayKey && !isSelected && styles.todayDay,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        !isCurrentMonth && styles.outsideMonth,
                        isSelected && styles.selectedDayText,
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                  </View>
                  <View style={styles.dots}>
                    {priorities.slice(0, 3).map((priority) => (
                      <View
                        key={priority}
                        style={[styles.dot, { backgroundColor: PRIORITY_DOT[priority] }]}
                      />
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.legend}>
            {(["high", "medium", "low"] as Priority[]).map((priority) => (
              <View key={priority} style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: PRIORITY_DOT[priority] }]} />
                <Text style={styles.legendText}>{priority[0]!.toUpperCase() + priority.slice(1)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.dayHeader}>
          <View>
            <Text style={styles.dayEyebrow}>{dateKey(selectedDate) === todayKey ? "TODAY" : "SELECTED DAY"}</Text>
            <Text style={styles.dayTitle}>{formatFullDate(selectedDate)}</Text>
          </View>
          <Text style={styles.taskCount}>{selectedTasks.length} {selectedTasks.length === 1 ? "task" : "tasks"}</Text>
        </View>

        {loading && tasks.length === 0 ? (
          <View style={styles.empty}><ActivityIndicator color={palette.primary} /><Text style={styles.emptyText}>Loading your tasks…</Text></View>
        ) : error && tasks.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Couldn’t load tasks</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <Text onPress={retry} style={styles.retry}>Try again</Text>
          </View>
        ) : selectedTasks.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nothing scheduled</Text>
            <Text style={styles.emptyText}>Add a task for this day to see it here.</Text>
            <Text
              onPress={() => router.push({ pathname: "/tasks/new", params: { date: dateKey(selectedDate) } })}
              style={styles.retry}
            >
              Add a task
            </Text>
          </View>
        ) : (
          <View style={styles.groupCard}>
          {selectedTasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => void toggle(task.id, !task.completed)}
              onEdit={() => router.push(`/tasks/${task.id}`)}
              onDeleteRequest={() => handleDeleteRequest(task.id, task.title)}
              grouped
              divider={index < selectedTasks.length - 1}
            />
          ))}
          </View>
        )}
      </ScrollView>
      <TaskTabBar active="calendar" date={dateKey(selectedDate)} />

      {/* Single delete confirmation dialog for the calendar task list */}
      <Portal>
        <Dialog
          visible={pendingDeleteId !== null}
          onDismiss={handleDeleteCancel}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Delete task?</Dialog.Title>
          <Dialog.Content>
            <Text>&quot;{pendingDeleteTitle.current}&quot; will be permanently removed.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleDeleteCancel}>Cancel</Button>
            <Button textColor={palette.danger} onPress={handleDeleteConfirm}>
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
  scroll: { padding: 20, paddingBottom: 22 },
  header: {
    backgroundColor: "#fff",
    borderRadius: 16,
    minHeight: 85,
    paddingHorizontal: 21,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerMain: { flex: 1 },
  menuLine: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  eyebrow: { fontSize: 10, color: palette.muted, fontWeight: "700", letterSpacing: 1.2 },
  title: { color: palette.text, fontSize: 28, fontWeight: "700", letterSpacing: -0.5, marginTop: 2 },
  calendarCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: palette.border,
  },
  groupCard: { backgroundColor: "#fff", borderRadius: 13, paddingHorizontal: 12, borderWidth: 1, borderColor: "#ECEBF0" },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 7 },
  monthTitle: { fontFamily: "serif", fontSize: 20, fontWeight: "700", color: palette.text, letterSpacing: -0.2 },
  monthButtons: { flexDirection: "row", marginRight: -8 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  weekday: { width: `${100 / 7}%`, textAlign: "center", color: palette.muted, fontSize: 12, fontWeight: "700", paddingVertical: 7 },
  dayCell: { width: `${100 / 7}%`, height: 47, alignItems: "center", justifyContent: "flex-start", paddingTop: 3 },
  dayNumberWrap: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "transparent" },
  selectedDay: { backgroundColor: palette.primaryDark, borderColor: palette.primaryDark },
  todayDay: { borderColor: palette.lilac },
  dayNumber: { fontSize: 14, color: palette.text, fontWeight: "600" },
  selectedDayText: { color: "#fff", fontWeight: "800" },
  outsideMonth: { color: "#C4C4CC", fontWeight: "400" },
  dots: { height: 7, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 3, marginTop: -1 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  legend: { flexDirection: "row", justifyContent: "center", gap: 18, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.border, paddingTop: 11, marginTop: 6 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendText: { color: palette.muted, fontSize: 11, fontWeight: "600" },
  dayHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 23, marginBottom: 10 },
  dayEyebrow: { color: palette.lowText, fontSize: 10, fontWeight: "800", letterSpacing: 1.1 },
  dayTitle: { color: palette.text, fontFamily: "serif", fontSize: 22, fontWeight: "700", marginTop: 3 },
  taskCount: { color: palette.muted, fontSize: 13, marginBottom: 3 },
  empty: { minHeight: 132, alignItems: "center", justifyContent: "center", padding: 20, gap: 8, backgroundColor: "#fff", borderRadius: ios.radiusLarge, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.border },
  emptyTitle: { color: palette.text, fontSize: 16, fontWeight: "700" },
  emptyText: { color: palette.muted, fontSize: 13, textAlign: "center" },
  retry: { color: palette.primary, fontSize: 14, fontWeight: "700", marginTop: 3, padding: 6 },
  dialog: { borderRadius: 16, backgroundColor: "#fff" },
  dialogTitle: { fontSize: 18, fontWeight: "700" },
});
