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

import { StateMessage } from "@/components/StateMessage";
import { SuggestionCard } from "@/components/SuggestionCard";
import { SuggestedRecipe } from "@/models/Suggestion";
import { getSuggestedRecipes } from "@/services/suggestionService";
import { colors, spacing } from "@/utils/theme";

export default function SuggestionsRoute() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedRecipe[]>([]);

  const loadSuggestions = useCallback(async (isRefresh = false) => {
    setError(null);

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      setSuggestions(await getSuggestedRecipes());
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
      loadSuggestions();
    }, [loadSuggestions])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.content}
        data={suggestions}
        keyExtractor={(suggestion) => suggestion.recipe.id}
        ListEmptyComponent={
          <EmptyState
            error={error}
            isLoading={isLoading}
            onRetry={() => loadSuggestions()}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Suggestions</Text>
            <Text style={styles.title}>Recipe ideas</Text>
            <Text style={styles.description}>
              {suggestions.length === 1
                ? "1 suggestion from your saved recipes"
                : `${suggestions.length} suggestions from your saved recipes`}
            </Text>
          </View>
        }
        onRefresh={() => loadSuggestions(true)}
        refreshing={isRefreshing}
        renderItem={({ item }) => <SuggestionCard suggestion={item} />}
      />
    </SafeAreaView>
  );
}

function EmptyState({
  error,
  isLoading,
  onRetry
}: {
  error: string | null;
  isLoading: boolean;
  onRetry: () => void;
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
        title="Suggestions could not load"
      />
    );
  }

  return (
    <StateMessage
      body="Save a recipe first, then this tab can rank ideas by tags, cooking time, and recency."
      title="No suggestions yet"
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
