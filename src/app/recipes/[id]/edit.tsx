import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

import { ScreenScaffold } from "@/components/ScreenScaffold";
import { sharedStyles } from "@/utils/theme";

export default function EditRecipeRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipeId = Array.isArray(id) ? id[0] : id;

  return (
    <ScreenScaffold
      eyebrow="Edit Recipe"
      title="Edit placeholder"
      description={`Edit route is ready for recipe id: ${recipeId ?? "unknown"}.`}
    >
      <View style={sharedStyles.panel}>
        <Text style={sharedStyles.panelTitle}>Form destination</Text>
        <Text style={sharedStyles.bodyText}>
          WP-06 will reuse the recipe form here for editing saved recipes.
        </Text>
      </View>
    </ScreenScaffold>
  );
}
