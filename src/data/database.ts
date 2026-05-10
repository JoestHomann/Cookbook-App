import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

export const DATABASE_NAME = "cookbook.db";

let databasePromise: Promise<SQLiteDatabase> | null = null;

const schemaSql = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cookingTimeMinutes INTEGER,
  servings INTEGER,
  sourceType TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY,
  recipeId TEXT NOT NULL,
  name TEXT NOT NULL,
  amount REAL,
  unit TEXT,
  note TEXT,
  category TEXT,
  FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS instructions (
  id TEXT PRIMARY KEY,
  recipeId TEXT NOT NULL,
  stepIndex INTEGER NOT NULL,
  text TEXT NOT NULL,
  FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recipe_images (
  id TEXT PRIMARY KEY,
  recipeId TEXT NOT NULL,
  uri TEXT NOT NULL,
  isMainImage INTEGER NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS recipe_tags (
  recipeId TEXT NOT NULL,
  tagId TEXT NOT NULL,
  PRIMARY KEY (recipeId, tagId),
  FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS grocery_lists (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS grocery_items (
  id TEXT PRIMARY KEY,
  groceryListId TEXT NOT NULL,
  name TEXT NOT NULL,
  amount REAL,
  unit TEXT,
  category TEXT,
  checked INTEGER NOT NULL,
  sourceRecipeIds TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (groceryListId) REFERENCES grocery_lists(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ingredients_recipe_id ON ingredients(recipeId);
CREATE INDEX IF NOT EXISTS idx_instructions_recipe_id ON instructions(recipeId, stepIndex);
CREATE INDEX IF NOT EXISTS idx_recipe_images_recipe_id ON recipe_images(recipeId);
CREATE INDEX IF NOT EXISTS idx_recipe_tags_tag_id ON recipe_tags(tagId);
CREATE INDEX IF NOT EXISTS idx_grocery_items_list_id ON grocery_items(groceryListId);
`;

export async function initializeDatabase(db: SQLiteDatabase) {
  await db.execAsync(schemaSql);
}

export async function getDatabase() {
  if (!databasePromise) {
    databasePromise = openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      await initializeDatabase(db);
      return db;
    });
  }

  return databasePromise;
}

export async function closeDatabase() {
  if (!databasePromise) {
    return;
  }

  const db = await databasePromise;
  await db.closeAsync();
  databasePromise = null;
}
