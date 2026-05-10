import { StyleSheet } from "react-native";

export const colors = {
  background: "#fbfaf7",
  border: "#dfddd4",
  leaf: "#3f6f4e",
  muted: "#667064",
  onLeaf: "#ffffff",
  panel: "#ffffff",
  surface: "#f5f1e8",
  text: "#20251f"
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  xxl: 40
};

export const radii = {
  panel: 8,
  button: 8
};

export const sharedStyles = StyleSheet.create({
  bodyText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  },
  panel: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radii.panel,
    borderWidth: 1,
    padding: spacing.lg
  },
  panelTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: spacing.sm
  },
  textLink: {
    color: colors.leaf,
    fontSize: 15,
    fontWeight: "800",
    marginTop: spacing.md
  }
});
