import { PropsWithChildren, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { getDatabase } from "@/data/database";
import { colors, spacing } from "@/utils/theme";

export function DatabaseGate({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getDatabase()
      .then(() => {
        if (!cancelled) {
          setStatus("ready");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setStatus("error");
          setMessage(error instanceof Error ? error.message : String(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "ready") {
    return children;
  }

  return (
    <View style={styles.container}>
      {status === "loading" ? (
        <ActivityIndicator color={colors.leaf} size="large" />
      ) : (
        <>
          <Text style={styles.title}>Database unavailable</Text>
          <Text style={styles.message}>{message}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    padding: spacing.lg
  },
  message: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center"
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800"
  }
});
