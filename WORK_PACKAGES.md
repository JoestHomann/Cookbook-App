# Cookbook App Work Packages

This file tracks the implementation plan from `instructions.md` and the current progress of each package.

## Status Legend

- Not started: No implementation work has been done yet.
- In progress: Work has started but the package is not complete.
- Done: The package meets its acceptance checks.
- Blocked: Work cannot continue without a decision, dependency, or fix.

## Current Project State

- Planning/documentation: Done
- App implementation: WP-06 complete
- Existing project files: Expo app scaffold, dependency manifests, `src/` structure, `instructions.md`, `WORK_PACKAGES.md`
- Current implementation note: The Expo TypeScript foundation, four-tab placeholder app shell, data models, shared utilities, SQLite schema, repository layer, recipe list/detail viewing flow, and manual recipe create/edit/delete flow are installed and verified. Image attachment has not been implemented yet.

## WP-01: Project Foundation

Status: Done

Goal: Create the Expo React Native TypeScript project and install the MVP dependencies.

Scope:

- Initialize an Expo app with TypeScript.
- Choose Expo Router unless the generated project strongly favors another setup.
- Install SQLite, image picker, camera, and navigation-related packages.
- Create the initial folder structure from `instructions.md`.
- Confirm the app can start locally.

Deliverables:

- Expo project files.
- TypeScript configuration.
- `src/` structure for app, components, data, models, services, and utils.
- Basic runnable app shell.

Progress:

- Started project foundation work.
- Confirmed the workspace only contained planning documents before implementation.
- Found Node.js available through Codex, but no npm/npx/yarn/pnpm/bun package manager is currently on PATH.
- Added an ignored local npm helper under `.tools/` so dependencies could be installed in this environment.
- Created Expo project files: `package.json`, `package-lock.json`, `app.json`, `babel.config.js`, `tsconfig.json`, `expo-env.d.ts`, `.gitignore`, and `README.md`.
- Added the requested `src/` module structure with app, components, data, models, services, and utils folders.
- Added a minimal Expo Router root layout and placeholder home screen.
- Installed Expo, React Native, Expo Router, SQLite, ImagePicker, Camera, and related TypeScript dependencies.
- Verified `npm run typecheck` succeeds.
- Verified Expo starts and Metro responds on `http://127.0.0.1:8081/status` with `packager-status:running`.

Acceptance checks:

- Dependency install succeeds.
- TypeScript project is recognized.
- App can start with Expo.

## WP-02: Navigation And App Shell

Status: Done

Goal: Build the four-tab app shell.

Scope:

- Add tabs for Recipes, Add Recipe, Grocery List, and Suggestions.
- Add stack/detail routes for recipe detail, edit recipe, and recipe preview.
- Add placeholder screens for all MVP areas.
- Establish shared layout, theme constants, and basic reusable screen styling.

Deliverables:

- Working tab navigation.
- Placeholder screens reachable from the app.
- Detail/edit/preview route structure.

Progress:

- Started navigation and app shell work after WP-01 verification.
- Added Expo Router tab routes for Recipes, Add Recipe, Grocery List, and Suggestions.
- Added stack routes for recipe detail, edit recipe, and recipe preview placeholders.
- Added a shared screen scaffold, placeholder link component, and basic theme constants.
- Redirected the app root to the Recipes tab.
- Verified `npm run typecheck` succeeds.
- Verified Expo starts and Metro responds on `http://127.0.0.1:8081/status` with `packager-status:running`.

Acceptance checks:

- All four tabs are visible and navigable.
- Recipe detail/edit/preview routes can be opened from placeholder actions.

## WP-03: Models And Utilities

Status: Done

Goal: Define the shared TypeScript types and small utility helpers.

Scope:

- Add Recipe, Ingredient, RecipeImage, GroceryList, GroceryItem, and SuggestedRecipe types.
- Add date and ID helpers.
- Add ingredient normalization helpers.
- Add shared tag/category constants.

Deliverables:

- Type-safe model files.
- Utility modules used by later packages.

Progress:

- Started model and utility work after WP-02 verification.
- Added Recipe, RecipeImage, Ingredient, GroceryList, GroceryItem, and SuggestedRecipe model types.
- Added default recipe tag, grocery category, and active grocery list constants.
- Added ID, date, tag normalization, optional text normalization, ingredient normalization, and ingredient merge key helpers.
- Verified `npm run typecheck` succeeds.

Acceptance checks:

- TypeScript compiles with the model definitions.
- `normalizeIngredientName` lowercases and trims names.

## WP-04: SQLite Database And Repositories

Status: Done

Goal: Add local SQLite storage and repository functions.

Scope:

- Create the SQLite database setup.
- Create tables for recipes, ingredients, instructions, recipe images, tags, recipe tags, grocery lists, and grocery items.
- Implement recipe repository functions.
- Implement grocery repository basics.
- Add transactional save/update behavior for recipes and related rows.

Deliverables:

- Database initialization module.
- Recipe repository.
- Grocery repository.

Progress:

- Started SQLite database and repository work after WP-03 verification.
- Confirmed the installed `expo-sqlite` package supports the async database API required for this package.
- Added lazy database initialization in `src/data/database.ts` using `cookbook.db`.
- Created tables for recipes, ingredients, instructions, recipe images, tags, recipe tags, grocery lists, and grocery items.
- Added foreign key cascades and indexes for the main relation lookups.
- Added a root `DatabaseGate` so the app initializes SQLite when it opens.
- Implemented recipe repository functions: `createRecipe`, `updateRecipe`, `deleteRecipe`, `getRecipeById`, `getAllRecipes`, `searchRecipes`, `getRecipesByTags`, and combined search/tag filtering.
- Implemented grocery repository basics: active list creation/loading, item add/update/delete/toggle/clear, list loading, and lookup by normalized name/unit.
- Added transactional writes for recipes and grocery item mutations.
- Verified `npm run typecheck` succeeds.
- Verified Expo starts and Metro responds on `http://127.0.0.1:8081/status` with `packager-status:running`.

Acceptance checks:

- Database initializes without errors.
- Recipes can be created, read, updated, deleted, searched, and filtered by tags through repository calls.
- Related ingredients, instructions, tags, and images are persisted with recipes.

## WP-05: Recipe List And Detail

Status: Done

Goal: Display saved recipes and recipe details from local storage.

Scope:

- Build `RecipeCard`.
- Build Recipes tab list/grid.
- Build recipe detail screen.
- Show title, image, description, tags, cooking time, servings, ingredients, and instructions.
- Add refresh/loading/empty states.

Deliverables:

- Recipes screen connected to SQLite.
- Recipe detail screen connected to SQLite.
- Reusable recipe display components.

Progress:

- Started recipe list and detail work after WP-04 verification.
- Added `RecipeCard`, `TagRow`, and `StateMessage` reusable components.
- Connected the Recipes tab to `getAllRecipes()` from SQLite.
- Added loading, error, empty, and pull-to-refresh states for the Recipes tab.
- Added an explicit sample recipe seeding action for viewing the list/detail flow before manual creation exists.
- Connected the recipe detail route to `getRecipeById()`.
- Displayed recipe title, hero image or placeholder, description, tags, cooking time, servings, ingredients, instructions, and image strip support.
- Kept the edit route reachable from recipe detail for WP-06.
- Verified `npm run typecheck` succeeds.
- Verified Expo starts and Metro responds on `http://127.0.0.1:8081/status` with `packager-status:running`.

Acceptance checks:

- Saved recipes appear in the Recipes tab.
- Tapping a recipe opens its detail page.
- Empty and loading states are understandable.

## WP-06: Manual Recipe Create, Edit, And Delete

Status: Done

Goal: Implement the complete manual recipe flow.

Scope:

- Build `RecipeForm`.
- Add dynamic ingredient rows.
- Add dynamic instruction steps.
- Add tag selection.
- Save new manual recipes.
- Edit existing recipes.
- Delete recipes.
- Validate required fields.

Deliverables:

- Add Recipe manual form.
- Edit Recipe screen.
- Delete action on detail screen.

Progress:

- Started manual recipe create, edit, and delete work after WP-05 verification.
- Added reusable `RecipeForm`, `IngredientInputList`, `InstructionInputList`, and selectable `TagChips` components.
- Added validation for recipe title, at least one ingredient, at least one instruction step, numeric cooking time, numeric servings, and numeric ingredient amounts.
- Connected the Add Recipe tab to `createRecipe()` and navigates to the saved recipe detail page.
- Connected the Edit Recipe route to `getRecipeById()` and `updateRecipe()`.
- Added a delete action on the recipe detail page with confirmation and navigation back to Recipes.
- Preserved existing attached images when editing, ready for WP-07 image attachment.
- Verified `npm run typecheck` succeeds.

Acceptance checks:

- User can create a recipe manually.
- User can edit a saved recipe.
- User can delete a saved recipe.
- Ingredients and instructions can be added and removed dynamically.

## WP-07: Image Attachment

Status: Not started

Goal: Allow users to attach images to recipes.

Scope:

- Add gallery image selection through Expo ImagePicker.
- Add camera capture through Expo Camera.
- Attach one or more images to a recipe.
- Mark/display the main image.
- Show main image on recipe cards and all images on detail pages.

Deliverables:

- `ImagePickerField` component.
- Image support in create/edit flows.
- Image display in cards and detail screens.

Acceptance checks:

- User can add images from the gallery.
- User can add images from the camera.
- Recipe cards show the main image when present.
- Detail pages show attached images.

## WP-08: Search And Tag Filtering

Status: Not started

Goal: Add local search and multi-tag filtering to the Recipes tab.

Scope:

- Search title, description, ingredients, and tags.
- Add selectable tag chips.
- Combine search query and selected tags.
- Keep filtering responsive and clear.

Deliverables:

- Search bar.
- `TagChips` component.
- Search/filter repository or service logic.

Acceptance checks:

- Search finds matching recipes by title, description, ingredient name, or tag.
- One or more selected tags filter the list.
- Search and selected tags work together.

## WP-09: Grocery List

Status: Not started

Goal: Generate and manage a grocery list from recipes.

Scope:

- Implement `createGroceryListFromRecipe(recipeId)`.
- Get or create the active grocery list.
- Merge ingredients only when normalized name and unit match.
- Group grocery items by category.
- Build Grocery List tab.
- Add checkbox, edit, and delete behavior.
- Add Create grocery list button to recipe detail.

Deliverables:

- Grocery list service.
- Grocery list screen.
- Grocery item component.
- Recipe detail integration.

Acceptance checks:

- Creating a grocery list from a recipe adds its ingredients.
- Duplicate ingredients with matching name and unit are merged.
- Different units stay separate.
- User can check off, edit, and delete grocery items.

## WP-10: Suggestions

Status: Not started

Goal: Add rule-based recipe suggestions from saved recipes.

Scope:

- Implement `getSuggestedRecipes()`.
- Score recipes by common tags, quick recipes, recency, and simple penalties.
- Build Suggestions tab.
- Show reason for each suggestion.

Deliverables:

- Suggestion service.
- `SuggestionCard` component.
- Suggestions screen.

Acceptance checks:

- Suggestions are generated from saved recipes.
- Suggestions are sorted by score.
- Each suggestion shows a clear reason.

## WP-11: Mocked Image-To-Recipe Flow

Status: Not started

Goal: Add the mocked camera/gallery extraction pipeline after the local MVP works.

Scope:

- Implement `extractTextFromImage(imageUri)` with mocked text.
- Implement `parseRecipeFromText(rawText)`.
- Implement `classifyRecipe(recipe)` with simple rules.
- Add camera/gallery modes in Add Recipe.
- Show editable recipe preview before saving.

Deliverables:

- Image extraction service.
- Recipe parser service.
- Recipe classifier service.
- Recipe preview screen.
- Add Recipe image extraction modes.

Acceptance checks:

- User can choose image-based recipe creation.
- Mocked extraction fills recipe fields.
- User can review and edit before saving.
- Saved extracted recipes use source type `camera` or `screenshot`.

## WP-12: MVP Acceptance Pass

Status: Not started

Goal: Verify, polish, and stabilize the MVP.

Scope:

- Run TypeScript and lint checks if available.
- Run the app and test the main user flows.
- Fix obvious UI, navigation, storage, and state issues.
- Update this file with final MVP status.

Deliverables:

- Passing verification checks where available.
- Updated status documentation.
- Short implementation summary.

Acceptance checks:

- Manual recipe creation works.
- Image attachment works.
- Recipes can be viewed, edited, deleted, searched, and filtered.
- Grocery list generation works.
- Grocery items can be checked off.
- Suggestions tab shows recommendations.
- Mocked image-to-recipe extraction works.

## Later, Post-MVP Packages

Status: Not started

These are intentionally outside the first MVP:

- Real OCR integration.
- LLM-based recipe extraction.
- Cloud sync and user accounts.
- Recipe sharing and URL import.
- Meal planning calendar.
- Nutrition estimation.
- Favorites and cooked history.
- Better recommendations.
- Offline OCR.
- Barcode scanning.
- PDF grocery export.
- Multi-language support.
- Unit conversion.
- Serving scaling.
