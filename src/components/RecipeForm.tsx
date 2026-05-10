import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import {
  IngredientFormValue,
  IngredientInputList
} from "@/components/IngredientInputList";
import { ImagePickerField } from "@/components/ImagePickerField";
import {
  InstructionFormValue,
  InstructionInputList
} from "@/components/InstructionInputList";
import { TagChips } from "@/components/TagChips";
import { Ingredient } from "@/models/Ingredient";
import { Recipe, RecipeImage } from "@/models/Recipe";
import { DEFAULT_RECIPE_TAGS } from "@/utils/constants";
import { nowIso } from "@/utils/date";
import { createId } from "@/utils/id";
import {
  normalizeOptionalText,
  normalizeTagName
} from "@/utils/normalize";
import { colors, radii, sharedStyles, spacing } from "@/utils/theme";

interface RecipeFormProps {
  initialRecipe?: Recipe;
  onSubmit: (recipe: Recipe) => Promise<void>;
  submitLabel: string;
}

function createIngredientInput(): IngredientFormValue {
  return {
    id: createId("ingredient_input"),
    name: "",
    amount: "",
    unit: "",
    note: "",
    category: ""
  };
}

function createInstructionInput(): InstructionFormValue {
  return {
    id: createId("instruction_input"),
    text: ""
  };
}

function ingredientToInput(ingredient: Ingredient): IngredientFormValue {
  return {
    id: ingredient.id,
    name: ingredient.name,
    amount:
      typeof ingredient.amount === "number" ? String(ingredient.amount) : "",
    unit: ingredient.unit ?? "",
    note: ingredient.note ?? "",
    category: ingredient.category ?? ""
  };
}

function parseOptionalPositiveNumber(value: string, label: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed.replace(",", "."));

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${label} must be a positive number.`);
  }

  return parsed;
}

function parseOptionalPositiveInteger(value: string, label: string) {
  const parsed = parseOptionalPositiveNumber(value, label);

  if (parsed === undefined) {
    return undefined;
  }

  if (!Number.isInteger(parsed)) {
    throw new Error(`${label} must be a whole number.`);
  }

  return parsed;
}

function normalizeTags(tags: string[]) {
  return Array.from(new Set(tags.map(normalizeTagName).filter(Boolean)));
}

function prepareRecipeImages(
  images: RecipeImage[],
  recipeId: string,
  fallbackCreatedAt: string
) {
  if (images.length === 0) {
    return [];
  }

  const mainIndex = images.findIndex((image) => image.isMainImage);
  const selectedMainIndex = mainIndex >= 0 ? mainIndex : 0;

  return images.map((image, index) => ({
    id: image.id || createId("image"),
    recipeId,
    uri: image.uri,
    isMainImage: index === selectedMainIndex,
    createdAt: image.createdAt || fallbackCreatedAt
  }));
}

export function RecipeForm({
  initialRecipe,
  onSubmit,
  submitLabel
}: RecipeFormProps) {
  const [customTag, setCustomTag] = useState("");
  const [description, setDescription] = useState(initialRecipe?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<IngredientFormValue[]>(
    initialRecipe?.ingredients.length
      ? initialRecipe.ingredients.map(ingredientToInput)
      : [createIngredientInput()]
  );
  const [instructions, setInstructions] = useState<InstructionFormValue[]>(
    initialRecipe?.instructions.length
      ? initialRecipe.instructions.map((instruction) => ({
          id: createId("instruction_input"),
          text: instruction
        }))
      : [createInstructionInput()]
  );
  const [images, setImages] = useState<RecipeImage[]>(
    initialRecipe?.images ?? []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    normalizeTags(initialRecipe?.tags ?? [])
  );
  const [servings, setServings] = useState(
    initialRecipe?.servings ? String(initialRecipe.servings) : ""
  );
  const [timeMinutes, setTimeMinutes] = useState(
    initialRecipe?.cookingTimeMinutes
      ? String(initialRecipe.cookingTimeMinutes)
      : ""
  );
  const [title, setTitle] = useState(initialRecipe?.title ?? "");

  const availableTags = useMemo(
    () => normalizeTags([...DEFAULT_RECIPE_TAGS, ...selectedTags]),
    [selectedTags]
  );

  function addCustomTag() {
    const tag = normalizeTagName(customTag);

    if (!tag) {
      return;
    }

    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }

    setCustomTag("");
  }

  async function handleSubmit() {
    setError(null);

    try {
      const trimmedTitle = title.trim();

      if (!trimmedTitle) {
        throw new Error("Recipe title is required.");
      }

      const cleanIngredients = ingredients
        .filter((ingredient) => ingredient.name.trim())
        .map((ingredient): Ingredient => {
          const amount = parseOptionalPositiveNumber(
            ingredient.amount,
            "Ingredient amount"
          );

          return {
            id: ingredient.id.startsWith("ingredient_input")
              ? createId("ingredient")
              : ingredient.id,
            name: ingredient.name.trim(),
            amount,
            unit: normalizeOptionalText(ingredient.unit),
            note: normalizeOptionalText(ingredient.note),
            category: normalizeOptionalText(ingredient.category)
          };
        });

      if (cleanIngredients.length === 0) {
        throw new Error("Add at least one ingredient.");
      }

      const cleanInstructions = instructions
        .map((instruction) => instruction.text.trim())
        .filter(Boolean);

      if (cleanInstructions.length === 0) {
        throw new Error("Add at least one instruction step.");
      }

      const timestamp = nowIso();
      const recipeId = initialRecipe?.id ?? createId("recipe");
      const cleanImages = prepareRecipeImages(images, recipeId, timestamp);
      const recipe: Recipe = {
        id: recipeId,
        title: trimmedTitle,
        description: normalizeOptionalText(description),
        ingredients: cleanIngredients,
        instructions: cleanInstructions,
        cookingTimeMinutes: parseOptionalPositiveInteger(
          timeMinutes,
          "Cooking time"
        ),
        servings: parseOptionalPositiveInteger(servings, "Servings"),
        tags: normalizeTags(selectedTags),
        images: cleanImages,
        sourceType: initialRecipe?.sourceType ?? "manual",
        createdAt: initialRecipe?.createdAt ?? timestamp,
        updatedAt: timestamp
      };

      setIsSubmitting(true);
      await onSubmit(recipe);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : String(caughtError)
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.form}>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={sharedStyles.panel}>
        <Text style={sharedStyles.panelTitle}>Basics</Text>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            onChangeText={setTitle}
            placeholder="Chocolate Pancakes"
            style={styles.input}
            value={title}
          />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            multiline
            onChangeText={setDescription}
            placeholder="Short description"
            style={[styles.input, styles.multilineInput]}
            textAlignVertical="top"
            value={description}
          />
        </View>
        <View style={styles.inlineFields}>
          <View style={styles.inlineField}>
            <Text style={styles.label}>Cooking time</Text>
            <TextInput
              keyboardType="number-pad"
              onChangeText={setTimeMinutes}
              placeholder="Minutes"
              style={styles.input}
              value={timeMinutes}
            />
          </View>
          <View style={styles.inlineField}>
            <Text style={styles.label}>Servings</Text>
            <TextInput
              keyboardType="number-pad"
              onChangeText={setServings}
              placeholder="Count"
              style={styles.input}
              value={servings}
            />
          </View>
        </View>
      </View>

      <View style={sharedStyles.panel}>
        <Text style={sharedStyles.panelTitle}>Images</Text>
        <ImagePickerField images={images} onChange={setImages} />
      </View>

      <View style={sharedStyles.panel}>
        <Text style={sharedStyles.panelTitle}>Ingredients</Text>
        <IngredientInputList
          ingredients={ingredients}
          onChange={setIngredients}
          onCreate={createIngredientInput}
        />
      </View>

      <View style={sharedStyles.panel}>
        <Text style={sharedStyles.panelTitle}>Instructions</Text>
        <InstructionInputList
          instructions={instructions}
          onChange={setInstructions}
          onCreate={createInstructionInput}
        />
      </View>

      <View style={sharedStyles.panel}>
        <Text style={sharedStyles.panelTitle}>Tags</Text>
        <TagChips
          availableTags={availableTags}
          onChange={setSelectedTags}
          selectedTags={selectedTags}
        />
        <View style={styles.customTagRow}>
          <TextInput
            onChangeText={setCustomTag}
            onSubmitEditing={addCustomTag}
            placeholder="Add custom tag"
            style={[styles.input, styles.customTagInput]}
            value={customTag}
          />
          <Pressable style={styles.secondaryButton} onPress={addCustomTag}>
            <Text style={styles.secondaryButtonText}>Add</Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        disabled={isSubmitting}
        onPress={handleSubmit}
        style={[styles.primaryButton, isSubmitting ? styles.disabled : null]}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.onLeaf} />
        ) : (
          <Text style={styles.primaryButtonText}>{submitLabel}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  customTagInput: {
    flex: 1
  },
  customTagRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md
  },
  disabled: {
    opacity: 0.65
  },
  errorText: {
    backgroundColor: "#f9e8e6",
    borderColor: "#f0c5c0",
    borderRadius: radii.panel,
    borderWidth: 1,
    color: "#8f3028",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 22,
    padding: spacing.md
  },
  fieldGroup: {
    gap: spacing.xs,
    marginBottom: spacing.md
  },
  form: {
    gap: spacing.lg
  },
  inlineField: {
    flex: 1,
    gap: spacing.xs
  },
  inlineFields: {
    flexDirection: "row",
    gap: spacing.md
  },
  input: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radii.button,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800"
  },
  multilineInput: {
    minHeight: 92
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.leaf,
    borderRadius: radii.button,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  primaryButtonText: {
    color: colors.onLeaf,
    fontSize: 16,
    fontWeight: "900"
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: colors.leaf,
    borderRadius: radii.button,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  secondaryButtonText: {
    color: colors.leaf,
    fontSize: 15,
    fontWeight: "800"
  }
});
