import { Ingredient } from "@/models/Ingredient";

export function normalizeIngredientName(name: string) {
  return name.trim().toLowerCase();
}

export function normalizeOptionalText(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export function normalizeTagName(tag: string) {
  return tag.trim().toLowerCase();
}

export function getIngredientMergeKey(ingredient: Pick<Ingredient, "name" | "unit">) {
  const name = normalizeIngredientName(ingredient.name);
  const unit = normalizeOptionalText(ingredient.unit)?.toLowerCase() ?? "";

  return `${name}|${unit}`;
}
