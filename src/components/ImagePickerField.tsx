import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

import { RecipeImage } from "@/models/Recipe";
import { nowIso } from "@/utils/date";
import { createId } from "@/utils/id";
import { colors, radii, spacing } from "@/utils/theme";

interface ImagePickerFieldProps {
  images: RecipeImage[];
  onChange: (images: RecipeImage[]) => void;
}

function normalizeMainImage(images: RecipeImage[]) {
  if (images.length === 0) {
    return [];
  }

  const mainIndex = images.findIndex((image) => image.isMainImage);
  const selectedMainIndex = mainIndex >= 0 ? mainIndex : 0;

  return images.map((image, index) => ({
    ...image,
    isMainImage: index === selectedMainIndex
  }));
}

function createRecipeImage(uri: string, isMainImage: boolean): RecipeImage {
  return {
    id: createId("image"),
    recipeId: "",
    uri,
    isMainImage,
    createdAt: nowIso()
  };
}

function formatError(caughtError: unknown) {
  return caughtError instanceof Error ? caughtError.message : String(caughtError);
}

export function ImagePickerField({ images, onChange }: ImagePickerFieldProps) {
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPicking, setIsPicking] = useState(false);

  function appendImageUris(uris: string[]) {
    if (uris.length === 0) {
      return;
    }

    const hasExistingImages = images.length > 0;
    const addedImages = uris.map((uri, index) =>
      createRecipeImage(uri, !hasExistingImages && index === 0)
    );

    onChange(normalizeMainImage([...images, ...addedImages]));
  }

  async function chooseFromGallery() {
    setError(null);
    setIsPicking(true);

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync(false);

      if (!permission.granted) {
        setError("Photo library permission is required to attach images.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        mediaTypes: ["images"],
        orderedSelection: true,
        quality: 0.85,
        selectionLimit: 0
      });

      if (!result.canceled) {
        appendImageUris(result.assets.map((asset) => asset.uri).filter(Boolean));
      }
    } catch (caughtError) {
      setError(formatError(caughtError));
    } finally {
      setIsPicking(false);
    }
  }

  async function openCamera() {
    setError(null);

    try {
      const permission = cameraPermission?.granted
        ? cameraPermission
        : await requestCameraPermission();

      if (!permission.granted) {
        setError("Camera permission is required to take a recipe photo.");
        return;
      }

      setIsCameraReady(false);
      setIsCameraOpen(true);
    } catch (caughtError) {
      setError(formatError(caughtError));
    }
  }

  async function capturePhoto() {
    setError(null);
    setIsCapturing(true);

    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.85
      });

      if (!photo?.uri) {
        throw new Error("The camera did not return a photo.");
      }

      appendImageUris([photo.uri]);
      setIsCameraOpen(false);
      setIsCameraReady(false);
    } catch (caughtError) {
      setError(formatError(caughtError));
    } finally {
      setIsCapturing(false);
    }
  }

  function removeImage(id: string) {
    onChange(normalizeMainImage(images.filter((image) => image.id !== id)));
  }

  function setMainImage(id: string) {
    onChange(
      images.map((image) => ({
        ...image,
        isMainImage: image.id === id
      }))
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          disabled={isPicking}
          onPress={chooseFromGallery}
          style={[styles.actionButton, isPicking ? styles.disabled : null]}
        >
          {isPicking ? (
            <ActivityIndicator color={colors.leaf} />
          ) : (
            <Text style={styles.actionButtonText}>Choose from gallery</Text>
          )}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={openCamera}
          style={styles.actionButton}
        >
          <Text style={styles.actionButtonText}>Take photo</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {isCameraOpen ? (
        <View style={styles.cameraContainer}>
          <CameraView
            active={isCameraOpen}
            facing="back"
            mode="picture"
            onCameraReady={() => setIsCameraReady(true)}
            onMountError={(cameraError) => setError(cameraError.message)}
            ref={cameraRef}
            style={styles.cameraPreview}
          />
          <View style={styles.cameraActions}>
            <Pressable
              accessibilityRole="button"
              disabled={isCapturing || !isCameraReady}
              onPress={capturePhoto}
              style={[
                styles.captureButton,
                isCapturing || !isCameraReady ? styles.disabled : null
              ]}
            >
              {isCapturing ? (
                <ActivityIndicator color={colors.onLeaf} />
              ) : (
                <Text style={styles.captureButtonText}>Capture</Text>
              )}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setIsCameraOpen(false);
                setIsCameraReady(false);
              }}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {images.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.imageStrip}>
            {images.map((image) => (
              <View key={image.id} style={styles.imageItem}>
                <Image source={{ uri: image.uri }} style={styles.thumbnail} />
                {image.isMainImage ? (
                  <Text style={styles.mainBadge}>Main image</Text>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setMainImage(image.id)}
                    style={styles.inlineButton}
                  >
                    <Text style={styles.inlineButtonText}>Set main</Text>
                  </Pressable>
                )}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => removeImage(image.id)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No images added yet.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radii.button,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  actionButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800"
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  cameraActions: {
    flexDirection: "row",
    gap: spacing.sm
  },
  cameraContainer: {
    gap: spacing.sm
  },
  cameraPreview: {
    aspectRatio: 4 / 3,
    backgroundColor: colors.surface,
    borderRadius: radii.panel,
    overflow: "hidden",
    width: "100%"
  },
  captureButton: {
    alignItems: "center",
    backgroundColor: colors.leaf,
    borderRadius: radii.button,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  captureButtonText: {
    color: colors.onLeaf,
    fontSize: 14,
    fontWeight: "900"
  },
  container: {
    gap: spacing.md
  },
  disabled: {
    opacity: 0.65
  },
  emptyBox: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.panel,
    borderWidth: 1,
    minHeight: 96,
    justifyContent: "center",
    padding: spacing.md
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700"
  },
  errorText: {
    color: "#9b3d35",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20
  },
  imageItem: {
    gap: spacing.xs,
    width: 128
  },
  imageStrip: {
    flexDirection: "row",
    gap: spacing.md
  },
  inlineButton: {
    alignItems: "center",
    borderColor: colors.leaf,
    borderRadius: radii.button,
    borderWidth: 1,
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  inlineButtonText: {
    color: colors.leaf,
    fontSize: 12,
    fontWeight: "800"
  },
  mainBadge: {
    backgroundColor: "#edf3ed",
    borderRadius: radii.button,
    color: colors.leaf,
    fontSize: 12,
    fontWeight: "900",
    minHeight: 34,
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    textAlign: "center"
  },
  removeButton: {
    alignItems: "center",
    minHeight: 30,
    justifyContent: "center"
  },
  removeButtonText: {
    color: "#9b3d35",
    fontSize: 12,
    fontWeight: "800"
  },
  thumbnail: {
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.panel,
    width: 128
  }
});
