import { Href, Link, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

import { ScreenScaffold } from "@/components/ScreenScaffold";
import { StateMessage } from "@/components/StateMessage";
import { TagRow } from "@/components/TagRow";
import { getRecipeById } from "@/data/recipeRepository";
import { Ingredient } from "@/models/Ingredient";
import { Recipe } from "@/models/Recipe";
import { colors, radii, sharedStyles, spacing } from "@/utils/theme";

function formatIngredient(ingredient: Ingredient) {
  const quantity = [ingredient.amount, ingredient.unit]
    .filter((part) => part !== undefined && part !== "")
    .join(" ");
  const note = ingredient.note ? ` (${ingredient.note})` : "";

  return `${quantity ? `${quantity} ` : ""}${ingredient.name}${note}`;
}

function formatMeta(recipe: Recipe) {
  const meta = [];

  if (recipe.cookingTimeMinutes) {
    meta.push(`${recipe.cookingTimeMinutes} min`);
  }

  if (recipe.servings) {
    meta.push(`${recipe.servings} servings`);
  }

  return meta.join(" · ");
}

export default function RecipeDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipeId = Array.isArray(id) ? id[0] : id;
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  const loadRecipe = useCallback(async () => {
    if (!recipeId) {
      setIsLoading(false);
      setRecipe(null);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      setRecipe(await getRecipeById(recipeId));
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : String(caughtError)
      );
    } finally {
      setIsLoading(false);
    }
  }, [recipeId]);

  useFocusEffect(
    useCallback(() => {
      loadRecipe();
    }, [loadRecipe])
  );

  if (isLoading) {
    return (
      <ScreenScaffold eyebrow="Recipe Detail" title="Loading recipe">
        <View style={styles.loading}>
          <ActivityIndicator color={colors.leaf} size="large" />
        </View>
      </ScreenScaffold>
    );
  }

  if (error) {
    return (
      <ScreenScaffold eyebrow="Recipe Detail" title="Something went wrong">
        <StateMessage
          actionLabel="Try again"
          body={error}
          onAction={loadRecipe}
          title="Recipe could not load"
        />
      </ScreenScaffold>
    );
  }

  if (!recipe) {
    return (
      <ScreenScaffold eyebrow="Recipe Detail" title="Recipe not found">
        <StateMessage
          body="This recipe is no longer saved in your cookbook."
          title="Nothing here"
        />
      </ScreenScaffold>
    );
  }

  const mainImage = recipe.images.find((image) => image.isMainImage);
  const otherImages = recipe.images.filter((image) => image.id !== mainImage?.id);

  return (
    <ScreenScaffold
      eyebrow="Recipe Detail"
      title={recipe.title}
      description={recipe.description}
    >
      {mainImage ? (
        <Image source={{ uri: mainImage.uri }} style={styles.heroImage} />
      ) : (
        <View style={styles.heroPlaceholder}>
          <Text style={styles.heroInitial}>
            {recipe.title.slice(0, 1).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.actionRow}>
        <Link asChild href={`/recipes/${recipe.id}/edit` as Href}>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Edit</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.metaPanel}>
        {formatMeta(recipe) ? (
          <Text style={styles.metaText}>{formatMeta(recipe)}</Text>
        ) : null}
        <TagRow tags={recipe.tags} />
      </View>

      {otherImages.length > 0 ? (
        <Section title="Images">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.imageStrip}>
              {otherImages.map((image) => (
                <Image
                  key={image.id}
                  source={{ uri: image.uri }}
                  style={styles.thumbnail}
                />
              ))}
            </View>
          </ScrollView>
        </Section>
      ) : null}

      <Section title="Ingredients">
        {recipe.ingredients.map((ingredient) => (
          <Text key={ingredient.id} style={styles.listItem}>
            {formatIngredient(ingredient)}
          </Text>
        ))}
      </Section>

      <Section title="Instructions">
        {recipe.instructions.map((instruction, index) => (
          <View key={`${index}-${instruction}`} style={styles.step}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
            <Text style={styles.stepText}>{instruction}</Text>
          </View>
        ))}
      </Section>
    </ScreenScaffold>
  );
}

function Section({
  children,
  title
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <View style={sharedStyles.panel}>
      <Text style={sharedStyles.panelTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    gap: spacing.md
  },
  heroImage: {
    aspectRatio: 16 / 10,
    backgroundColor: colors.surface,
    borderRadius: radii.panel,
    width: "100%"
  },
  heroInitial: {
    color: colors.leaf,
    fontSize: 54,
    fontWeight: "900"
  },
  heroPlaceholder: {
    alignItems: "center",
    aspectRatio: 16 / 10,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.panel,
    borderWidth: 1,
    justifyContent: "center",
    width: "100%"
  },
  imageStrip: {
    flexDirection: "row",
    gap: spacing.md
  },
  listItem: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24
  },
  loading: {
    alignItems: "center",
    minHeight: 180,
    justifyContent: "center"
  },
  metaPanel: {
    gap: spacing.md
  },
  metaText: {
    color: colors.leaf,
    fontSize: 15,
    fontWeight: "900"
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.leaf,
    borderRadius: radii.button,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  primaryButtonText: {
    color: colors.onLeaf,
    fontSize: 15,
    fontWeight: "800"
  },
  sectionContent: {
    gap: spacing.sm
  },
  step: {
    flexDirection: "row",
    gap: spacing.md
  },
  stepNumber: {
    color: colors.leaf,
    fontSize: 16,
    fontWeight: "900",
    minWidth: 24
  },
  stepText: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    lineHeight: 24
  },
  thumbnail: {
    backgroundColor: colors.surface,
    borderRadius: radii.panel,
    height: 88,
    width: 88
  }
});
