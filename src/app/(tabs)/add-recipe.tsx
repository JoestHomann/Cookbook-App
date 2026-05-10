import { Text, View } from "react-native";

import { PlaceholderLink } from "@/components/PlaceholderLink";
import { ScreenScaffold } from "@/components/ScreenScaffold";
import { sharedStyles } from "@/utils/theme";

export default function AddRecipeRoute() {
  return (
    <ScreenScaffold
      eyebrow="Add Recipe"
      title="Manual recipe entry"
      description="This tab will become the manual recipe form first, then camera and gallery extraction later."
    >
      <View style={sharedStyles.panel}>
        <Text style={sharedStyles.panelTitle}>Upcoming form</Text>
        <Text style={sharedStyles.bodyText}>
          WP-06 adds dynamic ingredients, instruction steps, tags, validation,
          and SQLite saving.
        </Text>
        <PlaceholderLink href="/recipes/preview">
          Open recipe preview placeholder
        </PlaceholderLink>
      </View>
    </ScreenScaffold>
  );
}
