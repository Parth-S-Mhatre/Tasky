import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandMark } from "./BrandMark";
import { palette } from "../core/theme";

export function AuthShell({
  active,
  footer,
  children,
}: {
  active: "login" | "register";
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <BrandMark size={68} />
            <Text style={styles.hero}>
              {active === "login" ? "Welcome back!" : "Let’s get started!"}
            </Text>
          </View>

          <View style={styles.card}>{children}</View>
          <View style={styles.footer}>{footer}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 26, paddingTop: 28, paddingBottom: 26 },
  brand: { alignItems: "center", paddingBottom: 34 },
  hero: { color: palette.text, fontSize: 30, lineHeight: 38, fontWeight: "700", textAlign: "center", marginTop: 16, maxWidth: 330, letterSpacing: -0.6 },
  card: { width: "100%", maxWidth: 430, alignSelf: "center", backgroundColor: "#fff", paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 },
  footer: { marginTop: 30, alignItems: "center", justifyContent: "center" },
});
