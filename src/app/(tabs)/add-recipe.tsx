import { Href, router } from "expo-router";

import { RecipeForm } from "@/components/RecipeForm";
import { ScreenScaffold } from "@/components/ScreenScaffold";
import { createRecipe } from "@/data/recipeRepository";
import { Recipe } from "@/models/Recipe";

export default function AddRecipeRoute() {
  async function handleSubmit(recipe: Recipe) {
    await createRecipe(recipe);
    router.replace(`/recipes/${recipe.id}` as Href);
  }

  return (
    <ScreenScaffold
      eyebrow="Add Recipe"
      title="Manual recipe entry"
      description="Save a recipe with ingredients, instructions, cooking details, and tags."
    >
      <RecipeForm onSubmit={handleSubmit} submitLabel="Save recipe" />
    </ScreenScaffold>
  );
}
