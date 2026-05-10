import { Href, Link } from "expo-router";
import { Text, View } from "react-native";

import { PlaceholderLink } from "@/components/PlaceholderLink";
import { ScreenScaffold } from "@/components/ScreenScaffold";
import { sharedStyles } from "@/utils/theme";

export default function RecipesRoute() {
  return (
    <ScreenScaffold
      eyebrow="Recipes"
      title="Your cookbook"
      description="Saved recipes will appear here with images, tags, cooking time, search, and filters."
    >
      <View style={sharedStyles.panel}>
        <Text style={sharedStyles.panelTitle}>WP-02 placeholder</Text>
        <Text style={sharedStyles.bodyText}>
          The SQLite-backed recipe list lands in WP-05. This action verifies the
          detail route now.
        </Text>
        <PlaceholderLink href="/recipes/demo-recipe">
          Open sample recipe detail
        </PlaceholderLink>
      </View>
      <Link href={"/add-recipe" as Href} style={sharedStyles.textLink}>
        Add a recipe
      </Link>
    </ScreenScaffold>
  );
}