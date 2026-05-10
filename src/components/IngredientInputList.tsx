import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radii, spacing } from "@/utils/theme";

export interface IngredientFormValue {
  id: string;
  name: string;
  amount: string;
  unit: string;
  note: string;
  category: string;
}

interface IngredientInputListProps {
  ingredients: IngredientFormValue[];
  onChange: (ingredients: IngredientFormValue[]) => void;
  onCreate: () => IngredientFormValue;
}

export function IngredientInputList({
  ingredients,
  onChange,
  onCreate
}: IngredientInputListProps) {
  function updateIngredient(
    id: string,
    field: keyof IngredientFormValue,
    value: string
  ) {
    onChange(
      ingredients.map((ingredient) =>
        ingredient.id === id ? { ...ingredient, [field]: value } : ingredient
      )
    );
  }

  function removeIngredient(id: string) {
    const remaining = ingredients.filter((ingredient) => ingredient.id !== id);
    onChange(remaining.length > 0 ? remaining : [onCreate()]);
  }

  return (
    <View style={styles.container}>
      {ingredients.map((ingredient, index) => (
        <View key={ingredient.id} style={styles.row}>
          <View style={styles.rowHeader}>
            <Text style={styles.rowTitle}>Ingredient {index + 1}</Text>
            <Pressable onPress={() => removeIngredient(ingredient.id)}>
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
          <TextInput
            onChangeText={(value) =>
              updateIngredient(ingredient.id, "name", value)
            }
            placeholder="Name"
            style={styles.input}
            value={ingredient.name}
          />
          <View style={styles.inlineFields}>
            <TextInput
              keyboardType="decimal-pad"
              onChangeText={(value) =>
                updateIngredient(ingredient.id, "amount", value)
              }
              placeholder="Amount"
              style={[styles.input, styles.inlineInput]}
              value={ingredient.amount}
            />
            <TextInput
              onChangeText={(value) =>
                updateIngredient(ingredient.id, "unit", value)
              }
              placeholder="Unit"
              style={[styles.input, styles.inlineInput]}
              value={ingredient.unit}
            />
          </View>
          <TextInput
            onChangeText={(value) =>
              updateIngredient(ingredient.id, "category", value)
            }
            placeholder="Category"
            style={styles.input}
            value={ingredient.category}
          />
          <TextInput
            onChangeText={(value) =>
              updateIngredient(ingredient.id, "note", value)
            }
            placeholder="Note"
            style={styles.input}
            value={ingredient.note}
          />
        </View>
      ))}

      <Pressable style={styles.secondaryButton} onPress={() => onChange([...ingredients, onCreate()])}>
        <Text style={styles.secondaryButtonText}>Add ingredient</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md
  },
  inlineFields: {
    flexDirection: "row",
    gap: spacing.sm
  },
  inlineInput: {
    flex: 1
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
  removeText: {
    color: "#9b3d35",
    fontSize: 14,
    fontWeight: "800"
  },
  row: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.panel,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md
  },
  rowHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  rowTitle: {
    color: colors.text,
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
  }
});
