import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import {
  Text,
  IconButton,
  FAB,
  Searchbar,
  Button,
  HelperText,
  ActivityIndicator,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/state/authStore";
import { useTaskStore } from "../../src/state/taskStore";
import { TaskCard } from "../../src/components/TaskCard";
import { FilterBar } from "../../src/components/FilterBar";
import { EmptyState } from "../../src/components/States";
import { AppLogo } from "../../src/components/AppLogo";
import {
  SECTION_ORDER,
  formatDueDate,
  sectionForDueDate,
  type DateSection,
} from "../../src/core/date";
import { palette } from "../../src/core/theme";

function todayLine(now = new Date()): string {
  return `Today, ${formatDueDate(now)}`;
}

export default function TasksDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const {
    tasks,
    loading,
    error,
    priorityFilter,
    statusFilter,
    setPriorityFilter,
    setStatusFilter,
    clearFilters,
    subscribe,
    toggle,
    remove,
    retry,
    visibleTasks,
    counts,
  } = useTaskStore();
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.uid) subscribe(user.uid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const searched = useMemo(() => {
    const base = visibleTasks();
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [query, tasks, priorityFilter, statusFilter]);

  const grouped = useMemo(() => {
    const map = new Map<DateSection, typeof searched>();
    for (const t of searched) {
      const s = sectionForDueDate(t.dueDate);
      const arr = map.get(s) ?? [];
      arr.push(t);
      map.set(s, arr);
    }
    return SECTION_ORDER.filter((s) => (map.get(s)?.length ?? 0) > 0).map(
      (s) => ({ section: s, items: map.get(s)! })
    );
  }, [searched]);

  const c = counts();
  const email = user?.email ?? "";

  const onRefresh = () => {
    setRefreshing(true);
    retry();
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Compact top header: app mark, search, logout */}
      <View style={styles.header}>
        <View style={styles.miniLogo}>
          <Text style={styles.miniLogoText}>✓</Text>
        </View>
        <Searchbar
          placeholder="Search tasks"
          value={query}
          onChangeText={setQuery}
          style={styles.search}
          inputStyle={{ fontSize: 14 }}
          accessibilityLabel="Search tasks"
        />
        <IconButton
          icon="logout"
          iconColor="#fff"
          size={22}
          onPress={() => {
            void signOut().then(() => router.replace("/login"));
          }}
          accessibilityLabel="Log out"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.dateLine}>{todayLine()}</Text>
        <Text style={styles.heading}>My tasks</Text>
        {email ? <Text style={styles.welcome}>Welcome, {email}</Text> : null}

        {/* Counts */}
        <View style={styles.counts}>
          <View style={styles.countCard}>
            <Text style={styles.countNum}>{c.total}</Text>
            <Text style={styles.countLabel}>Total</Text>
          </View>
          <View style={styles.countCard}>
            <Text style={styles.countNum}>{c.pending}</Text>
            <Text style={styles.countLabel}>Pending</Text>
          </View>
          <View style={styles.countCard}>
            <Text style={styles.countNum}>{c.completed}</Text>
            <Text style={styles.countLabel}>Done</Text>
          </View>
        </View>

        <FilterBar
          priority={priorityFilter}
          status={statusFilter}
          onPriority={setPriorityFilter}
          onStatus={setStatusFilter}
          onClear={() => {
            clearFilters();
            setQuery("");
          }}
        />

        {loading && tasks.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={palette.primary} />
            <Text style={styles.muted}>Loading your tasks…</Text>
          </View>
        ) : error && tasks.length === 0 ? (
          <View style={styles.center}>
            <AppLogo size={56} />
            <Text style={styles.errTitle}>Couldn&apos;t load tasks</Text>
            <HelperText type="error">{error}</HelperText>
            <Button mode="contained" onPress={retry} style={styles.retryBtn}>
              Retry
            </Button>
          </View>
        ) : searched.length === 0 ? (
          tasks.length === 0 ? (
            <EmptyState onAdd={() => router.push("/tasks/new")} />
          ) : (
            <View style={styles.center}>
              <Text style={styles.errTitle}>No tasks match your filters</Text>
              <Text style={styles.muted}>
                Try a different search or clear the filters.
              </Text>
              <Button
                mode="outlined"
                onPress={() => {
                  clearFilters();
                  setQuery("");
                }}
                style={{ marginTop: 12 }}
              >
                Clear filters
              </Button>
            </View>
          )
        ) : (
          grouped.map(({ section, items }) => (
            <View key={section} style={styles.section}>
              <Text style={styles.sectionTitle}>{section}</Text>
              {items.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onToggle={() => void toggle(t.id, !t.completed)}
                  onEdit={() => router.push(`/tasks/${t.id}`)}
                  onDelete={() => void remove(t.id)}
                />
              ))}
            </View>
          ))
        )}
        {error && tasks.length > 0 ? (
          <HelperText type="error" style={{ textAlign: "center" }}>
            {error}
          </HelperText>
        ) : null}
        <View style={{ height: 90 }} />
      </ScrollView>

      <FAB
        icon="plus"
        onPress={() => router.push("/tasks/new")}
        style={styles.fab}
        color="#fff"
        accessibilityLabel="Add task"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8B8BE8",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  search: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: "#fff",
    height: 44,
  },
  miniLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  miniLogoText: { color: "#5B5BD6", fontWeight: "800", fontSize: 20 },
  body: { padding: 16 },
  dateLine: { fontSize: 12, color: palette.muted },
  heading: { fontSize: 24, fontWeight: "800", color: palette.text, marginTop: 2 },
  welcome: { fontSize: 13, color: palette.muted, marginTop: 2 },
  counts: { flexDirection: "row", gap: 10, marginTop: 12 },
  countCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.border,
  },
  countNum: { fontSize: 20, fontWeight: "800", color: palette.text },
  countLabel: { fontSize: 12, color: palette.muted },
  section: { marginTop: 14 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: palette.text, marginBottom: 8 },
  center: { alignItems: "center", padding: 28, gap: 8 },
  muted: { color: palette.muted, textAlign: "center" },
  errTitle: { fontSize: 17, fontWeight: "700", color: palette.text, marginTop: 10 },
  retryBtn: { marginTop: 10, backgroundColor: palette.primary, borderRadius: 24 },
  fab: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    backgroundColor: palette.primary,
    borderRadius: 28,
  },
});
