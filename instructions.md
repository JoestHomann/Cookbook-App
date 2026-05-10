# Cookbook App Development Instructions

Build a React Native Expo cookbook MVP.

The app should have four main tabs:

1. Recipes
2. Add Recipe
3. Grocery List
4. Suggestions

Post-MVP, add a fifth Calorie Counter tab. It should support manual calorie entry, photo-based entry from nutrition labels, and AI food picture calorie estimates after the core cookbook MVP is stable.

The first goal is to build a local MVP with manual recipe creation, local storage, search/filtering, image attachment, and grocery list generation. Image-to-recipe extraction should first be implemented with mocked extraction logic. Real OCR or LLM-based image extraction can be added later.

---

## 1. MVP Priority

Build the app in this order:

1. Set up the React Native Expo project.
2. Add tab navigation.
3. Define the data models.
4. Set up local SQLite storage.
5. Build recipe list and recipe detail screens.
6. Add manual recipe creation.
7. Add image attachment from gallery/camera.
8. Add search and tag filtering.
9. Add grocery list generation.
10. Add simple recipe suggestions.
11. Add mocked image-to-recipe extraction.
12. Later replace mocked extraction with real OCR/LLM vision.

Do not start with OCR or AI integration. First make the app work fully with local/manual data.

---

## 2. Recommended Tech Stack

Use:

- React Native with Expo
- TypeScript
- Expo Router or React Navigation
- SQLite for local storage
- Expo ImagePicker for gallery image selection
- Expo Camera for taking pictures
- Mocked OCR/image extraction first
- Real OCR or LLM vision API later

Use SQLite instead of AsyncStorage because the app needs structured and queryable data:

- recipes
- ingredients
- instructions
- tags
- images
- grocery list items
- suggestion metadata

---

## 3. Main Tabs

### Tab 1: Recipes

This is the main cookbook tab.

Features:

- Display all saved recipes.
- Show recipe cards in a list or grid.
- Each card should show:
  - recipe title
  - main image if available
  - cooking time
  - tags/classifiers
  - short description if available
- Add a search bar.
- Add filter chips for tags, for example:
  - sweet
  - salty
  - vegetarian
  - vegan
  - quick
  - dessert
  - dinner
  - healthy
- Tapping a recipe opens the recipe detail page.

Search should match:

- recipe title
- description
- ingredients
- tags

Filtering should support selecting one or multiple tags.

---

### Tab 2: Add Recipe

This tab allows the user to add a recipe.

It should support three modes:

1. Manual entry
2. Add from camera picture
3. Add from gallery/screenshot

For the MVP, implement manual entry first.

The manual recipe form should include:

- title
- description
- ingredients
- instructions
- cooking time in minutes
- servings
- tags/classifiers
- images

The user should be able to dynamically add/remove ingredients and instruction steps.

Later, add image-to-recipe extraction:

1. User takes a picture or selects an image.
2. App sends image to mocked extraction function.
3. Mocked function returns structured recipe data.
4. App fills the recipe form with extracted data.
5. User reviews and edits the recipe.
6. User saves the recipe.

The user must always be able to review and edit extracted recipes before saving.

---

### Tab 3: Grocery List

This tab displays generated grocery lists.

Each recipe detail page must have a button:

```text
Create grocery list
```

When the user presses this button:

1. Take the ingredients from the selected recipe.
2. Convert them into grocery list items.
3. Add those items to the current grocery list.
4. Combine duplicate ingredients where possible.
5. Group items by category.
6. Let the user check off items.
7. Let the user edit or delete items.

Example grocery categories:

- vegetables
- fruits
- dairy
- meat/fish
- grains
- dry goods
- spices
- frozen
- other

The grocery list item should show:

- ingredient name
- amount
- unit
- category
- checkbox
- source recipe if useful

For the MVP, simple duplicate merging is enough.

Example:

```text
Recipe 1:
- 200 g flour

Recipe 2:
- 300 g flour

Merged grocery list:
- 500 g flour
```

Only merge ingredients automatically when the name and unit match.

If units differ, keep them separate for now.

Example:

```text
- 200 g flour
- 1 cup flour
```

Later, add unit conversion.

---

### Tab 4: Suggestions

This tab presents recipe suggestions that the user might like.

For the MVP, use simple rule-based recommendations.

Suggestion logic:

- Count which tags the user saves most often.
- Recommend recipes with similar tags.
- Recommend recently added recipes.
- Recommend recipes that have not been cooked recently.
- Recommend quick recipes if the user often saves quick recipes.
- Recommend sweet recipes if the user often saves desserts.

Each suggestion card should show:

- recipe title
- image
- tags
- cooking time
- reason for suggestion

Example reasons:

```text
Because you often save quick recipes.
Because you like dessert recipes.
Because this recipe matches your vegetarian recipes.
```

For the MVP, suggestions can be generated only from the user's own saved recipes.

Later, suggestions can include external recipe recommendations.

---

## 4. Data Models

Use TypeScript interfaces.

### Recipe

```ts
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
  sourceType: "manual" | "camera" | "screenshot" | "import";
  createdAt: string;
  updatedAt: string;
}
```

### Ingredient

```ts
export interface Ingredient {
  id: string;
  name: string;
  amount?: number;
  unit?: string;
  note?: string;
  category?: string;
}
```

### RecipeImage

```ts
export interface RecipeImage {
  id: string;
  recipeId: string;
  uri: string;
  isMainImage: boolean;
  createdAt: string;
}
```

### GroceryList

```ts
export interface GroceryList {
  id: string;
  title: string;
  items: GroceryItem[];
  createdAt: string;
  updatedAt: string;
}
```

### GroceryItem

```ts
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
```

---

## 5. SQLite Storage

Use SQLite tables for:

- recipes
- ingredients
- instructions
- recipe_images
- tags
- recipe_tags
- grocery_lists
- grocery_items

Suggested schema:

```sql
CREATE TABLE recipes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cookingTimeMinutes INTEGER,
  servings INTEGER,
  sourceType TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE ingredients (
  id TEXT PRIMARY KEY,
  recipeId TEXT NOT NULL,
  name TEXT NOT NULL,
  amount REAL,
  unit TEXT,
  note TEXT,
  category TEXT,
  FOREIGN KEY (recipeId) REFERENCES recipes(id)
);

CREATE TABLE instructions (
  id TEXT PRIMARY KEY,
  recipeId TEXT NOT NULL,
  stepIndex INTEGER NOT NULL,
  text TEXT NOT NULL,
  FOREIGN KEY (recipeId) REFERENCES recipes(id)
);

CREATE TABLE recipe_images (
  id TEXT PRIMARY KEY,
  recipeId TEXT NOT NULL,
  uri TEXT NOT NULL,
  isMainImage INTEGER NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (recipeId) REFERENCES recipes(id)
);

CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE recipe_tags (
  recipeId TEXT NOT NULL,
  tagId TEXT NOT NULL,
  PRIMARY KEY (recipeId, tagId),
  FOREIGN KEY (recipeId) REFERENCES recipes(id),
  FOREIGN KEY (tagId) REFERENCES tags(id)
);

CREATE TABLE grocery_lists (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE grocery_items (
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
  FOREIGN KEY (groceryListId) REFERENCES grocery_lists(id)
);
```

---

## 6. Image-to-Recipe Pipeline

Implement this pipeline later, after the local MVP works.

Pipeline:

```text
Image input
-> mocked OCR/vision extraction
-> raw text or mocked structured data
-> recipe parser
-> classifier/tag generator
-> editable preview form
-> save recipe
```

Create these modules:

```ts
extractTextFromImage(imageUri: string): Promise<string>
parseRecipeFromText(rawText: string): Promise<Partial<Recipe>>
classifyRecipe(recipe: Partial<Recipe>): string[]
saveRecipe(recipe: Recipe): Promise<void>
```

For the MVP, `extractTextFromImage` can return mocked text.

Example mocked output:

```text
Chocolate Pancakes

Ingredients:
- 200 g flour
- 2 eggs
- 300 ml milk
- 2 tbsp sugar
- 50 g chocolate chips

Instructions:
1. Mix flour, eggs, milk, and sugar.
2. Add chocolate chips.
3. Fry pancakes in a pan.

Cooking time: 20 minutes
Servings: 2
```

The parser should extract:

- title
- ingredients
- instructions
- cooking time
- servings

The classifier should assign tags based on rules.

Example rules:

- sugar, chocolate, honey, vanilla -> sweet
- pasta, cheese, salt, meat -> salty
- no meat or fish -> vegetarian
- cooking time below 30 minutes -> quick
- chocolate, cake, sugar -> dessert
- chili, pepper, curry -> spicy

The user must always review the generated recipe before saving.

---

## 7. Search and Filtering

Implement search locally.

The search function should check:

- title
- description
- ingredient names
- tags

The filter function should check selected tags.

Example behavior:

```text
Search input: "chocolate"
Selected tag: "quick"

Result:
Show recipes that contain "chocolate" and also have the tag "quick".
```

Search and filters should work together.

---

## 8. Recipe Detail Page

The recipe detail page should show:

- title
- images
- description
- tags
- cooking time
- servings
- ingredients
- instructions
- edit button
- delete button
- Create grocery list button

The page should allow:

- editing the recipe
- deleting the recipe
- generating a grocery list
- viewing all attached images

---

## 9. Grocery List Generation Logic

Create a function:

```ts
createGroceryListFromRecipe(recipeId: string): Promise<void>
```

Logic:

1. Load recipe by ID.
2. Load all ingredients for that recipe.
3. Get or create the active grocery list.
4. For each ingredient:
   - Check whether an item with the same name and unit already exists.
   - If yes, add the amount if both amounts are numbers.
   - If no, create a new grocery item.
5. Save updated grocery list.
6. Navigate to Grocery List tab.

Use a helper function:

```ts
normalizeIngredientName(name: string): string
```

This should lowercase and trim ingredient names.

Example:

```text
" Flour " -> "flour"
"flour" -> "flour"
```

---

## 10. Recipe Suggestions Logic

Create a function:

```ts
getSuggestedRecipes(): Promise<SuggestedRecipe[]>
```

Suggested type:

```ts
export interface SuggestedRecipe {
  recipe: Recipe;
  reason: string;
  score: number;
}
```

Simple scoring idea:

- +3 points if recipe has one of the user's most common tags
- +2 points if recipe is quick
- +1 point if recipe was recently added
- -2 points if recipe was already suggested recently

Sort by score descending.

For now, suggestions can use saved recipes only.

---

## 11. Project Structure

Use a modular structure like this:

```text
src/
  app/
    tabs/
      RecipesScreen.tsx
      AddRecipeScreen.tsx
      GroceryListScreen.tsx
      SuggestionsScreen.tsx
    screens/
      RecipeDetailScreen.tsx
      EditRecipeScreen.tsx
      RecipePreviewScreen.tsx

  components/
    RecipeCard.tsx
    RecipeForm.tsx
    IngredientInputList.tsx
    InstructionInputList.tsx
    TagChips.tsx
    ImagePickerField.tsx
    GroceryListItem.tsx
    SuggestionCard.tsx

  data/
    database.ts
    recipeRepository.ts
    groceryRepository.ts

  models/
    Recipe.ts
    Ingredient.ts
    GroceryList.ts

  services/
    imageExtractionService.ts
    recipeParserService.ts
    recipeClassifierService.ts
    groceryListService.ts
    suggestionService.ts

  utils/
    id.ts
    date.ts
    normalize.ts
```

---

## 12. Development Steps

### Step 1: Project Setup

- Create Expo app with TypeScript.
- Install navigation.
- Install SQLite package.
- Install image picker package.
- Create the tab layout.

### Step 2: Data Layer

- Define TypeScript models.
- Create SQLite database setup.
- Create repository functions:
  - createRecipe
  - updateRecipe
  - deleteRecipe
  - getRecipeById
  - getAllRecipes
  - searchRecipes
  - getRecipesByTags

### Step 3: Recipe UI

- Build recipe list.
- Build recipe card.
- Build recipe detail page.
- Add dummy data first.

### Step 4: Manual Recipe Form

- Build recipe form.
- Add dynamic ingredients.
- Add dynamic instructions.
- Add tag selection.
- Save recipe to SQLite.

### Step 5: Images

- Add image picker.
- Add camera support.
- Attach images to recipes.
- Display main image on recipe cards.

### Step 6: Search and Filtering

- Add search bar.
- Add tag chips.
- Combine search and tag filtering.

### Step 7: Grocery List

- Build grocery list screen.
- Add checkboxes.
- Add edit/delete item behavior.
- Add Create grocery list button on recipe detail page.

### Step 8: Suggestions

- Build suggestions screen.
- Implement simple scoring logic.
- Show reason for each suggestion.

### Step 9: Mocked Image Extraction

- Add camera/gallery image-to-recipe flow.
- Use mocked OCR/extraction output.
- Parse mocked text into recipe fields.
- Show editable preview before saving.

### Step 10: Real OCR/AI Later

Only after the MVP works:

- Add real OCR or LLM vision extraction.
- Replace mocked extraction service.
- Keep the same interface so the rest of the app does not need to change.

---

## 13. MVP Acceptance Criteria

The MVP is complete when:

- The user can create a recipe manually.
- The user can attach images to a recipe.
- The user can view all recipes.
- The user can open recipe details.
- The user can edit and delete recipes.
- The user can search recipes.
- The user can filter recipes by tags.
- The user can generate a grocery list from a recipe.
- The user can check off grocery list items.
- The suggestions tab shows basic recipe recommendations.
- Image-to-recipe extraction exists as a mocked flow.

---

## 14. Later Improvements

Add these after the MVP:

- Real OCR
- LLM-based recipe extraction
- Cloud sync
- User accounts
- Recipe sharing
- Import from website URL
- Meal planning calendar
- Calorie counter tab with manual entry, nutrition label photos, and AI food picture estimates
- Nutrition estimation
- Favorite recipes
- Cooked history
- Better AI recommendations
- Offline OCR
- Barcode scanning
- Export grocery list to PDF
- Multi-language recipe support
- Unit conversion
- Scaling servings up/down

---

## Final Instruction

Start with the local MVP. Do not implement real OCR or AI extraction first. Build the database, manual recipe flow, recipe list, recipe detail page, search/filtering, grocery list generation, and suggestions first. Then add mocked image extraction. Only after that, integrate real OCR or LLM vision.
