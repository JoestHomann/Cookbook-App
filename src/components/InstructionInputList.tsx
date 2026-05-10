import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radii, spacing } from "@/utils/theme";

export interface InstructionFormValue {
  id: string;
  text: string;
}

interface InstructionInputListProps {
  instructions: InstructionFormValue[];
  onChange: (instructions: InstructionFormValue[]) => void;
  onCreate: () => InstructionFormValue;
}

export function InstructionInputList({
  instructions,
  onChange,
  onCreate
}: InstructionInputListProps) {
  function updateInstruction(id: string, text: string) {
    onChange(
      instructions.map((instruction) =>
        instruction.id === id ? { ...instruction, text } : instruction
      )
    );
  }

  function removeInstruction(id: string) {
    const remaining = instructions.filter((instruction) => instruction.id !== id);
    onChange(remaining.length > 0 ? remaining : [onCreate()]);
  }

  return (
    <View style={styles.container}>
      {instructions.map((instruction, index) => (
        <View key={instruction.id} style={styles.row}>
          <View style={styles.rowHeader}>
            <Text style={styles.rowTitle}>Step {index + 1}</Text>
            <Pressable onPress={() => removeInstruction(instruction.id)}>
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
          <TextInput
            multiline
            onChangeText={(value) => updateInstruction(instruction.id, value)}
            placeholder="Describe this step"
            style={[styles.input, styles.multilineInput]}
            textAlignVertical="top"
            value={instruction.text}
          />
        </View>
      ))}

      <Pressable style={styles.secondaryButton} onPress={() => onChange([...instructions, onCreate()])}>
        <Text style={styles.secondaryButtonText}>Add step</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  multilineInput: {
    minHeight: 92
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
