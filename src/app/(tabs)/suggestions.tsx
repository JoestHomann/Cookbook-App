import { Text, View } from "react-native";

import { ScreenScaffold } from "@/components/ScreenScaffold";
import { sharedStyles } from "@/utils/theme";

export default function SuggestionsRoute() {
  return (
    <ScreenScaffold
      eyebrow="Suggestions"
      title="Recipe ideas"
      description="Rule-based suggestions from saved recipes will appear here once recipe storage exists."
    >
      <View style={sharedStyles.panel}>
        <Text style={sharedStyles.panelTitle}>Suggestions queued up</Text>
        <Text style={sharedStyles.bodyText}>
          WP-10 will score saved recipes by common tags, quick recipes, and
          recency, then show a reason for each card.
        </Text>
      </View>
    </ScreenScaffold>
  );
}
