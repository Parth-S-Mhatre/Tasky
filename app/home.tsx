import React, { useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Checkbox, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AppDrawer } from "../src/components/AppDrawer";
import { TaskTabBar } from "../src/components/TaskTabBar";
import { useAuthStore } from "../src/state/authStore";
import { useTaskStore } from "../src/state/taskStore";
import { dateKey, formatFullDate } from "../src/core/date";
import { palette } from "../src/core/theme";

export default function Home() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { tasks, subscribe, toggle, loading } = useTaskStore();

  useEffect(() => {
    if (user?.uid) subscribe(user.uid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const todayKey = dateKey(new Date());
  const todayTasks = useMemo(() => tasks.filter((task) => dateKey(task.dueDate) === todayKey), [tasks, todayKey]);
  const completed = todayTasks.filter((task) => task.completed).length;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topLine}>
          <View style={styles.identity}>
            <AppDrawer active="home" />
            <Text style={styles.date}>{formatFullDate(new Date())}</Text>
          </View>
        </View>
        <Text style={styles.title}>Your day</Text>
        <Text style={styles.subtitle}>A little progress goes a long way.</Text>

        <View style={styles.summary}>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryEyebrow}>TODAY&apos;S FOCUS</Text>
            <Text style={styles.summaryTitle}>{todayTasks.length === 0 ? "A fresh page" : `${todayTasks.length - completed} to go`}</Text>
            <Text style={styles.summaryText}>{todayTasks.length === 0 ? "Nothing on your list for today." : `${completed} of ${todayTasks.length} completed`}</Text>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressValue}>{todayTasks.length ? `${Math.round((completed / todayTasks.length) * 100)}%` : "—"}</Text>
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Today</Text>
          <Text style={styles.sectionCount}>{todayTasks.length}</Text>
        </View>
        {todayTasks.length > 0 ? (
          <View style={styles.taskGroup}>
            {todayTasks.map((task, index) => (
              <View key={task.id} style={[styles.taskRow, index < todayTasks.length - 1 && styles.taskDivider]}>
                <Checkbox status={task.completed ? "checked" : "unchecked"} onPress={() => void toggle(task.id, !task.completed)} color={palette.primary} />
                <Text style={[styles.taskTitle, task.completed && styles.taskDone]} numberOfLines={1} onPress={() => router.push(`/tasks/${task.id}`)}>{task.title}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{loading ? "Loading your tasks…" : "Nothing scheduled yet"}</Text>
            <Text style={styles.emptyText}>Add a task for today or take a look at the week ahead.</Text>
          </View>
        )}
        <Button mode="text" onPress={() => router.push("/tasks")} textColor={palette.primary} contentStyle={styles.allTasks}>
          View all tasks
        </Button>
      </ScrollView>
      <TaskTabBar active="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 6, paddingBottom: 20 },
  topLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  identity: { flexDirection: "row", alignItems: "center" },
  date: { color: palette.text, fontSize: 12 },
  title: { color: palette.text, fontSize: 32, fontWeight: "700", letterSpacing: -0.8, marginTop: 14 },
  subtitle: { color: palette.muted, fontSize: 14, marginTop: 4 },
  summary: { backgroundColor: "#EFE9F9", borderRadius: 16, marginTop: 23, padding: 17, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  summaryCopy: { flex: 1 },
  summaryEyebrow: { color: palette.lowText, fontSize: 10, fontWeight: "700", letterSpacing: 1.1 },
  summaryTitle: { color: palette.text, fontSize: 23, fontWeight: "700", marginTop: 7 },
  summaryText: { color: palette.muted, fontSize: 12, marginTop: 2 },
  progressCircle: { width: 58, height: 58, borderRadius: 29, backgroundColor: "#fff", borderWidth: 3, borderColor: palette.lilac, alignItems: "center", justifyContent: "center", marginLeft: 12 },
  progressValue: { color: palette.primaryDark, fontSize: 13, fontWeight: "700" },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 26, marginBottom: 9 },
  sectionTitle: { color: palette.text, fontSize: 17, fontWeight: "700" },
  sectionCount: { color: palette.muted, fontSize: 12 },
  taskGroup: { backgroundColor: "#fff", borderRadius: 13, paddingHorizontal: 12, borderWidth: 1, borderColor: "#ECEBF0" },
  taskRow: { minHeight: 54, flexDirection: "row", alignItems: "center" },
  taskDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.border },
  taskTitle: { flex: 1, color: palette.text, fontSize: 14, fontWeight: "500" },
  taskDone: { color: palette.muted, textDecorationLine: "line-through" },
  empty: { borderRadius: 13, backgroundColor: "#fff", padding: 19, borderWidth: 1, borderColor: "#ECEBF0" },
  emptyTitle: { color: palette.text, fontSize: 14, fontWeight: "600" },
  emptyText: { color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  allTasks: { height: 48, marginTop: 7 },
});
