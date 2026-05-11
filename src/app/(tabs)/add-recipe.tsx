import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Href, router } from "expo-router";
import { type RefObject, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import { RecipeForm } from "@/components/RecipeForm";
import { ScreenScaffold } from "@/components/ScreenScaffold";
import { createRecipe } from "@/data/recipeRepository";
import { Recipe, RecipeImage, RecipeSourceType } from "@/models/Recipe";
import { extractTextFromImage } from "@/services/imageExtractionService";
import { classifyRecipe } from "@/services/recipeClassifierService";
import { parseRecipeFromText } from "@/services/recipeParserService";
import { nowIso } from "@/utils/date";
import { createId } from "@/utils/id";
import { normalizeTagName } from "@/utils/normalize";
import { colors, radii, sharedStyles, spacing } from "@/utils/theme";

type AddRecipeMode = "manual" | "camera" | "gallery";

function createRecipeImage(uri: string, recipeId: string): RecipeImage {
  return {
    id: createId("image"),
    recipeId,
    uri,
    isMainImage: true,
    createdAt: nowIso()
  };
}

function normalizeTags(tags: string[]) {
  return Array.from(new Set(tags.map(normalizeTagName).filter(Boolean)));
}

function createDraftRecipe({
  imageUri,
  parsedRecipe,
  sourceType
}: {
  imageUri: string;
  parsedRecipe: Partial<Recipe>;
  sourceType: RecipeSourceType;
}): Recipe {
  const timestamp = nowIso();
  const recipeId = createId("recipe");
  const classifiedTags = classifyRecipe(parsedRecipe);

  return {
    id: recipeId,
    title: parsedRecipe.title?.trim() || "Extracted recipe",
    description: parsedRecipe.description,
    ingredients: parsedRecipe.ingredients?.length
      ? parsedRecipe.ingredients
      : [
          {
            id: createId("ingredient"),
            name: "Review extracted ingredient",
            category: "other"
          }
        ],
    instructions: parsedRecipe.instructions?.length
      ? parsedRecipe.instructions
      : ["Review the extracted instructions."],
    cookingTimeMinutes: parsedRecipe.cookingTimeMinutes,
    servings: parsedRecipe.servings,
    tags: normalizeTags([...(parsedRecipe.tags ?? []), ...classifiedTags]),
    images: [createRecipeImage(imageUri, recipeId)],
    sourceType,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export default function AddRecipeRoute() {
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [mode, setMode] = useState<AddRecipeMode>("manual");

  async function handleSubmit(recipe: Recipe) {
    await createRecipe(recipe);
    router.replace(`/recipes/${recipe.id}` as Href);
  }

  function selectMode(nextMode: AddRecipeMode) {
    setError(null);
    setMode(nextMode);

    if (nextMode !== "camera") {
      setIsCameraOpen(false);
      setIsCameraReady(false);
    }
  }

  async function extractRecipe(imageUri: string, sourceType: RecipeSourceType) {
    setError(null);
    setIsExtracting(true);

    try {
      const rawText = await extractTextFromImage(imageUri);
      const parsedRecipe = await parseRecipeFromText(rawText);
      const draftRecipe = createDraftRecipe({
        imageUri,
        parsedRecipe,
        sourceType
      });
      const encodedDraft = encodeURIComponent(JSON.stringify(draftRecipe));

      router.push(`/recipes/preview?draft=${encodedDraft}` as Href);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : String(caughtError)
      );
    } finally {
      setIsExtracting(false);
    }
  }

  async function chooseFromGallery() {
    setError(null);

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync(false);

      if (!permission.granted) {
        setError("Photo library permission is required to extract a recipe.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.85
      });

      if (!result.canceled && result.assets[0]?.uri) {
        await extractRecipe(result.assets[0].uri, "screenshot");
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : String(caughtError)
      );
    }
  }

  async function openCamera() {
    setError(null);

    try {
      const permission = cameraPermission?.granted
        ? cameraPermission
        : await requestCameraPermission();

      if (!permission.granted) {
        setError("Camera permission is required to extract a recipe.");
        return;
      }

      setIsCameraReady(false);
      setIsCameraOpen(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : String(caughtError)
      );
    }
  }

  async function capturePhoto() {
    setError(null);

    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.85
      });

      if (!photo?.uri) {
        throw new Error("The camera did not return a photo.");
      }

      setIsCameraOpen(false);
      setIsCameraReady(false);
      await extractRecipe(photo.uri, "camera");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : String(caughtError)
      );
    }
  }

  return (
    <ScreenScaffold
      eyebrow="Add Recipe"
      title={mode === "manual" ? "Manual recipe entry" : "Extract from image"}
      description={
        mode === "manual"
          ? "Save a recipe with ingredients, instructions, cooking details, and tags."
          : "Use the mocked extraction pipeline, then review the recipe before saving."
      }
    >
      <View style={styles.modeSelector}>
        <ModeButton
          label="Manual"
          mode="manual"
          onSelect={selectMode}
          selectedMode={mode}
        />
        <ModeButton
          label="Camera"
          mode="camera"
          onSelect={selectMode}
          selectedMode={mode}
        />
        <ModeButton
          label="Gallery"
          mode="gallery"
          onSelect={selectMode}
          selectedMode={mode}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {mode === "manual" ? (
        <RecipeForm onSubmit={handleSubmit} submitLabel="Save recipe" />
      ) : (
        <View style={sharedStyles.panel}>
          <Text style={sharedStyles.panelTitle}>
            {mode === "camera" ? "Camera extraction" : "Gallery extraction"}
          </Text>
          <Text style={sharedStyles.bodyText}>
            {mode === "camera"
              ? "Take a recipe photo and the mocked extractor will create an editable draft."
              : "Choose a recipe image or screenshot and the mocked extractor will create an editable draft."}
          </Text>

          {mode === "camera" ? (
            <CameraExtraction
              cameraRef={cameraRef}
              isCameraOpen={isCameraOpen}
              isCameraReady={isCameraReady}
              isExtracting={isExtracting}
              onCameraReady={() => setIsCameraReady(true)}
              onCapture={capturePhoto}
              onClose={() => {
                setIsCameraOpen(false);
                setIsCameraReady(false);
              }}
              onOpenCamera={openCamera}
              onMountError={(message) => setError(message)}
            />
          ) : (
            <Pressable
              accessibilityRole="button"
              disabled={isExtracting}
              onPress={chooseFromGallery}
              style={[styles.primaryButton, isExtracting ? styles.disabled : null]}
            >
              {isExtracting ? (
                <ActivityIndicator color={colors.onLeaf} />
              ) : (
                <Text style={styles.primaryButtonText}>Choose image</Text>
              )}
            </Pressable>
          )}
        </View>
      )}
    </ScreenScaffold>
  );
}

function ModeButton({
  label,
  mode,
  onSelect,
  selectedMode
}: {
  label: string;
  mode: AddRecipeMode;
  onSelect: (mode: AddRecipeMode) => void;
  selectedMode: AddRecipeMode;
}) {
  const isSelected = mode === selectedMode;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onSelect(mode)}
      style={[styles.modeButton, isSelected ? styles.selectedModeButton : null]}
    >
      <Text
        style={[
          styles.modeButtonText,
          isSelected ? styles.selectedModeButtonText : null
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CameraExtraction({
  cameraRef,
  isCameraOpen,
  isCameraReady,
  isExtracting,
  onCameraReady,
  onCapture,
  onClose,
  onMountError,
  onOpenCamera
}: {
  cameraRef: RefObject<CameraView | null>;
  isCameraOpen: boolean;
  isCameraReady: boolean;
  isExtracting: boolean;
  onCameraReady: () => void;
  onCapture: () => void;
  onClose: () => void;
  onMountError: (message: string) => void;
  onOpenCamera: () => void;
}) {
  if (!isCameraOpen) {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={isExtracting}
        onPress={onOpenCamera}
        style={[styles.primaryButton, isExtracting ? styles.disabled : null]}
      >
        {isExtracting ? (
          <ActivityIndicator color={colors.onLeaf} />
        ) : (
          <Text style={styles.primaryButtonText}>Open camera</Text>
        )}
      </Pressable>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView
        active={isCameraOpen}
        facing="back"
        mode="picture"
        onCameraReady={onCameraReady}
        onMountError={(cameraError) => onMountError(cameraError.message)}
        ref={cameraRef}
        style={styles.cameraPreview}
      />
      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          disabled={isExtracting || !isCameraReady}
          onPress={onCapture}
          style={[
            styles.primaryButton,
            isExtracting || !isCameraReady ? styles.disabled : null
          ]}
        >
          {isExtracting ? (
            <ActivityIndicator color={colors.onLeaf} />
          ) : (
            <Text style={styles.primaryButtonText}>Capture and extract</Text>
          )}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Close</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md
  },
  cameraContainer: {
    gap: spacing.sm,
    marginTop: spacing.md
  },
  cameraPreview: {
    aspectRatio: 4 / 3,
    backgroundColor: colors.surface,
    borderRadius: radii.panel,
    overflow: "hidden",
    width: "100%"
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
  modeButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radii.button,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  modeButtonText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "800"
  },
  modeSelector: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radii.panel,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm
  },
  primaryButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.leaf,
    borderRadius: radii.button,
    minHeight: 44,
    justifyContent: "center",
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  primaryButtonText: {
    color: colors.onLeaf,
    fontSize: 15,
    fontWeight: "900"
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: colors.leaf,
    borderRadius: radii.button,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  secondaryButtonText: {
    color: colors.leaf,
    fontSize: 15,
    fontWeight: "800"
  },
  selectedModeButton: {
    backgroundColor: colors.leaf,
    borderColor: colors.leaf
  },
  selectedModeButtonText: {
    color: colors.onLeaf
  }
});
