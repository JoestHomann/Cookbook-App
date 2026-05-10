import { Ingredient } from "@/models/Ingredient";

export type RecipeSourceType = "manual" | "camera" | "screenshot" | "import";

export interface RecipeImage {
  id: string;
  recipeId: string;
  uri: string;
  isMainImage: boolean;
  createdAt: string;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: Ingredient[];
  instructions: string[];
  cookingTimeMinutes?: number;
  servings?: number;
  tags: string[];
  images: RecipeImage[];
  sourceType: RecipeSourceType;
  createdAt: string;
  updatedAt: string;
}

export type RecipeDraft = Omit<Recipe, "createdAt" | "id" | "updatedAt"> & {
  id?: string;
};
