import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { GroceryItem } from "@/models/GroceryList";
import { colors, radii, spacing } from "@/utils/theme";

interface GroceryListItemProps {
  item: GroceryItem;
  onDelete: (item: GroceryItem) => void;
  onSave: (item: GroceryItem) => Promise<void>;
  onToggle: (item: GroceryItem) => Promise<void>;
}

function formatAmount(item: GroceryItem) {
  return [item.amount, item.unit]
    .filter((part) => part !== undefined && part !== "")
    .join(" ");
}

function parseOptionalAmount(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed.replace(",", "."));

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Amount must be a positive number.");
  }

  return parsed;
}

export function GroceryListItem({
  item,
  onDelete,
  onSave,
  onToggle
}: GroceryListItemProps) {
  const [amount, setAmount] = useState(
    typeof item.amount === "number" ? String(item.amount) : ""
  );
  const [category, setCategory] = useState(item.category ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(item.name);
  const [unit, setUnit] = useState(item.unit ?? "");

  useEffect(() => {
    setAmount(typeof item.amount === "number" ? String(item.amount) : "");
    setCategory(item.category ?? "");
    setName(item.name);
    setUnit(item.unit ?? "");
  }, [item.amount, item.category, item.id, item.name, item.unit]);

  function resetForm() {
    setAmount(typeof item.amount === "number" ? String(item.amount) : "");
    setCategory(item.category ?? "");
    setError(null);
    setName(item.name);
    setUnit(item.unit ?? "");
  }

  async function handleSave() {
    setError(null);

    try {
      const trimmedName = name.trim();

      if (!trimmedName) {
        throw new Error("Item name is required.");
      }

      setIsSaving(true);
      await onSave({
        ...item,
        name: trimmedName,
        amount: parseOptionalAmount(amount),
        unit: unit.trim() || undefined,
        category: category.trim() || undefined
      });
      setIsEditing(false);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : String(caughtError)
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isEditing) {
    return (
      <View style={styles.card}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Item</Text>
          <TextInput
            onChangeText={setName}
            placeholder="Flour"
            style={styles.input}
            value={name}
          />
        </View>
        <View style={styles.inlineFields}>
          <View style={styles.inlineField}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              keyboardType="decimal-pad"
              onChangeText={setAmount}
              placeholder="200"
              style={styles.input}
              value={amount}
            />
          </View>
          <View style={styles.inlineField}>
            <Text style={styles.label}>Unit</Text>
            <TextInput
              onChangeText={setUnit}
              placeholder="g"
              style={styles.input}
              value={unit}
            />
          </View>
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            onChangeText={setCategory}
            placeholder="dry goods"
            style={styles.input}
            value={category}
          />
        </View>
        <View style={styles.buttonRow}>
          <Pressable
            disabled={isSaving}
            onPress={handleSave}
            style={[styles.primaryButton, isSaving ? styles.disabled : null]}
          >
            <Text style={styles.primaryButtonText}>
              {isSaving ? "Saving" : "Save"}
            </Text>
          </Pressable>
          <Pressable
            disabled={isSaving}
            onPress={() => {
              resetForm();
              setIsEditing(false);
            }}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, item.checked ? styles.checkedCard : null]}>
      <View style={styles.itemRow}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: item.checked }}
          onPress={() => onToggle(item)}
          style={[styles.checkbox, item.checked ? styles.checkedBox : null]}
        >
          <Text style={styles.checkboxText}>{item.checked ? "X" : ""}</Text>
        </Pressable>
        <View style={styles.itemContent}>
          <Text
            style={[
              styles.itemName,
              item.checked ? styles.checkedText : null
            ]}
          >
            {item.name}
          </Text>
          {formatAmount(item) ? (
            <Text style={styles.metaText}>{formatAmount(item)}</Text>
          ) : null}
          {item.sourceRecipeIds.length > 0 ? (
            <Text style={styles.sourceText}>
              {item.sourceRecipeIds.length === 1
                ? "From 1 recipe"
                : `From ${item.sourceRecipeIds.length} recipes`}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.buttonRow}>
        <Pressable onPress={() => setIsEditing(true)} style={styles.textButton}>
          <Text style={styles.textButtonText}>Edit</Text>
        </Pressable>
        <Pressable onPress={() => onDelete(item)} style={styles.textButton}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radii.panel,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md
  },
  checkbox: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 4,
    borderWidth: 1,
    height: 28,
    justifyContent: "center",
    marginTop: 2,
    width: 28
  },
  checkboxText: {
    color: colors.onLeaf,
    fontSize: 14,
    fontWeight: "900"
  },
  checkedBox: {
    backgroundColor: colors.leaf,
    borderColor: colors.leaf
  },
  checkedCard: {
    opacity: 0.72
  },
  checkedText: {
    textDecorationLine: "line-through"
  },
  deleteButtonText: {
    color: "#9b3d35",
    fontSize: 14,
    fontWeight: "800"
  },
  disabled: {
    opacity: 0.65
  },
  errorText: {
    color: "#9b3d35",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20
  },
  fieldGroup: {
    gap: spacing.xs
  },
  inlineField: {
    flex: 1,
    gap: spacing.xs
  },
  inlineFields: {
    flexDirection: "row",
    gap: spacing.sm
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.button,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 42,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  itemContent: {
    flex: 1,
    gap: spacing.xs
  },
  itemName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 22
  },
  itemRow: {
    flexDirection: "row",
    gap: spacing.md
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800"
  },
  metaText: {
    color: colors.leaf,
    fontSize: 14,
    fontWeight: "800"
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.leaf,
    borderRadius: radii.button,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  primaryButtonText: {
    color: colors.onLeaf,
    fontSize: 14,
    fontWeight: "900"
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radii.button,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800"
  },
  sourceText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  textButton: {
    minHeight: 32,
    justifyContent: "center",
    paddingRight: spacing.md
  },
  textButtonText: {
    color: colors.leaf,
    fontSize: 14,
    fontWeight: "800"
  }
});
