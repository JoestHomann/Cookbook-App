import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "@/utils/theme";

interface TagChipsProps {
  availableTags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export function TagChips({
  availableTags,
  onChange,
  selectedTags
}: TagChipsProps) {
  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((selectedTag) => selectedTag !== tag));
      return;
    }

    onChange([...selectedTags, tag]);
  }

  return (
    <View style={styles.container}>
      {availableTags.map((tag) => {
        const selected = selectedTags.includes(tag);

        return (
          <Pressable
            key={tag}
            onPress={() => toggleTag(tag)}
            style={[styles.chip, selected ? styles.selectedChip : null]}
          >
            <Text
              style={[
                styles.chipText,
                selected ? styles.selectedChipText : null
              ]}
            >
              {tag}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderColor: colors.border,
    borderRadius: radii.button,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  chipText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "800"
  },
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  selectedChip: {
    backgroundColor: colors.leaf,
    borderColor: colors.leaf
  },
  selectedChipText: {
    color: colors.onLeaf
  }
});
