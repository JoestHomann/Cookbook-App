import { Tabs } from "expo-router";

import { colors } from "@/utils/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.leaf,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700"
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border
        }
      }}
    >
      <Tabs.Screen name="recipes" options={{ title: "Recipes" }} />
      <Tabs.Screen name="add-recipe" options={{ title: "Add Recipe" }} />
      <Tabs.Screen name="grocery-list" options={{ title: "Grocery List" }} />
      <Tabs.Screen name="suggestions" options={{ title: "Suggestions" }} />
    </Tabs>
  );
}
