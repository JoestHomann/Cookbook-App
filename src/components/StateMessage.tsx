import { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "@/utils/theme";

interface StateMessageProps extends PropsWithChildren {
  actionLabel?: string;
  body: string;
  onAction?: () => void;
  title: string;
}

export function StateMessage({
  actionLabel,
  body,
  children,
  onAction,
  title
}: StateMessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {children}
      {actionLabel && onAction ? (
        <Pressable style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center"
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.leaf,
    borderRadius: radii.button,
    minHeight: 44,
    justifyContent: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  buttonText: {
    color: colors.onLeaf,
    fontSize: 15,
    fontWeight: "800"
  },
  container: {
    alignItems: "center",
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radii.panel,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center"
  }
});
