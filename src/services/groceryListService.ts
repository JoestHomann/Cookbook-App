import {
  addGroceryItem,
  findGroceryItemByNameAndUnit,
  getGroceryListById,
  getOrCreateActiveGroceryList,
  updateGroceryItem
} from "@/data/groceryRepository";
import { getRecipeById } from "@/data/recipeRepository";
import { Ingredient } from "@/models/Ingredient";
import { GroceryList } from "@/models/GroceryList";
import {
  normalizeIngredientName,
  normalizeOptionalText
} from "@/utils/normalize";

export interface GroceryListGenerationResult {
  addedItemCount: number;
  groceryList: GroceryList;
  mergedItemCount: number;
  skippedIngredientCount: number;
}

function mergeAmount(
  existingAmount: number | undefined,
  ingredientAmount: number | undefined
) {
  if (
    typeof existingAmount === "number" &&
    Number.isFinite(existingAmount) &&
    typeof ingredientAmount === "number" &&
    Number.isFinite(ingredientAmount)
  ) {
    return existingAmount + ingredientAmount;
  }

  return existingAmount ?? ingredientAmount;
}

function mergeSourceRecipeIds(existingIds: string[], recipeId: string) {
  return Array.from(new Set([...existingIds, recipeId]));
}

function getIngredientItemInput(ingredient: Ingredient, recipeId: string) {
  return {
    name: ingredient.name.trim(),
    amount: ingredient.amount,
    unit: normalizeOptionalText(ingredient.unit),
    category: normalizeOptionalText(ingredient.category) ?? "other",
    checked: false,
    sourceRecipeIds: [recipeId]
  };
}

export async function createGroceryListFromRecipe(
  recipeId: string
): Promise<GroceryListGenerationResult> {
  const recipe = await getRecipeById(recipeId);

  if (!recipe) {
    throw new Error("Recipe could not be found.");
  }

  const activeList = await getOrCreateActiveGroceryList();
  let addedItemCount = 0;
  let mergedItemCount = 0;
  let skippedIngredientCount = 0;

  for (const ingredient of recipe.ingredients) {
    const normalizedName = normalizeIngredientName(ingredient.name);

    if (!normalizedName) {
      skippedIngredientCount += 1;
      continue;
    }

    const normalizedUnit = normalizeOptionalText(ingredient.unit);
    const existingItem = await findGroceryItemByNameAndUnit(
      activeList.id,
      normalizedName,
      normalizedUnit
    );

    if (existingItem) {
      await updateGroceryItem(activeList.id, {
        ...existingItem,
        amount: mergeAmount(existingItem.amount, ingredient.amount),
        category:
          existingItem.category ??
          normalizeOptionalText(ingredient.category) ??
          "other",
        checked: false,
        sourceRecipeIds: mergeSourceRecipeIds(
          existingItem.sourceRecipeIds,
          recipe.id
        )
      });
      mergedItemCount += 1;
      continue;
    }

    await addGroceryItem(
      activeList.id,
      getIngredientItemInput(ingredient, recipe.id)
    );
    addedItemCount += 1;
  }

  const groceryList = await getGroceryListById(activeList.id);

  if (!groceryList) {
    throw new Error("Grocery list could not be loaded after generation.");
  }

  return {
    addedItemCount,
    groceryList,
    mergedItemCount,
    skippedIngredientCount
  };
}
