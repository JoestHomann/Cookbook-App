import { Href, Link } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Recipe } from "@/models/Recipe";
import { colors, radii, spacing } from "@/utils/theme";

interface RecipeCardProps {
  recipe: Recipe;
}

function formatMeta(recipe: Recipe) {
  const parts = [];

  if (recipe.cookingTimeMinutes) {
    parts.push(`${recipe.cookingTimeMinutes} min`);
  }

  if (recipe.servings) {
    parts.push(`${recipe.servings} servings`);
  }

  return parts.join(" - ");
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const mainImage = recipe.images.find((image) => image.isMainImage);
  const visibleTags = recipe.tags.slice(0, 3);
  const extraTagCount = recipe.tags.length - visibleTags.length;

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
          <Text numberOfLines={2} style={styles.title}>
            {recipe.title}
          </Text>
          {formatMeta(recipe) ? (
            <Text style={styles.meta}>{formatMeta(recipe)}</Text>
          ) : null}
          {recipe.description ? (
            <Text numberOfLines={2} style={styles.description}>
              {recipe.description}
            </Text>
          ) : null}
          {visibleTags.length > 0 ? (
            <View style={styles.tags}>
              {visibleTags.map((tag) => (
                <Text key={tag} style={styles.tag}>
                  {tag}
                </Text>
              ))}
              {extraTagCount > 0 ? (
                <Text style={styles.tag}>+{extraTagCount}</Text>
              ) : null}
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
    minHeight: 132,
    overflow: "hidden"
  },
  content: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: "center",
    paddingRight: spacing.md,
    paddingVertical: spacing.md
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  image: {
    backgroundColor: colors.surface,
    height: 132,
    width: 112
  },
  imagePlaceholder: {
    alignItems: "center",
    backgroundColor: colors.surface,
    height: 132,
    justifyContent: "center",
    width: 112
  },
  meta: {
    color: colors.leaf,
    fontSize: 13,
    fontWeight: "800"
  },
  placeholderText: {
    color: colors.leaf,
    fontSize: 34,
    fontWeight: "900"
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
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23
  }
});
