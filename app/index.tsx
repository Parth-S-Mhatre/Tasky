import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AppLogo } from "../src/components/AppLogo";
import { palette } from "../src/core/theme";

/** Welcome/onboarding panel inspired by reference: "Get things done." + forward action. */
export default function Onboarding() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        <View style={styles.center}>
          <AppLogo />
          <Text style={styles.title}>Get things done.</Text>
          <Text style={styles.sub}>Just a click away from{"\n"}planning your tasks.</Text>
          <View style={styles.dots}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
        </View>
        <View style={styles.actions}>
          <Button mode="text" onPress={() => router.push("/login")}>
            Log in
          </Button>
          <Button mode="contained" onPress={() => router.push("/register")} style={styles.cta}>
            Get started →
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.primary, justifyContent: "center", padding: 20 },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 32, minHeight: 480, justifyContent: "space-between" },
  center: { alignItems: "center", marginTop: 40 },
  title: { fontSize: 22, fontWeight: "800", marginTop: 24, color: palette.text },
  sub: { color: palette.muted, textAlign: "center", marginTop: 8, lineHeight: 20 },
  dots: { flexDirection: "row", marginTop: 16, gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#D9D9E8" },
  dotActive: { backgroundColor: palette.primary },
  actions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cta: { borderRadius: 24, backgroundColor: palette.primary },
});
