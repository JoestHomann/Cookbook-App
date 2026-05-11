import { Href, Link } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { SuggestedRecipe } from "@/models/Suggestion";
import { colors, radii, spacing } from "@/utils/theme";

interface SuggestionCardProps {
  suggestion: SuggestedRecipe;
}

function formatMeta(suggestion: SuggestedRecipe) {
  const parts = [];

  if (suggestion.recipe.cookingTimeMinutes) {
    parts.push(`${suggestion.recipe.cookingTimeMinutes} min`);
  }

  if (suggestion.recipe.servings) {
    parts.push(`${suggestion.recipe.servings} servings`);
  }

  return parts.join(" - ");
}

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const { recipe } = suggestion;
  const mainImage = recipe.images.find((image) => image.isMainImage);
  const visibleTags = recipe.tags.slice(0, 3);

  return (
    <Link asChild href={`/recipes/${recipe.id}` as Href}>
      <Pressable style={styles.card}>
        {mainImage ? (
          <Image source={{ uri: mainImage.uri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>
              {recipe.title.slice(0, 1).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text numberOfLines={2} style={styles.title}>
              {recipe.title}
            </Text>
            <Text style={styles.score}>{suggestion.score}</Text>
          </View>
          <Text style={styles.reason}>{suggestion.reason}</Text>
          {formatMeta(suggestion) ? (
            <Text style={styles.meta}>{formatMeta(suggestion)}</Text>
          ) : null}
          {visibleTags.length > 0 ? (
            <View style={styles.tags}>
              {visibleTags.map((tag) => (
                <Text key={tag} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radii.panel,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 144,
    overflow: "hidden"
  },
  content: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: "center",
    paddingRight: spacing.md,
    paddingVertical: spacing.md
  },
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm
  },
  image: {
    backgroundColor: colors.surface,
    height: 144,
    width: 112
  },
  imagePlaceholder: {
    alignItems: "center",
    backgroundColor: colors.surface,
    height: 144,
    justifyContent: "center",
    width: 112
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  placeholderText: {
    color: colors.leaf,
    fontSize: 34,
    fontWeight: "900"
  },
  reason: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20
  },
  score: {
    backgroundColor: "#edf3ed",
    borderRadius: radii.button,
    color: colors.leaf,
    fontSize: 12,
    fontWeight: "900",
    minWidth: 32,
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    textAlign: "center"
  },
  tag: {
    backgroundColor: "#edf3ed",
    borderRadius: radii.button,
    color: colors.leaf,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs
  },
  title: {
    color: colors.text,
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23
  }
});
