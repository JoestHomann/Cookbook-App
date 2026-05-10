import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { DatabaseGate } from "@/components/DatabaseGate";
import { colors } from "@/utils/theme";

export default function RootLayout() {
  return (
    <DatabaseGate>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "700" }
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="recipes/[id]"
          options={{ title: "Recipe Detail" }}
        />
        <Stack.Screen
          name="recipes/[id]/edit"
          options={{ title: "Edit Recipe" }}
        />
        <Stack.Screen
          name="recipes/preview"
          options={{ title: "Recipe Preview" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </DatabaseGate>
  );
}
