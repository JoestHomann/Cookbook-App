import { Recipe } from "@/models/Recipe";

export interface SuggestedRecipe {
  recipe: Recipe;
  reason: string;
  score: number;
}
