import { Href, Link, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

import { PlaceholderLink } from "@/components/PlaceholderLink";
import { ScreenScaffold } from "@/components/ScreenScaffold";
import { sharedStyles } from "@/utils/theme";

export default function RecipeDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipeId = Array.isArray(id) ? id[0] : id;

  return (
    <ScreenScaffold
      eyebrow="Recipe Detail"
      title="Sample recipe"
      description={`Route is ready for recipe id: ${recipeId ?? "unknown"}. The real detail UI lands in WP-05.`}
    >
      <View style={sharedStyles.panel}>
        <Text style={sharedStyles.panelTitle}>Detail actions</Text>
        <Text style={sharedStyles.bodyText}>
          This screen will show images, ingredients, instructions, edit/delete,
          and grocery list generation.
        </Text>
        <PlaceholderLink href={`/recipes/${recipeId ?? "demo-recipe"}/edit`}>
          Open edit placeholder
        </PlaceholderLink>
        <Link href={"/grocery-list" as Href} style={sharedStyles.textLink}>
          View grocery list tab
        </Link>
      </View>
    </ScreenScaffold>
  );
}