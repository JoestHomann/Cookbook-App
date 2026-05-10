import { Href, Link } from "expo-router";
import { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radii, spacing } from "@/utils/theme";

interface PlaceholderLinkProps extends PropsWithChildren {
  href: string;
}

export function PlaceholderLink({ children, href }: PlaceholderLinkProps) {
  return (
    <Link asChild href={href as Href}>
      <Pressable style={styles.button}>
        <Text style={styles.label}>{children}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.leaf,
    borderRadius: radii.button,
    marginTop: spacing.md,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  label: {
    color: colors.onLeaf,
    fontSize: 15,
    fontWeight: "800"
  }
});
