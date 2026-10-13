import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppDrawer } from "../src/components/AppDrawer";
import { useAuthStore } from "../src/state/authStore";
import { palette } from "../src/core/theme";

export default function Settings() {
  const email = useAuthStore((state) => state.user?.email ?? "");
  const initial = email.slice(0, 1).toUpperCase() || "T";

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerStart}>
            <AppDrawer active="settings" />
            <Text style={styles.date}>YOUR ACCOUNT</Text>
          </View>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.avatar}><Text style={styles.initial}>{initial}</Text></View>
          <View style={styles.account}>
            <Text style={styles.name}>Signed in as</Text>
            <Text style={styles.email}>{email}</Text>
          </View>
        </View>

        <Text style={styles.section}>ABOUT TASKY</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Made for a little more clarity.</Text>
          <Text style={styles.infoText}>Your tasks are saved to your account and stay available when you sign in again.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  page: { flex: 1, paddingHorizontal: 20, paddingTop: 6 },
  header: { marginBottom: 20 },
  headerStart: { flexDirection: "row", alignItems: "center" },
  date: { color: palette.muted, fontSize: 10, fontWeight: "700", letterSpacing: 1.2 },
  title: { color: palette.text, fontSize: 30, fontWeight: "700", letterSpacing: -0.6, marginTop: 4 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: palette.border, padding: 16 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#8570E8", alignItems: "center", justifyContent: "center", marginRight: 12 },
  initial: { color: "#fff", fontSize: 16, fontWeight: "700" },
  account: { flex: 1 },
  name: { color: palette.muted, fontSize: 12 },
  email: { color: palette.text, fontSize: 14, fontWeight: "600", marginTop: 3 },
  section: { color: palette.muted, fontSize: 10, fontWeight: "700", letterSpacing: 1.2, marginTop: 26, marginBottom: 9 },
  infoCard: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: palette.border, padding: 16 },
  infoTitle: { color: palette.text, fontSize: 14, fontWeight: "600" },
  infoText: { color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },
});
