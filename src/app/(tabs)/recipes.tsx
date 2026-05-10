import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { RecipeCard } from "@/components/RecipeCard";
import { StateMessage } from "@/components/StateMessage";
import { TagChips } from "@/components/TagChips";
import {
  getAllRecipes,
  searchRecipesByQueryAndTags
} from "@/data/recipeRepository";
import { seedSampleRecipes } from "@/data/sampleRecipes";
import { Recipe } from "@/models/Recipe";
import { DEFAULT_RECIPE_TAGS } from "@/utils/constants";
import { colors, spacing } from "@/utils/theme";

export default function RecipesRoute() {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const hasActiveFilters = query.trim().length > 0 || selectedTags.length > 0;
  const availableTags = useMemo(() => {
    const tags = new Set<string>(DEFAULT_RECIPE_TAGS);

    for (const recipe of allRecipes) {
      for (const tag of recipe.tags) {
        tags.add(tag);
      }
    }

    return Array.from(tags).sort((firstTag, secondTag) =>
      firstTag.localeCompare(secondTag)
    );
  }, [allRecipes]);

  const loadRecipes = useCallback(
    async (isRefresh = false) => {
      setError(null);

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const [savedRecipes, matchingRecipes] = await Promise.all([
          getAllRecipes(),
          searchRecipesByQueryAndTags(query, selectedTags)
        ]);

        setAllRecipes(savedRecipes);
        setRecipes(matchingRecipes);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : String(caughtError)
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [query, selectedTags]
  );

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [loadRecipes])
  );

  function clearFilters() {
    setQuery("");
    setSelectedTags([]);
  }

  async function handleSeedSamples() {
    setError(null);
    setIsLoading(true);

    try {
      const savedRecipes = await seedSampleRecipes();

      setAllRecipes(savedRecipes);
      setRecipes(await searchRecipesByQueryAndTags(query, selectedTags));
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
            hasActiveFilters={hasActiveFilters}
            isLoading={isLoading}
            onRetry={() => loadRecipes()}
            onClearFilters={clearFilters}
            onSeedSamples={handleSeedSamples}
            savedRecipeCount={allRecipes.length}
          />
        }
        ListHeaderComponent={
          <RecipesHeader
            availableTags={availableTags}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            onQueryChange={setQuery}
            onSelectedTagsChange={setSelectedTags}
            query={query}
            recipeCount={recipes.length}
            savedRecipeCount={allRecipes.length}
            selectedTags={selectedTags}
          />
        }
        onRefresh={() => loadRecipes(true)}
        refreshing={isRefreshing}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
      />
    </SafeAreaView>
  );
}

function RecipesHeader({
  availableTags,
  hasActiveFilters,
  onClearFilters,
  onQueryChange,
  onSelectedTagsChange,
  query,
  recipeCount,
  savedRecipeCount,
  selectedTags
}: {
  availableTags: string[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onQueryChange: (query: string) => void;
  onSelectedTagsChange: (tags: string[]) => void;
  query: string;
  recipeCount: number;
  savedRecipeCount: number;
  selectedTags: string[];
}) {
  const countText = hasActiveFilters
    ? `${recipeCount} of ${savedRecipeCount} recipes`
    : recipeCount === 1
      ? "1 saved recipe"
      : `${recipeCount} saved recipes`;

  return (
    <View style={styles.header}>
      <Text style={styles.eyebrow}>Recipes</Text>
      <Text style={styles.title}>Your cookbook</Text>
      <Text style={styles.description}>{countText}</Text>
      <View style={styles.filterPanel}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onQueryChange}
          placeholder="Search recipes, ingredients, or tags"
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          style={styles.searchInput}
          value={query}
        />
        <TagChips
          availableTags={availableTags}
          onChange={onSelectedTagsChange}
          selectedTags={selectedTags}
        />
        {hasActiveFilters ? (
          <Pressable
            accessibilityRole="button"
            onPress={onClearFilters}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>Clear filters</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function ListEmptyState({
  error,
  hasActiveFilters,
  isLoading,
  onClearFilters,
  onRetry,
  onSeedSamples,
  savedRecipeCount
}: {
  error: string | null;
  hasActiveFilters: boolean;
  isLoading: boolean;
  onClearFilters: () => void;
  onRetry: () => void;
  onSeedSamples: () => void;
  savedRecipeCount: number;
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

  if (hasActiveFilters && savedRecipeCount > 0) {
    return (
      <StateMessage
        actionLabel="Clear filters"
        body="Try another search term or adjust the selected tags."
        onAction={onClearFilters}
        title="No matching recipes"
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
  clearButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderColor: colors.leaf,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  clearButtonText: {
    color: colors.leaf,
    fontSize: 14,
    fontWeight: "800"
  },
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
  filterPanel: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.md
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
  searchInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36
  }
});
