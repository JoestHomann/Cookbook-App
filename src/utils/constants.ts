export const DEFAULT_RECIPE_TAGS = [
  "sweet",
  "salty",
  "vegetarian",
  "vegan",
  "breakfast",
  "lunch",
  "dinner",
  "dessert",
  "quick",
  "healthy",
  "spicy"
] as const;

export type DefaultRecipeTag = (typeof DEFAULT_RECIPE_TAGS)[number];

export const GROCERY_CATEGORIES = [
  "vegetables",
  "fruits",
  "dairy",
  "meat/fish",
  "grains",
  "dry goods",
  "spices",
  "frozen",
  "other"
] as const;

export type GroceryCategory = (typeof GROCERY_CATEGORIES)[number];

export const ACTIVE_GROCERY_LIST_TITLE = "Current Grocery List";
