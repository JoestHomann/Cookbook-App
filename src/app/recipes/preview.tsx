import { Href, router, useLocalSearchParams } from "expo-router";

import { RecipeForm } from "@/components/RecipeForm";
import { ScreenScaffold } from "@/components/ScreenScaffold";
import { StateMessage } from "@/components/StateMessage";
import { createRecipe } from "@/data/recipeRepository";
import { Recipe } from "@/models/Recipe";

function parseDraftRecipe(draftParam: string | string[] | undefined) {
  const encodedDraft = Array.isArray(draftParam) ? draftParam[0] : draftParam;

  if (!encodedDraft) {
    return null;
  }

  try {
    return JSON.parse(encodedDraft) as Recipe;
  } catch {
    try {
      return JSON.parse(decodeURIComponent(encodedDraft)) as Recipe;
    } catch {
      return null;
    }
  }
}

export default function RecipePreviewRoute() {
  const { draft } = useLocalSearchParams<{ draft?: string }>();
  const draftRecipe = parseDraftRecipe(draft);

  async function handleSubmit(recipe: Recipe) {
    await createRecipe(recipe);
    router.replace(`/recipes/${recipe.id}` as Href);
  }

  if (!draftRecipe) {
    return (
      <ScreenScaffold eyebrow="Recipe Preview" title="Preview unavailable">
        <StateMessage
          body="Start from the Add Recipe tab and choose the camera or gallery extraction flow."
          title="No extracted recipe"
        />
      </ScreenScaffold>
    );
  }

  return (
    <ScreenScaffold
      eyebrow="Recipe Preview"
      title="Review extracted recipe"
      description="Adjust the mocked extraction before saving it to your cookbook."
    >
      <RecipeForm
        initialRecipe={draftRecipe}
        onSubmit={handleSubmit}
        submitLabel="Save extracted recipe"
      />
    </ScreenScaffold>
  );
}
