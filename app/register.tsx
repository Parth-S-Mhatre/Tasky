import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Text, TextInput, Button, HelperText } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema, type AuthInput } from "../src/domain/task";
import { useAuthStore } from "../src/state/authStore";
import { AppLogo } from "../src/components/AppLogo";
import { palette } from "../src/core/theme";

export default function Register() {
  const router = useRouter();
  const { signUp, loading, error, clearError } = useAuthStore();
  const [secure, setSecure] = useState(true);
  const { control, handleSubmit, formState } = useForm<AuthInput>({
    resolver: zodResolver(authSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const submit = handleSubmit(async (v) => {
    if (loading) return;
    const ok = await signUp(v.email, v.password);
    if (ok) router.replace("/tasks");
  });

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: "center" }}><AppLogo /></View>
          <Text style={styles.h}>Let&apos;s get started!</Text>

          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value }, fieldState }) => (
              <>
                <TextInput
                  mode="outlined"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="you@example.com"
                  value={value}
                  onChangeText={(t) => { clearError(); onChange(t); }}
                  error={!!fieldState.error}
                  outlineStyle={styles.outline}
                  style={styles.input}
                />
                {fieldState.error && <HelperText type="error">{fieldState.error.message}</HelperText>}
              </>
            )}
          />

          <Text style={styles.label}>PASSWORD</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value }, fieldState }) => (
              <>
                <TextInput
                  mode="outlined"
                  secureTextEntry={secure}
                  placeholder="Min. 6 characters"
                  value={value}
                  onChangeText={(t) => { clearError(); onChange(t); }}
                  error={!!fieldState.error}
                  outlineStyle={styles.outline}
                  style={styles.input}
                  right={<TextInput.Icon icon={secure ? "eye" : "eye-off"} onPress={() => setSecure((s) => !s)} />}
                />
                {fieldState.error && <HelperText type="error">{fieldState.error.message}</HelperText>}
              </>
            )}
          />

          {error && <HelperText type="error">{error}</HelperText>}

          <Button
            mode="contained"
            onPress={submit}
            loading={loading}
            disabled={loading || !formState.isValid}
            style={styles.btn}
            contentStyle={{ height: 52 }}
          >
            Sign up
          </Button>

          <Text style={styles.switch}>
            Already an account? <Link href="/login" style={styles.link}>Log in</Link>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  wrap: { padding: 28 },
  h: { fontSize: 22, fontWeight: "800", textAlign: "center", marginVertical: 20, color: palette.text },
  label: { fontSize: 11, color: palette.muted, fontWeight: "700", marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: "#F4F4F9" },
  outline: { borderRadius: 22, borderColor: palette.border },
  btn: { borderRadius: 28, marginTop: 20, backgroundColor: palette.primary },
  switch: { textAlign: "center", marginTop: 20, color: palette.muted },
  link: { color: palette.primary, fontWeight: "700" },
});
