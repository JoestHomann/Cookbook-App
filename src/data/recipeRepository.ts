import { type SQLiteDatabase } from "expo-sqlite";

import { getDatabase } from "@/data/database";
import { Ingredient } from "@/models/Ingredient";
import { Recipe, RecipeImage, RecipeSourceType } from "@/models/Recipe";
import { createId } from "@/utils/id";
import {
  normalizeIngredientName,
  normalizeOptionalText,
  normalizeTagName
} from "@/utils/normalize";

type DatabaseExecutor = Pick<
  SQLiteDatabase,
  "getAllAsync" | "getFirstAsync" | "runAsync"
>;

interface RecipeRow {
  id: string;
  title: string;
  description: string | null;
  cookingTimeMinutes: number | null;
  servings: number | null;
  sourceType: RecipeSourceType;
  createdAt: string;
  updatedAt: string;
}

interface IngredientRow {
  id: string;
  name: string;
  amount: number | null;
  unit: string | null;
  note: string | null;
  category: string | null;
}

interface InstructionRow {
  text: string;
}

interface RecipeImageRow {
  id: string;
  recipeId: string;
  uri: string;
  isMainImage: number;
  createdAt: string;
}

interface TagRow {
  name: string;
}

function optionalNumber(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function optionalText(value: string | undefined) {
  return normalizeOptionalText(value) ?? null;
}

function mapIngredient(row: IngredientRow): Ingredient {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount ?? undefined,
    unit: row.unit ?? undefined,
    note: row.note ?? undefined,
    category: row.category ?? undefined
  };
}

function mapImage(row: RecipeImageRow): RecipeImage {
  return {
    id: row.id,
    recipeId: row.recipeId,
    uri: row.uri,
    isMainImage: row.isMainImage === 1,
    createdAt: row.createdAt
  };
}

async function loadIngredients(db: DatabaseExecutor, recipeId: string) {
  const rows = await db.getAllAsync<IngredientRow>(
    `
    SELECT id, name, amount, unit, note, category
    FROM ingredients
    WHERE recipeId = ?
    ORDER BY rowid ASC
    `,
    recipeId
  );

  return rows.map(mapIngredient);
}

async function loadInstructions(db: DatabaseExecutor, recipeId: string) {
  const rows = await db.getAllAsync<InstructionRow>(
    `
    SELECT text
    FROM instructions
    WHERE recipeId = ?
    ORDER BY stepIndex ASC
    `,
    recipeId
  );

  return rows.map((row) => row.text);
}

async function loadImages(db: DatabaseExecutor, recipeId: string) {
  const rows = await db.getAllAsync<RecipeImageRow>(
    `
    SELECT id, recipeId, uri, isMainImage, createdAt
    FROM recipe_images
    WHERE recipeId = ?
    ORDER BY isMainImage DESC, createdAt ASC
    `,
    recipeId
  );

  return rows.map(mapImage);
}

async function loadTags(db: DatabaseExecutor, recipeId: string) {
  const rows = await db.getAllAsync<TagRow>(
    `
    SELECT tags.name
    FROM tags
    INNER JOIN recipe_tags ON recipe_tags.tagId = tags.id
    WHERE recipe_tags.recipeId = ?
    ORDER BY tags.name ASC
    `,
    recipeId
  );

  return rows.map((row) => row.name);
}

async function hydrateRecipe(
  db: DatabaseExecutor,
  row: RecipeRow
): Promise<Recipe> {
  const [ingredients, instructions, images, tags] = await Promise.all([
    loadIngredients(db, row.id),
    loadInstructions(db, row.id),
    loadImages(db, row.id),
    loadTags(db, row.id)
  ]);

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    ingredients,
    instructions,
    cookingTimeMinutes: row.cookingTimeMinutes ?? undefined,
    servings: row.servings ?? undefined,
    tags,
    images,
    sourceType: row.sourceType,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

async function insertRecipeRecord(db: DatabaseExecutor, recipe: Recipe) {
  await db.runAsync(
    `
    INSERT INTO recipes (
      id,
      title,
      description,
      cookingTimeMinutes,
      servings,
      sourceType,
      createdAt,
      updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    recipe.id,
    recipe.title,
    optionalText(recipe.description),
    optionalNumber(recipe.cookingTimeMinutes),
    optionalNumber(recipe.servings),
    recipe.sourceType,
    recipe.createdAt,
    recipe.updatedAt
  );

  await insertRecipeChildren(db, recipe);
}

async function insertRecipeChildren(db: DatabaseExecutor, recipe: Recipe) {
  for (const ingredient of recipe.ingredients) {
    await db.runAsync(
      `
      INSERT INTO ingredients (
        id,
        recipeId,
        name,
        amount,
        unit,
        note,
        category
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      ingredient.id || createId("ingredient"),
      recipe.id,
      ingredient.name.trim(),
      optionalNumber(ingredient.amount),
      optionalText(ingredient.unit),
      optionalText(ingredient.note),
      optionalText(ingredient.category)
    );
  }

  for (const [stepIndex, instruction] of recipe.instructions.entries()) {
    const text = instruction.trim();

    if (!text) {
      continue;
    }

    await db.runAsync(
      `
      INSERT INTO instructions (id, recipeId, stepIndex, text)
      VALUES (?, ?, ?, ?)
      `,
      createId("instruction"),
      recipe.id,
      stepIndex,
      text
    );
  }

  for (const image of recipe.images) {
    await db.runAsync(
      `
      INSERT INTO recipe_images (id, recipeId, uri, isMainImage, createdAt)
      VALUES (?, ?, ?, ?, ?)
      `,
      image.id || createId("image"),
      recipe.id,
      image.uri,
      image.isMainImage ? 1 : 0,
      image.createdAt
    );
  }

  for (const tag of recipe.tags) {
    const name = normalizeTagName(tag);

    if (!name) {
      continue;
    }

    await db.runAsync(
      "INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)",
      name,
      name
    );
    await db.runAsync(
      "INSERT OR IGNORE INTO recipe_tags (recipeId, tagId) VALUES (?, ?)",
      recipe.id,
      name
    );
  }
}

async function deleteRecipeChildren(db: DatabaseExecutor, recipeId: string) {
  await db.runAsync("DELETE FROM ingredients WHERE recipeId = ?", recipeId);
  await db.runAsync("DELETE FROM instructions WHERE recipeId = ?", recipeId);
  await db.runAsync("DELETE FROM recipe_images WHERE recipeId = ?", recipeId);
  await db.runAsync("DELETE FROM recipe_tags WHERE recipeId = ?", recipeId);
}

async function hydrateRecipeRows(db: DatabaseExecutor, rows: RecipeRow[]) {
  return Promise.all(rows.map((row) => hydrateRecipe(db, row)));
}

export async function createRecipe(recipe: Recipe) {
  const db = await getDatabase();

  await db.withExclusiveTransactionAsync(async (tx) => {
    await insertRecipeRecord(tx, recipe);
  });
}

export async function updateRecipe(recipe: Recipe) {
  const db = await getDatabase();

  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync(
      `
      UPDATE recipes
      SET title = ?,
          description = ?,
          cookingTimeMinutes = ?,
          servings = ?,
          sourceType = ?,
          updatedAt = ?
      WHERE id = ?
      `,
      recipe.title,
      optionalText(recipe.description),
      optionalNumber(recipe.cookingTimeMinutes),
      optionalNumber(recipe.servings),
      recipe.sourceType,
      recipe.updatedAt,
      recipe.id
    );

    await deleteRecipeChildren(tx, recipe.id);
    await insertRecipeChildren(tx, recipe);
  });
}

export async function deleteRecipe(recipeId: string) {
  const db = await getDatabase();

  await db.withExclusiveTransactionAsync(async (tx) => {
    await deleteRecipeChildren(tx, recipeId);
    await tx.runAsync("DELETE FROM recipes WHERE id = ?", recipeId);
  });
}

export async function getRecipeById(recipeId: string) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<RecipeRow>(
    `
    SELECT id, title, description, cookingTimeMinutes, servings, sourceType, createdAt, updatedAt
    FROM recipes
    WHERE id = ?
    `,
    recipeId
  );

  return row ? hydrateRecipe(db, row) : null;
}

export async function getAllRecipes() {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RecipeRow>(
    `
    SELECT id, title, description, cookingTimeMinutes, servings, sourceType, createdAt, updatedAt
    FROM recipes
    ORDER BY createdAt DESC
    `
  );

  return hydrateRecipeRows(db, rows);
}

export async function searchRecipes(query: string) {
  const searchTerm = query.trim().toLowerCase();

  if (!searchTerm) {
    return getAllRecipes();
  }

  const db = await getDatabase();
  const likeTerm = `%${searchTerm}%`;
  const rows = await db.getAllAsync<RecipeRow>(
    `
    SELECT DISTINCT recipes.id,
                    recipes.title,
                    recipes.description,
                    recipes.cookingTimeMinutes,
                    recipes.servings,
                    recipes.sourceType,
                    recipes.createdAt,
                    recipes.updatedAt
    FROM recipes
    LEFT JOIN ingredients ON ingredients.recipeId = recipes.id
    LEFT JOIN recipe_tags ON recipe_tags.recipeId = recipes.id
    LEFT JOIN tags ON tags.id = recipe_tags.tagId
    WHERE LOWER(recipes.title) LIKE ?
       OR LOWER(COALESCE(recipes.description, '')) LIKE ?
       OR LOWER(ingredients.name) LIKE ?
       OR LOWER(tags.name) LIKE ?
    ORDER BY recipes.createdAt DESC
    `,
    likeTerm,
    likeTerm,
    likeTerm,
    likeTerm
  );

  return hydrateRecipeRows(db, rows);
}

export async function getRecipesByTags(tags: string[]) {
  const normalizedTags = Array.from(
    new Set(tags.map(normalizeTagName).filter(Boolean))
  );

  if (normalizedTags.length === 0) {
    return getAllRecipes();
  }

  const db = await getDatabase();
  const placeholders = normalizedTags.map(() => "?").join(", ");
  const rows = await db.getAllAsync<RecipeRow>(
    `
    SELECT recipes.id,
           recipes.title,
           recipes.description,
           recipes.cookingTimeMinutes,
           recipes.servings,
           recipes.sourceType,
           recipes.createdAt,
           recipes.updatedAt
    FROM recipes
    INNER JOIN recipe_tags ON recipe_tags.recipeId = recipes.id
    INNER JOIN tags ON tags.id = recipe_tags.tagId
    WHERE tags.name IN (${placeholders})
    GROUP BY recipes.id
    HAVING COUNT(DISTINCT tags.name) = ?
    ORDER BY recipes.createdAt DESC
    `,
    ...normalizedTags,
    normalizedTags.length
  );

  return hydrateRecipeRows(db, rows);
}

export async function searchRecipesByQueryAndTags(
  query: string,
  tags: string[]
) {
  const [matchingSearchRecipes, matchingTagRecipes] = await Promise.all([
    searchRecipes(query),
    getRecipesByTags(tags)
  ]);

  if (!query.trim()) {
    return matchingTagRecipes;
  }

  if (tags.length === 0) {
    return matchingSearchRecipes;
  }

  const tagRecipeIds = new Set(matchingTagRecipes.map((recipe) => recipe.id));
  return matchingSearchRecipes.filter((recipe) => tagRecipeIds.has(recipe.id));
}

export function getNormalizedRecipeIngredientNames(recipe: Recipe) {
  return recipe.ingredients.map((ingredient) =>
    normalizeIngredientName(ingredient.name)
  );
}
