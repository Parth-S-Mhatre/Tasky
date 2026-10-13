import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useRouter, type Href } from "expo-router";
import { useGoogleAuth } from "../state/useGoogleAuth";
import { GoogleButton } from "./GoogleButton";
import { palette } from "../core/theme";

export function GoogleSignInSection({ active }: { active: "login" | "register" }) {
  const router = useRouter();
  const google = useGoogleAuth(() => router.replace("/home" as Href));

  return (
    <>
      {google.error ? <Text style={styles.error}>{google.error}</Text> : null}
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.or}>or {active === "login" ? "log in" : "sign up"} with</Text>
        <View style={styles.line} />
      </View>
      <GoogleButton
        loading={google.loading}
        disabled={!google.ready}
        onPress={() => void google.start()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  error: { color: palette.danger, textAlign: "center", marginTop: 12 },
  divider: { flexDirection: "row", alignItems: "center", marginTop: 20, gap: 12 },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: palette.border },
  or: { color: palette.muted, fontSize: 13 },
});
