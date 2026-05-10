import { Text, View } from "react-native";

import { ScreenScaffold } from "@/components/ScreenScaffold";
import { sharedStyles } from "@/utils/theme";

export default function RecipePreviewRoute() {
  return (
    <ScreenScaffold
      eyebrow="Recipe Preview"
      title="Review before saving"
      description="Mocked image extraction will fill this screen with editable recipe data in WP-11."
    >
      <View style={sharedStyles.panel}>
        <Text style={sharedStyles.panelTitle}>Preview route ready</Text>
        <Text style={sharedStyles.bodyText}>
          Extracted recipes will always be reviewed and edited here before they
          are saved.
        </Text>
      </View>
    </ScreenScaffold>
  );
}
