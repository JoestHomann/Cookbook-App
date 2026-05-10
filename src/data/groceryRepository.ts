import { type SQLiteDatabase } from "expo-sqlite";

import { getDatabase } from "@/data/database";
import { GroceryItem, GroceryList } from "@/models/GroceryList";
import { ACTIVE_GROCERY_LIST_TITLE } from "@/utils/constants";
import { nowIso } from "@/utils/date";
import { createId } from "@/utils/id";
import {
  normalizeIngredientName,
  normalizeOptionalText
} from "@/utils/normalize";

type DatabaseExecutor = Pick<
  SQLiteDatabase,
  "getAllAsync" | "getFirstAsync" | "runAsync"
>;

interface GroceryListRow {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface GroceryItemRow {
  id: string;
  name: string;
  amount: number | null;
  unit: string | null;
  category: string | null;
  checked: number;
  sourceRecipeIds: string | null;
  createdAt: string;
  updatedAt: string;
}

export type GroceryItemInput = Omit<GroceryItem, "createdAt" | "id" | "updatedAt"> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

function optionalNumber(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function optionalText(value: string | undefined) {
  return normalizeOptionalText(value) ?? null;
}

function parseSourceRecipeIds(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function mapGroceryItem(row: GroceryItemRow): GroceryItem {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount ?? undefined,
    unit: row.unit ?? undefined,
    category: row.category ?? undefined,
    checked: row.checked === 1,
    sourceRecipeIds: parseSourceRecipeIds(row.sourceRecipeIds),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

async function loadItems(db: DatabaseExecutor, groceryListId: string) {
  const rows = await db.getAllAsync<GroceryItemRow>(
    `
    SELECT id, name, amount, unit, category, checked, sourceRecipeIds, createdAt, updatedAt
    FROM grocery_items
    WHERE groceryListId = ?
    ORDER BY checked ASC, COALESCE(category, 'other') ASC, name ASC
    `,
    groceryListId
  );

  return rows.map(mapGroceryItem);
}

async function touchGroceryList(db: DatabaseExecutor, groceryListId: string) {
  await db.runAsync(
    "UPDATE grocery_lists SET updatedAt = ? WHERE id = ?",
    nowIso(),
    groceryListId
  );
}

async function mapGroceryList(
  db: DatabaseExecutor,
  row: GroceryListRow
): Promise<GroceryList> {
  return {
    id: row.id,
    title: row.title,
    items: await loadItems(db, row.id),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

export async function createGroceryList(title: string) {
  const db = await getDatabase();
  const timestamp = nowIso();
  const list: GroceryList = {
    id: createId("grocery_list"),
    title: title.trim() || ACTIVE_GROCERY_LIST_TITLE,
    items: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };

  await db.runAsync(
    `
    INSERT INTO grocery_lists (id, title, createdAt, updatedAt)
    VALUES (?, ?, ?, ?)
    `,
    list.id,
    list.title,
    list.createdAt,
    list.updatedAt
  );

  return list;
}

export async function getGroceryListById(groceryListId: string) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<GroceryListRow>(
    `
    SELECT id, title, createdAt, updatedAt
    FROM grocery_lists
    WHERE id = ?
    `,
    groceryListId
  );

  return row ? mapGroceryList(db, row) : null;
}

export async function getActiveGroceryList() {
  const db = await getDatabase();
  const row = await db.getFirstAsync<GroceryListRow>(
    `
    SELECT id, title, createdAt, updatedAt
    FROM grocery_lists
    ORDER BY createdAt DESC
    LIMIT 1
    `
  );

  return row ? mapGroceryList(db, row) : null;
}

export async function getOrCreateActiveGroceryList() {
  const existing = await getActiveGroceryList();

  if (existing) {
    return existing;
  }

  return createGroceryList(ACTIVE_GROCERY_LIST_TITLE);
}

export async function getGroceryItems(groceryListId: string) {
  const db = await getDatabase();
  return loadItems(db, groceryListId);
}

export async function addGroceryItem(
  groceryListId: string,
  itemInput: GroceryItemInput
) {
  const db = await getDatabase();
  const timestamp = nowIso();
  const item: GroceryItem = {
    id: itemInput.id ?? createId("grocery_item"),
    name: itemInput.name.trim(),
    amount: itemInput.amount,
    unit: normalizeOptionalText(itemInput.unit),
    category: normalizeOptionalText(itemInput.category),
    checked: itemInput.checked,
    sourceRecipeIds: itemInput.sourceRecipeIds,
    createdAt: itemInput.createdAt ?? timestamp,
    updatedAt: itemInput.updatedAt ?? timestamp
  };

  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync(
      `
      INSERT INTO grocery_items (
        id,
        groceryListId,
        name,
        amount,
        unit,
        category,
        checked,
        sourceRecipeIds,
        createdAt,
        updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      item.id,
      groceryListId,
      item.name,
      optionalNumber(item.amount),
      optionalText(item.unit),
      optionalText(item.category),
      item.checked ? 1 : 0,
      JSON.stringify(item.sourceRecipeIds),
      item.createdAt,
      item.updatedAt
    );
    await touchGroceryList(tx, groceryListId);
  });

  return item;
}

export async function updateGroceryItem(
  groceryListId: string,
  item: GroceryItem
) {
  const db = await getDatabase();
  const updatedAt = nowIso();

  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync(
      `
      UPDATE grocery_items
      SET name = ?,
          amount = ?,
          unit = ?,
          category = ?,
          checked = ?,
          sourceRecipeIds = ?,
          updatedAt = ?
      WHERE id = ? AND groceryListId = ?
      `,
      item.name.trim(),
      optionalNumber(item.amount),
      optionalText(item.unit),
      optionalText(item.category),
      item.checked ? 1 : 0,
      JSON.stringify(item.sourceRecipeIds),
      updatedAt,
      item.id,
      groceryListId
    );
    await touchGroceryList(tx, groceryListId);
  });

  return {
    ...item,
    updatedAt
  };
}

export async function deleteGroceryItem(groceryListId: string, itemId: string) {
  const db = await getDatabase();

  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync(
      "DELETE FROM grocery_items WHERE id = ? AND groceryListId = ?",
      itemId,
      groceryListId
    );
    await touchGroceryList(tx, groceryListId);
  });
}

export async function toggleGroceryItemChecked(
  groceryListId: string,
  itemId: string,
  checked: boolean
) {
  const db = await getDatabase();

  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync(
      `
      UPDATE grocery_items
      SET checked = ?, updatedAt = ?
      WHERE id = ? AND groceryListId = ?
      `,
      checked ? 1 : 0,
      nowIso(),
      itemId,
      groceryListId
    );
    await touchGroceryList(tx, groceryListId);
  });
}

export async function clearCheckedGroceryItems(groceryListId: string) {
  const db = await getDatabase();

  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync(
      "DELETE FROM grocery_items WHERE groceryListId = ? AND checked = 1",
      groceryListId
    );
    await touchGroceryList(tx, groceryListId);
  });
}

export async function findGroceryItemByNameAndUnit(
  groceryListId: string,
  name: string,
  unit?: string
) {
  const db = await getDatabase();
  const normalizedName = normalizeIngredientName(name);
  const normalizedUnit = normalizeOptionalText(unit)?.toLowerCase() ?? "";
  const row = await db.getFirstAsync<GroceryItemRow>(
    `
    SELECT id, name, amount, unit, category, checked, sourceRecipeIds, createdAt, updatedAt
    FROM grocery_items
    WHERE groceryListId = ?
      AND LOWER(TRIM(name)) = ?
      AND LOWER(TRIM(COALESCE(unit, ''))) = ?
    LIMIT 1
    `,
    groceryListId,
    normalizedName,
    normalizedUnit
  );

  return row ? mapGroceryItem(row) : null;
}
