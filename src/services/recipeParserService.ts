import { Ingredient } from "@/models/Ingredient";
import { Recipe } from "@/models/Recipe";
import { createId } from "@/utils/id";
import { normalizeOptionalText } from "@/utils/normalize";

const KNOWN_UNITS = new Set([
  "g",
  "kg",
  "ml",
  "l",
  "tsp",
  "tbsp",
  "cup",
  "cups",
  "clove",
  "cloves",
  "handful",
  "pinch"
]);

function parseAmount(value: string) {
  const normalizedValue = value.replace(",", ".");

  if (normalizedValue.includes("/")) {
    const [numerator, denominator] = normalizedValue.split("/").map(Number);

    if (
      Number.isFinite(numerator) &&
      Number.isFinite(denominator) &&
      denominator !== 0
    ) {
      return numerator / denominator;
    }
  }

  const parsed = Number(normalizedValue);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getIngredientCategory(name: string) {
  const normalizedName = name.toLowerCase();

  if (/(tomato|garlic|basil|onion|pepper|carrot|potato)/.test(normalizedName)) {
    return "vegetables";
  }

  if (/(milk|egg|cheese|butter|yogurt)/.test(normalizedName)) {
    return "dairy";
  }

  if (/(pasta|rice|flour|oat|bread)/.test(normalizedName)) {
    return "grains";
  }

  if (/(sugar|chocolate|oil|honey|vanilla)/.test(normalizedName)) {
    return "dry goods";
  }

  return "other";
}

function parseIngredient(line: string): Ingredient | null {
  const cleanedLine = line.replace(/^[-*]\s*/, "").trim();

  if (!cleanedLine) {
    return null;
  }

  const parts = cleanedLine.split(/\s+/);
  const amount = parseAmount(parts[0]);

  if (amount === undefined) {
    return {
      id: createId("ingredient"),
      name: cleanedLine,
      category: getIngredientCategory(cleanedLine)
    };
  }

  const maybeUnit = parts[1]?.toLowerCase();
  const hasKnownUnit = maybeUnit ? KNOWN_UNITS.has(maybeUnit) : false;
  const nameParts = parts.slice(hasKnownUnit ? 2 : 1);
  const name = nameParts.join(" ").trim();

  if (!name) {
    return null;
  }

  return {
    id: createId("ingredient"),
    name,
    amount,
    unit: hasKnownUnit ? maybeUnit : undefined,
    category: getIngredientCategory(name)
  };
}

function parseInstruction(line: string) {
  return normalizeOptionalText(line.replace(/^\d+[\.)]\s*/, ""));
}

export async function parseRecipeFromText(
  rawText: string
): Promise<Partial<Recipe>> {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const title = lines.find((line) => !line.endsWith(":")) ?? "Extracted recipe";
  const ingredients: Ingredient[] = [];
  const instructions: string[] = [];
  let section: "ingredients" | "instructions" | null = null;
  let cookingTimeMinutes: number | undefined;
  let servings: number | undefined;

  for (const line of lines.slice(1)) {
    if (/^ingredients:?$/i.test(line)) {
      section = "ingredients";
      continue;
    }

    if (/^instructions:?$/i.test(line)) {
      section = "instructions";
      continue;
    }

    const cookingTimeMatch = line.match(/^cooking time:\s*(\d+)/i);

    if (cookingTimeMatch) {
      cookingTimeMinutes = Number(cookingTimeMatch[1]);
      section = null;
      continue;
    }

    const servingsMatch = line.match(/^servings:\s*(\d+)/i);

    if (servingsMatch) {
      servings = Number(servingsMatch[1]);
      section = null;
      continue;
    }

    if (section === "ingredients") {
      const ingredient = parseIngredient(line);

      if (ingredient) {
        ingredients.push(ingredient);
      }
    }

    if (section === "instructions") {
      const instruction = parseInstruction(line);

      if (instruction) {
        instructions.push(instruction);
      }
    }
  }

  return {
    title,
    description: "Review the mocked extraction before saving.",
    ingredients,
    instructions,
    cookingTimeMinutes,
    servings
  };
}
