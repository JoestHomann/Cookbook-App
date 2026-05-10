import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "@/utils/theme";

interface TagRowProps {
  tags: string[];
}

export function TagRow({ tags }: TagRowProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {tags.map((tag) => (
        <Text key={tag} style={styles.tag}>
          {tag}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  tag: {
    backgroundColor: "#edf3ed",
    borderColor: "#d4e3d4",
    borderRadius: radii.button,
    borderWidth: 1,
    color: colors.leaf,
    fontSize: 13,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  }
});
