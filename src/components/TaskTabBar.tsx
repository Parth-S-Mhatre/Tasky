import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { palette } from "../core/theme";

export function TaskTabBar({ active, date }: { active: "home" | "tasks" | "calendar"; date?: string }) {
  const router = useRouter();

  return (
    <View style={styles.bar}>
      <Pressable
        onPress={() => router.replace("/tasks")}
        style={[styles.tab, styles.tasksTab]}
        accessibilityRole="tab"
        accessibilityLabel="My Tasks"
        accessibilityState={{ selected: active === "tasks" }}
      >
        <View style={[styles.indicator, active === "tasks" && styles.activeIndicator]} />
        <MaterialCommunityIcons
          name="format-list-bulleted"
          size={24}
          color={active === "tasks" ? palette.primaryDark : palette.muted}
        />
      </Pressable>

      <Pressable
        onPress={() => router.push(date ? { pathname: "/tasks/new", params: { date } } : "/tasks/new")}
        style={styles.addButton}
        accessibilityRole="button"
        accessibilityLabel="Add a task"
      >
        <MaterialCommunityIcons name="pencil" size={24} color="#fff" />
      </Pressable>

      <Pressable
        onPress={() => router.replace("/tasks/calendar")}
        style={[styles.tab, styles.calendarTab]}
        accessibilityRole="tab"
        accessibilityLabel="Calendar"
        accessibilityState={{ selected: active === "calendar" }}
      >
        <View style={[styles.indicator, active === "calendar" && styles.activeIndicator]} />
        <MaterialCommunityIcons
          name="calendar-month-outline"
          size={24}
          color={active === "calendar" ? palette.primaryDark : palette.muted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
    paddingHorizontal: 25,
    paddingTop: 2,
    paddingBottom: 1,
  },
  tab: { flex: 1, height: 64, alignItems: "center", justifyContent: "center" },
  tasksTab: { alignItems: "center" },
  calendarTab: { alignItems: "center" },
  indicator: { width: 31, height: 3, borderRadius: 2, position: "absolute", top: 0, backgroundColor: "transparent" },
  activeIndicator: { backgroundColor: palette.primary },
  addButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: palette.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 26,
    marginTop: -11,
    borderWidth: 4,
    borderColor: "#fff",
    elevation: 4,
    shadowColor: palette.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 7,
  },
});
