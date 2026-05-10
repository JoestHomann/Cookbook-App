import { createRecipe, getAllRecipes } from "@/data/recipeRepository";
import { Recipe } from "@/models/Recipe";
import { nowIso } from "@/utils/date";
import { createId } from "@/utils/id";

function ingredient(
  name: string,
  amount?: number,
  unit?: string,
  category?: string
) {
  return {
    id: createId("ingredient"),
    name,
    amount,
    unit,
    category
  };
}

export async function seedSampleRecipes() {
  const existingRecipes = await getAllRecipes();

  if (existingRecipes.length > 0) {
    return existingRecipes;
  }

  const timestamp = nowIso();
  const recipes: Recipe[] = [
    {
      id: createId("recipe"),
      title: "Chocolate Pancakes",
      description: "Soft pancakes with chocolate chips for a quick sweet breakfast.",
      ingredients: [
        ingredient("flour", 200, "g", "dry goods"),
        ingredient("eggs", 2, undefined, "dairy"),
        ingredient("milk", 300, "ml", "dairy"),
        ingredient("sugar", 2, "tbsp", "dry goods"),
        ingredient("chocolate chips", 50, "g", "dry goods")
      ],
      instructions: [
        "Mix flour, eggs, milk, and sugar into a smooth batter.",
        "Fold in the chocolate chips.",
        "Fry small pancakes in a lightly oiled pan until golden."
      ],
      cookingTimeMinutes: 20,
      servings: 2,
      tags: ["sweet", "breakfast", "quick", "dessert"],
      images: [],
      sourceType: "manual",
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: createId("recipe"),
      title: "Tomato Basil Pasta",
      description: "A simple dinner with pantry pasta, tomatoes, and fresh basil.",
      ingredients: [
        ingredient("pasta", 250, "g", "grains"),
        ingredient("tomatoes", 400, "g", "vegetables"),
        ingredient("olive oil", 2, "tbsp", "dry goods"),
        ingredient("garlic", 2, "cloves", "vegetables"),
        ingredient("basil", 1, "handful", "vegetables")
      ],
      instructions: [
        "Cook the pasta until al dente.",
        "Saute garlic in olive oil, then add tomatoes and simmer.",
        "Toss pasta with the sauce and finish with basil."
      ],
      cookingTimeMinutes: 25,
      servings: 3,
      tags: ["salty", "vegetarian", "dinner", "quick"],
      images: [],
      sourceType: "manual",
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ];

  for (const recipe of recipes) {
    await createRecipe(recipe);
  }

  return getAllRecipes();
}
