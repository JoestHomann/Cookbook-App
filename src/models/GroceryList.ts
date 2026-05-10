export interface GroceryList {
  id: string;
  title: string;
  items: GroceryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  amount?: number;
  unit?: string;
  category?: string;
  checked: boolean;
  sourceRecipeIds: string[];
  createdAt: string;
  updatedAt: string;
}
