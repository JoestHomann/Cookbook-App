import { getAllRecipes } from "@/data/recipeRepository";
import { Recipe } from "@/models/Recipe";
import { SuggestedRecipe } from "@/models/Suggestion";

const QUICK_RECIPE_MINUTES = 30;
const RECENT_RECIPE_DAYS = 14;
const COMMON_TAG_LIMIT = 3;

function isQuickRecipe(recipe: Recipe) {
  return (
    recipe.tags.includes("quick") ||
    (typeof recipe.cookingTimeMinutes === "number" &&
      recipe.cookingTimeMinutes <= QUICK_RECIPE_MINUTES)
  );
}

function isRecentRecipe(recipe: Recipe) {
  const createdAt = Date.parse(recipe.createdAt);

  if (Number.isNaN(createdAt)) {
    return false;
  }

  const ageInDays = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
  return ageInDays <= RECENT_RECIPE_DAYS;
}

function getCommonTags(recipes: Recipe[]) {
  const counts = new Map<string, number>();

  for (const recipe of recipes) {
    for (const tag of recipe.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  const sortedTags = Array.from(counts.entries()).sort(
    ([firstTag, firstCount], [secondTag, secondCount]) =>
      secondCount - firstCount || firstTag.localeCompare(secondTag)
  );
  return new Set(
    sortedTags
      .filter(([, count]) => count > 1)
      .slice(0, COMMON_TAG_LIMIT)
      .map(([tag]) => tag)
  );
}

function formatTagReason(tags: string[]) {
  if (tags.length === 1) {
    return `Because you often save ${tags[0]} recipes.`;
  }

  const visibleTags = tags.slice(0, 2);
  return `Because it matches your ${visibleTags.join(" and ")} recipes.`;
}

function getSuggestionReason({
  commonTags,
  isQuick,
  isRecent,
  recipe
}: {
  commonTags: string[];
  isQuick: boolean;
  isRecent: boolean;
  recipe: Recipe;
}) {
  if (commonTags.length > 0) {
    return formatTagReason(commonTags);
  }

  if (isQuick) {
    return recipe.cookingTimeMinutes
      ? `Because it is ready in ${recipe.cookingTimeMinutes} minutes.`
      : "Because this is one of your quick recipes.";
  }

  if (isRecent) {
    return "Because it is a recent addition to your cookbook.";
  }

  return "Because it is saved in your cookbook.";
}

function getSuggestionScore(recipe: Recipe, commonTags: Set<string>) {
  const matchingCommonTags = recipe.tags.filter((tag) => commonTags.has(tag));
  let score = 0;

  if (matchingCommonTags.length > 0) {
    score += 3;
    score += Math.max(0, matchingCommonTags.length - 1);
  }

  if (isQuickRecipe(recipe)) {
    score += 2;
  }

  if (isRecentRecipe(recipe)) {
    score += 1;
  }

  if (recipe.tags.length === 0) {
    score -= 1;
  }

  if (!recipe.cookingTimeMinutes) {
    score -= 1;
  }

  return score;
}

export async function getSuggestedRecipes(): Promise<SuggestedRecipe[]> {
  const recipes = await getAllRecipes();
  const commonTags = getCommonTags(recipes);

  return recipes
    .map((recipe) => {
      const matchingCommonTags = recipe.tags.filter((tag) =>
        commonTags.has(tag)
      );
      const quick = isQuickRecipe(recipe);
      const recent = isRecentRecipe(recipe);

      return {
        recipe,
        reason: getSuggestionReason({
          commonTags: matchingCommonTags,
          isQuick: quick,
          isRecent: recent,
          recipe
        }),
        score: getSuggestionScore(recipe, commonTags)
      };
    })
    .sort((firstSuggestion, secondSuggestion) => {
      const scoreDelta = secondSuggestion.score - firstSuggestion.score;

      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      const firstCreatedAt = Date.parse(firstSuggestion.recipe.createdAt);
      const secondCreatedAt = Date.parse(secondSuggestion.recipe.createdAt);
      return (
        (Number.isNaN(secondCreatedAt) ? 0 : secondCreatedAt) -
          (Number.isNaN(firstCreatedAt) ? 0 : firstCreatedAt) ||
        firstSuggestion.recipe.title.localeCompare(secondSuggestion.recipe.title)
      );
    });
}
