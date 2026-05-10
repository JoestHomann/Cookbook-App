import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";

import { RecipeCard } from "@/components/RecipeCard";
import { StateMessage } from "@/components/StateMessage";
import { getAllRecipes } from "@/data/recipeRepository";
import { seedSampleRecipes } from "@/data/sampleRecipes";
import { Recipe } from "@/models/Recipe";
import { colors, spacing } from "@/utils/theme";

export default function RecipesRoute() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const loadRecipes = useCallback(async (isRefresh = false) => {
    setError(null);

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      setRecipes(await getAllRecipes());
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : String(caughtError)
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [loadRecipes])
  );

  async function handleSeedSamples() {
    setError(null);
    setIsLoading(true);

    try {
      setRecipes(await seedSampleRecipes());
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : String(caughtError)
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.content}
        data={recipes}
        keyExtractor={(recipe) => recipe.id}
        ListEmptyComponent={
          <ListEmptyState
            error={error}
            isLoading={isLoading}
            onRetry={() => loadRecipes()}
            onSeedSamples={handleSeedSamples}
          />
        }
        ListHeaderComponent={<RecipesHeader recipeCount={recipes.length} />}
        onRefresh={() => loadRecipes(true)}
        refreshing={isRefreshing}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
      />
    </SafeAreaView>
  );
}

function RecipesHeader({ recipeCount }: { recipeCount: number }) {
  return (
    <View style={styles.header}>
      <Text style={styles.eyebrow}>Recipes</Text>
      <Text style={styles.title}>Your cookbook</Text>
      <Text style={styles.description}>
        {recipeCount === 1
          ? "1 saved recipe"
          : `${recipeCount} saved recipes`}
      </Text>
    </View>
  );
}

function ListEmptyState({
  error,
  isLoading,
  onRetry,
  onSeedSamples
}: {
  error: string | null;
  isLoading: boolean;
  onRetry: () => void;
  onSeedSamples: () => void;
}) {
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.leaf} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <StateMessage
        actionLabel="Try again"
        body={error}
        onAction={onRetry}
        title="Recipes could not load"
      />
    );
  }

  return (
    <StateMessage
      actionLabel="Add sample recipes"
      body="Add a couple of starter recipes to preview your cookbook."
      onAction={onSeedSamples}
      title="No recipes yet"
    />
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xxl
  },
  description: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23
  },
  eyebrow: {
    color: colors.leaf,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  loading: {
    alignItems: "center",
    minHeight: 180,
    justifyContent: "center"
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36
  }
});
