import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import {
  Text,
  IconButton,
  Searchbar,
  Button,
  HelperText,
  ActivityIndicator,
  Portal,
  Dialog,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/state/authStore";
import { useTaskStore } from "../../src/state/taskStore";
import { TaskCard } from "../../src/components/TaskCard";
import { FilterBar } from "../../src/components/FilterBar";
import { EmptyState } from "../../src/components/States";
import { TaskTabBar } from "../../src/components/TaskTabBar";
import { AppDrawer } from "../../src/components/AppDrawer";
import { BrandMark } from "../../src/components/BrandMark";
import {
  SECTION_ORDER,
  formatDueDate,
  sectionForDueDate,
  type DateSection,
} from "../../src/core/date";
import { palette, ios } from "../../src/core/theme";

/** Computed once per session — the date doesn't change while the app is open. */
const TODAY_LINE = `Today, ${formatDueDate(new Date())}`;

export default function TasksDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
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
  } = useTaskStore();

  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Track which task ID is pending deletion (null = dialog closed).
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const pendingDeleteTitle = useRef<string>("");

  // Track refreshing state; dismiss once the store finishes loading.
  const [refreshing, setRefreshing] = useState(false);
  const prevLoading = useRef(loading);
  useEffect(() => {
    if (prevLoading.current && !loading) {
      setRefreshing(false);
    }
    prevLoading.current = loading;
  }, [loading]);

  useEffect(() => {
    if (user?.uid) subscribe(user.uid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // Memoised filtered+sorted task list.
  const searched = useMemo(() => {
    const base = visibleTasks();
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
    // visibleTasks reads tasks/priorityFilter/statusFilter from the store.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, tasks, priorityFilter, statusFilter]);

  // Group visible tasks by due-date section.
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

  // Stable handler refs — prevents TaskCard from re-rendering due to new
  // inline arrow functions on every parent render.
  const handleToggle = useCallback(
    (id: string, completed: boolean) => void toggle(id, completed),
    [toggle]
  );
  const handleEdit = useCallback(
    (id: string) => router.push(`/tasks/${id}`),
    [router]
  );
  const handleDeleteRequest = useCallback((id: string, title: string) => {
    pendingDeleteTitle.current = title;
    setPendingDeleteId(id);
  }, []);
  const handleDeleteConfirm = useCallback(() => {
    if (pendingDeleteId) void remove(pendingDeleteId);
    setPendingDeleteId(null);
  }, [pendingDeleteId, remove]);
  const handleDeleteCancel = useCallback(() => setPendingDeleteId(null), []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    retry();
    // Safety fallback: if the store doesn't resolve within 5s, clear the spinner.
    const t = setTimeout(() => setRefreshing(false), 5000);
    return () => clearTimeout(t);
  }, [retry]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
    setQuery("");
  }, [clearFilters]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      {/* ── Navigation header ── */}
      <View style={styles.nav}>
        <View style={styles.navTop}>
          <View style={styles.navIdentity}>
            <AppDrawer active="tasks" />
            <Text style={styles.dateLine}>{TODAY_LINE}</Text>
          </View>
          <Text style={styles.taskCountTop}>{tasks.length} {tasks.length === 1 ? "task" : "tasks"}</Text>
        </View>
        <Text style={styles.largeTitle}>My tasks</Text>
        <View style={styles.searchRow}>
          <Searchbar
            placeholder="Search tasks"
            value={query}
            onChangeText={setQuery}
            style={styles.search}
            inputStyle={styles.searchInput}
            iconColor={palette.muted}
            placeholderTextColor={palette.muted}
            accessibilityLabel="Search tasks"
          />
          <IconButton
            icon="tune-variant"
            mode={filtersOpen ? "contained" : "contained-tonal"}
            containerColor={filtersOpen ? palette.primaryContainer : "#fff"}
            iconColor={palette.primary}
            size={21}
            onPress={() => setFiltersOpen((open) => !open)}
            accessibilityLabel={filtersOpen ? "Hide task filters" : "Show task filters"}
            style={styles.filterButton}
          />
        </View>
      </View>

      {/* ── Task list ── */}
      <ScrollView
        style={styles.contentWrap}
        contentContainerStyle={styles.body}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filtersOpen ? <FilterBar
          priority={priorityFilter}
          status={statusFilter}
          onPriority={setPriorityFilter}
          onStatus={setStatusFilter}
          onClear={handleClearFilters}
        /> : null}

        {loading && tasks.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={palette.primary} />
            <Text style={styles.muted}>Loading your tasks…</Text>
          </View>
        ) : error && tasks.length === 0 ? (
          <View style={styles.center}>
            <BrandMark size={50} />
            <Text style={styles.errTitle}>Couldn&apos;t load tasks</Text>
            <HelperText type="error">{error}</HelperText>
            <Button
              mode="contained"
              onPress={retry}
              style={styles.retryBtn}
              labelStyle={styles.retryLabel}
            >
              Retry
            </Button>
          </View>
        ) : searched.length === 0 ? (
          tasks.length === 0 ? (
            <EmptyState onAdd={() => router.push("/tasks/new")} />
          ) : (
            <View style={styles.center}>
              <Text style={styles.errTitle}>No matching tasks</Text>
              <Text style={styles.muted}>
                Try a different search or clear the filters.
              </Text>
              <Button
                mode="outlined"
                onPress={handleClearFilters}
                style={styles.clearBtn}
                textColor={palette.primary}
              >
                Clear filters
              </Button>
            </View>
          )
        ) : (
          grouped.map(({ section, items }) => (
            <View key={section} style={styles.section}>
              <View style={styles.sectionHead}>
                <View style={styles.sectionHeading}>
                  <View style={styles.sectionDot} />
                  <Text style={styles.sectionTitle}>{section}</Text>
                </View>
                <Text style={styles.sectionCount}>{items.length}</Text>
              </View>
              <View style={styles.groupCard}>
                {items.map((t, index) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onToggle={() => handleToggle(t.id, !t.completed)}
                    onEdit={() => handleEdit(t.id)}
                    onDeleteRequest={() => handleDeleteRequest(t.id, t.title)}
                    grouped
                    divider={index < items.length - 1}
                  />
                ))}
              </View>
            </View>
          ))
        )}

        {error && tasks.length > 0 ? (
          <HelperText type="error" style={styles.inlineError}>
            {error}
          </HelperText>
        ) : null}
        <View style={{ height: 32 }} />
      </ScrollView>

      <TaskTabBar active="tasks" />

      {/* ── Single delete confirmation dialog for the whole list ── */}
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
  safe: { flex: 1, backgroundColor: "#fff" },
  nav: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 15,
  },
  navTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  navIdentity: { flexDirection: "row", alignItems: "center" },
  dateLine: { fontSize: 12, fontWeight: "500", color: palette.text },
  taskCountTop: { fontSize: 12, color: palette.muted },
  largeTitle: {
    fontSize: 29,
    fontWeight: "700",
    letterSpacing: -0.7,
    color: palette.text,
    marginBottom: 13,
  },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  contentWrap: {
    flex: 1,
    backgroundColor: palette.background,
  },
  body: { paddingHorizontal: 17, paddingTop: 11, paddingBottom: 14, flexGrow: 1 },
  search: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 11,
    height: 44,
    elevation: 0,
    borderWidth: 1,
    borderColor: palette.border,
  },
  searchInput: { fontSize: 14, paddingBottom: 0, minHeight: 40, color: palette.text },
  filterButton: { margin: 0, width: 44, height: 44, borderRadius: 11, borderWidth: 1, borderColor: palette.border },
  section: { marginTop: 8, marginBottom: 5 },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 7, paddingHorizontal: 1 },
  sectionHeading: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: palette.primary },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.text,
  },
  sectionCount: { fontSize: 12, fontWeight: "500", color: palette.muted },
  groupCard: { backgroundColor: "#fff", borderRadius: 13, paddingHorizontal: 12, borderWidth: 1, borderColor: "#ECEBF0" },
  center: { alignItems: "center", padding: 28, gap: 8 },
  muted: { color: palette.muted, textAlign: "center", fontSize: 15 },
  errTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.text,
    marginTop: 10,
  },
  retryBtn: {
    marginTop: 10,
    backgroundColor: palette.primary,
    borderRadius: 11,
  },
  retryLabel: { fontSize: 16, fontWeight: "600" },
  clearBtn: { marginTop: 12, borderRadius: 12, borderColor: palette.border },
  inlineError: { textAlign: "center" },
  dialog: { borderRadius: 16, backgroundColor: "#fff" },
  dialogTitle: { fontSize: 18, fontWeight: "700" },
});
