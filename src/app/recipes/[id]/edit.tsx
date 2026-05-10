import { Href, router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { RecipeForm } from "@/components/RecipeForm";
import { ScreenScaffold } from "@/components/ScreenScaffold";
import { StateMessage } from "@/components/StateMessage";
import { getRecipeById, updateRecipe } from "@/data/recipeRepository";
import { Recipe } from "@/models/Recipe";
import { colors, spacing } from "@/utils/theme";

export default function EditRecipeRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipeId = Array.isArray(id) ? id[0] : id;
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  const loadRecipe = useCallback(async () => {
    if (!recipeId) {
      setRecipe(null);
      setIsLoading(false);
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

  async function handleSubmit(updatedRecipe: Recipe) {
    await updateRecipe(updatedRecipe);
    router.replace(`/recipes/${updatedRecipe.id}` as Href);
  }

  if (isLoading) {
    return (
      <ScreenScaffold eyebrow="Edit Recipe" title="Loading recipe">
        <View style={styles.loading}>
          <ActivityIndicator color={colors.leaf} size="large" />
        </View>
      </ScreenScaffold>
    );
  }

  if (error) {
    return (
      <ScreenScaffold eyebrow="Edit Recipe" title="Something went wrong">
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
      <ScreenScaffold eyebrow="Edit Recipe" title="Recipe not found">
        <StateMessage
          body="This recipe is no longer saved in your cookbook."
          title="Nothing here"
        />
      </ScreenScaffold>
    );
  }

  return (
    <ScreenScaffold
      eyebrow="Edit Recipe"
      title={recipe.title}
      description="Update the saved recipe details."
    >
      <RecipeForm
        initialRecipe={recipe}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 180,
    padding: spacing.lg
  }
});
