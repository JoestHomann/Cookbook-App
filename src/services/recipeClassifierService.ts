import { Recipe } from "@/models/Recipe";
import { DEFAULT_RECIPE_TAGS } from "@/utils/constants";

function recipeText(recipe: Partial<Recipe>) {
  return [
    recipe.title,
    recipe.description,
    recipe.ingredients?.map((ingredient) => ingredient.name).join(" "),
    recipe.instructions?.join(" ")
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function hasAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

export function classifyRecipe(recipe: Partial<Recipe>) {
  const text = recipeText(recipe);
  const tags = new Set<string>();

  if (hasAny(text, ["sugar", "chocolate", "honey", "vanilla"])) {
    tags.add("sweet");
  }

  if (hasAny(text, ["chocolate", "cake", "cookie", "pancake", "sugar"])) {
    tags.add("dessert");
  }

  if (hasAny(text, ["pasta", "cheese", "salt", "meat", "bacon"])) {
    tags.add("salty");
  }

  if (hasAny(text, ["chili", "pepper", "curry", "jalapeno"])) {
    tags.add("spicy");
  }

  if (
    typeof recipe.cookingTimeMinutes === "number" &&
    recipe.cookingTimeMinutes < 30
  ) {
    tags.add("quick");
  }

  if (!hasAny(text, ["beef", "chicken", "pork", "fish", "bacon", "meat"])) {
    tags.add("vegetarian");
  }

  if (
    !hasAny(text, [
      "beef",
      "butter",
      "cheese",
      "chicken",
      "egg",
      "fish",
      "honey",
      "milk",
      "pork",
      "yogurt"
    ])
  ) {
    tags.add("vegan");
  }

  return DEFAULT_RECIPE_TAGS.filter((tag) => tags.has(tag));
}
