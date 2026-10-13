import React, { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { HelperText, TextInput, Button, Text } from "react-native-paper";
import { Link, useRouter, type Href } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema, type AuthInput } from "../src/domain/task";
import { useAuthStore } from "../src/state/authStore";
import { isGoogleConfigured } from "../src/core/google";
import { GoogleSignInSection } from "../src/components/GoogleSignInSection";
import { AuthShell } from "../src/components/AuthShell";
import { palette, ios } from "../src/core/theme";

export default function Login() {
  const router = useRouter();
  const { signIn, sendPasswordReset, loading, error, clearError } = useAuthStore();
  const [secure, setSecure] = useState(true);
  const [resetNotice, setResetNotice] = useState("");
  const { control, handleSubmit, formState, getValues } = useForm<AuthInput>({
    resolver: zodResolver(authSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const submit = handleSubmit(async (values) => {
    if (loading) return;
    if (await signIn(values.email, values.password)) router.replace("/home" as Href);
  });

  const handlePasswordReset = async () => {
    clearError();
    setResetNotice("");
    const email = authSchema.shape.email.safeParse(getValues("email"));
    if (!email.success) {
      setResetNotice("Enter a valid email address first.");
      return;
    }
    if (await sendPasswordReset(email.data)) {
      setResetNotice("Password reset link sent. Check your email.");
    }
  };

  return (
    <AuthShell active="login" footer={<Text style={styles.switch}>Don&apos;t have an account? <Link href="/register" style={styles.link}>Get started</Link></Text>}>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value }, fieldState }) => (
          <>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              mode="outlined"
              placeholder="you@example.com"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              returnKeyType="next"
              right={value.length > 0 && !fieldState.error ? <TextInput.Icon icon="check-circle" color={palette.primary} disabled /> : undefined}
              value={value}
              onChangeText={(text) => { clearError(); setResetNotice(""); onChange(text); }}
              error={!!fieldState.error}
              style={styles.input}
              outlineStyle={styles.outline}
              contentStyle={styles.fieldContent}
              activeOutlineColor={palette.primary}
            />
            {fieldState.error && <HelperText type="error">{fieldState.error.message}</HelperText>}
          </>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value }, fieldState }) => (
          <>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              mode="outlined"
              placeholder="Your password"
              secureTextEntry={secure}
              autoComplete="current-password"
              returnKeyType="done"
              onSubmitEditing={submit}
              right={<TextInput.Icon icon={secure ? "eye-outline" : "eye-off-outline"} onPress={() => setSecure((current) => !current)} />}
              value={value}
              onChangeText={(text) => { clearError(); onChange(text); }}
              error={!!fieldState.error}
              style={styles.input}
              outlineStyle={styles.outline}
              contentStyle={styles.fieldContent}
              activeOutlineColor={palette.primary}
            />
            {fieldState.error && <HelperText type="error">{fieldState.error.message}</HelperText>}
          </>
        )}
      />

      {error && <HelperText type="error" style={styles.error}>{error}</HelperText>}
      {resetNotice ? (
        <Text style={[styles.forgot, resetNotice.startsWith("Password") && styles.resetSuccess]}>{resetNotice}</Text>
      ) : (
        <Pressable onPress={() => void handlePasswordReset()} disabled={loading} accessibilityRole="button" style={styles.forgotWrap}>
          <Text style={styles.forgot}>Forgot password?</Text>
        </Pressable>
      )}
      <Button
        mode="contained"
        onPress={submit}
        loading={loading}
        disabled={loading || !formState.isValid}
        style={styles.primary}
        contentStyle={styles.primaryContent}
        labelStyle={styles.primaryLabel}
      >
        Log in
      </Button>
      {isGoogleConfigured && <GoogleSignInSection active="login" />}
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  label: { color: palette.text, fontSize: 11, fontWeight: "600", letterSpacing: 1.15, marginTop: 14, marginBottom: 7 },
  input: { backgroundColor: "#fff", marginBottom: 4 },
  outline: { borderRadius: 10, borderColor: palette.border },
  fieldContent: { minHeight: ios.fieldHeight },
  error: { marginTop: 8, lineHeight: 19 },
  forgotWrap: { alignSelf: "flex-end", paddingVertical: 10 },
  forgot: { color: palette.primary, fontSize: 13, fontWeight: "500" },
  resetSuccess: { color: palette.success, alignSelf: "stretch", textAlign: "right", lineHeight: 19 },
  primary: { borderRadius: 12, marginTop: 12, backgroundColor: palette.primary },
  primaryContent: { height: ios.buttonHeight },
  primaryLabel: { fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },
  switch: { color: palette.muted, fontSize: 13 },
  link: { color: palette.primary, fontWeight: "600" },
});
