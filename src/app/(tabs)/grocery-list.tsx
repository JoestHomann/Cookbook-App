import { Text, View } from "react-native";

import { ScreenScaffold } from "@/components/ScreenScaffold";
import { sharedStyles } from "@/utils/theme";

export default function GroceryListRoute() {
  return (
    <ScreenScaffold
      eyebrow="Grocery List"
      title="Current grocery list"
      description="Generated ingredients, duplicate merging, categories, checkboxes, editing, and deletion land in WP-09."
    >
      <View style={sharedStyles.panel}>
        <Text style={sharedStyles.panelTitle}>Nothing to shop yet</Text>
        <Text style={sharedStyles.bodyText}>
          Recipe detail pages will add ingredients here with a Create grocery
          list action.
        </Text>
      </View>
    </ScreenScaffold>
  );
}
