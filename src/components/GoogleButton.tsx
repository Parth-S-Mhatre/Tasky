import React from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { palette } from "../core/theme";

export function GoogleButton({
  loading,
  disabled,
  onPress,
}: {
  loading: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={styles.btn}
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
    >
      {loading ? <ActivityIndicator color={palette.primary} /> : <AntDesign name="google" size={25} color={palette.text} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderColor: palette.border,
    backgroundColor: "#fff",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    elevation: 2,
    shadowColor: "#19151F",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
});
