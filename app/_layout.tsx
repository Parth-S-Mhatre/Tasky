import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { theme } from "../src/core/theme";
import { useAuthStore } from "../src/state/authStore";

function Gate({ children }: { children: React.ReactNode }) {
  const { user, initializing, init } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsub = init();
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initializing) return;
    const seg = segments[0] as string | undefined;
    const inAuth = seg === "login" || seg === "register";
    const onWelcome = seg === undefined;
    if (!user && !inAuth && !onWelcome) router.replace("/login");
    if (user && (inAuth || onWelcome)) router.replace("/tasks");
  }, [user, initializing, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <Gate>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="tasks/index" />
            <Stack.Screen name="tasks/new" options={{ presentation: "modal", headerShown: true, title: "New task" }} />
            <Stack.Screen name="tasks/[id]" options={{ headerShown: true, title: "Task details" }} />
          </Stack>
        </Gate>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
