import React, { useState } from "react";
import { Modal, Pressable, SafeAreaView, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "react-native-paper";
import { useRouter, type Href } from "expo-router";
import { useAuthStore } from "../state/authStore";
import { palette } from "../core/theme";

type Destination = "home" | "tasks" | "calendar" | "settings";

const items: { key: Destination; label: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"]; route: string }[] = [
  { key: "home", label: "Home", icon: "home-outline", route: "/home" },
  { key: "tasks", label: "My Tasks", icon: "format-list-bulleted", route: "/tasks" },
  { key: "calendar", label: "Calendar", icon: "calendar-month-outline", route: "/tasks/calendar" },
  { key: "settings", label: "Settings", icon: "cog-outline", route: "/settings" },
];

export function AppDrawer({ active }: { active: Destination }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const email = useAuthStore((state) => state.user?.email ?? "");
  const signOut = useAuthStore((state) => state.signOut);
  const initials = email ? email.slice(0, 1).toUpperCase() : "T";

  const goTo = (route: string) => {
    setOpen(false);
    router.replace(route as Href);
  };

  const logOut = async () => {
    setOpen(false);
    await signOut();
    router.replace("/login");
  };

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={styles.trigger} accessibilityRole="button" accessibilityLabel="Open navigation menu">
        <MaterialCommunityIcons name="menu" size={23} color={palette.text} />
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modal}>
          <Pressable style={styles.scrim} onPress={() => setOpen(false)} accessibilityLabel="Close navigation menu" />
          <SafeAreaView style={styles.panel}>
            <View style={styles.profile}>
              <View style={styles.avatar}><Text style={styles.initial}>{initials}</Text></View>
              <View style={styles.account}>
                <Text style={styles.name}>Tasky account</Text>
                <Text style={styles.email} numberOfLines={1}>{email}</Text>
              </View>
            </View>
            <View style={styles.navigation}>
              {items.map((item) => (
                <Pressable
                  key={item.key}
                  onPress={() => goTo(item.route)}
                  style={[styles.item, active === item.key && styles.activeItem]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active === item.key }}
                >
                  <MaterialCommunityIcons name={item.icon} size={19} color={active === item.key ? "#fff" : "#D4DBEB"} />
                  <Text style={[styles.itemText, active === item.key && styles.activeText]}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => void logOut()} style={styles.logout} accessibilityRole="button">
              <MaterialCommunityIcons name="logout-variant" size={18} color="#D4DBEB" />
              <Text style={styles.itemText}>Log out</Text>
            </Pressable>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#F3F1F6", alignItems: "center", justifyContent: "center", marginRight: 10 },
  modal: { flex: 1, flexDirection: "row", backgroundColor: "rgba(13,20,36,0.38)" },
  scrim: { ...StyleSheet.absoluteFillObject },
  panel: { width: 286, maxWidth: "82%", backgroundColor: "#172440", paddingHorizontal: 16, paddingTop: 15, paddingBottom: 18 },
  profile: { minHeight: 64, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(226,232,245,0.2)", paddingBottom: 15 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#8570E8", alignItems: "center", justifyContent: "center", marginRight: 11 },
  initial: { color: "#fff", fontSize: 16, fontWeight: "700" },
  account: { flex: 1 },
  name: { color: "#fff", fontSize: 13, fontWeight: "600" },
  email: { color: "#B7C0D2", fontSize: 10, marginTop: 3 },
  navigation: { paddingTop: 18, gap: 6 },
  item: { minHeight: 42, borderRadius: 10, flexDirection: "row", alignItems: "center", paddingHorizontal: 11, gap: 11 },
  activeItem: { backgroundColor: "#31446C" },
  itemText: { color: "#D4DBEB", fontSize: 13, fontWeight: "500" },
  activeText: { color: "#fff", fontWeight: "600" },
  logout: { marginTop: "auto", minHeight: 44, flexDirection: "row", alignItems: "center", paddingHorizontal: 11, gap: 11 },
});
