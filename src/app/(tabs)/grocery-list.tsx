import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import { GroceryListItem } from "@/components/GroceryListItem";
import { ScreenScaffold } from "@/components/ScreenScaffold";
import { StateMessage } from "@/components/StateMessage";
import {
  clearCheckedGroceryItems,
  deleteGroceryItem,
  getActiveGroceryList,
  toggleGroceryItemChecked,
  updateGroceryItem
} from "@/data/groceryRepository";
import { GroceryItem, GroceryList } from "@/models/GroceryList";
import { colors, radii, sharedStyles, spacing } from "@/utils/theme";

function groupItemsByCategory(items: GroceryItem[]) {
  const groupMap = new Map<string, GroceryItem[]>();

  for (const item of items) {
    const category = item.category?.trim() || "other";
    groupMap.set(category, [...(groupMap.get(category) ?? []), item]);
  }

  return Array.from(groupMap.entries())
    .map(([category, groupedItems]) => ({
      category,
      items: groupedItems
    }))
    .sort((firstGroup, secondGroup) => {
      if (firstGroup.category === secondGroup.category) {
        return 0;
      }

      if (firstGroup.category === "other") {
        return 1;
      }

      if (secondGroup.category === "other") {
        return -1;
      }

      return firstGroup.category.localeCompare(secondGroup.category);
    });
}

function formatListSummary(list: GroceryList | null) {
  const items = list?.items ?? [];
  const checkedCount = items.filter((item) => item.checked).length;

  if (items.length === 0) {
    return "No shopping items yet";
  }

  return `${items.length} items - ${checkedCount} checked`;
}

export default function GroceryListRoute() {
  const [error, setError] = useState<string | null>(null);
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const itemGroups = useMemo(
    () => groupItemsByCategory(groceryList?.items ?? []),
    [groceryList]
  );
  const checkedItemCount =
    groceryList?.items.filter((item) => item.checked).length ?? 0;

  const loadGroceryList = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      setGroceryList(await getActiveGroceryList());
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : String(caughtError)
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGroceryList();
    }, [loadGroceryList])
  );

  async function handleToggleItem(item: GroceryItem) {
    if (!groceryList) {
      return;
    }

    setError(null);

    try {
      await toggleGroceryItemChecked(groceryList.id, item.id, !item.checked);
      await loadGroceryList();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : String(caughtError)
      );
    }
  }

  async function handleSaveItem(item: GroceryItem) {
    if (!groceryList) {
      return;
    }

    setError(null);

    try {
      await updateGroceryItem(groceryList.id, item);
      await loadGroceryList();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : String(caughtError)
      );
      throw caughtError;
    }
  }

  function confirmDeleteItem(item: GroceryItem) {
    Alert.alert("Delete item", `Delete ${item.name} from the list?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDeleteItem(item)
      }
    ]);
  }

  async function handleDeleteItem(item: GroceryItem) {
    if (!groceryList) {
      return;
    }

    setError(null);

    try {
      await deleteGroceryItem(groceryList.id, item.id);
      await loadGroceryList();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : String(caughtError)
      );
    }
  }

  function confirmClearChecked() {
    Alert.alert("Clear checked items", "Remove all checked grocery items?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: handleClearChecked
      }
    ]);
  }

  async function handleClearChecked() {
    if (!groceryList) {
      return;
    }

    setError(null);
    setIsClearing(true);

    try {
      await clearCheckedGroceryItems(groceryList.id);
      await loadGroceryList();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : String(caughtError)
      );
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <ScreenScaffold
      eyebrow="Grocery List"
      title="Current grocery list"
      description={formatListSummary(groceryList)}
    >
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.leaf} size="large" />
        </View>
      ) : null}

      {!isLoading && error ? (
        <StateMessage
          actionLabel="Try again"
          body={error}
          onAction={loadGroceryList}
          title="Grocery list could not load"
        />
      ) : null}

      {!isLoading && !error && (!groceryList || groceryList.items.length === 0) ? (
        <StateMessage
          body="Open a recipe detail page and create a grocery list from its ingredients."
          title="Nothing to shop yet"
        />
      ) : null}

      {!isLoading && !error && groceryList && groceryList.items.length > 0 ? (
        <>
          <View style={sharedStyles.panel}>
            <Text style={sharedStyles.panelTitle}>List actions</Text>
            <View style={styles.actionRow}>
              <Pressable
                accessibilityRole="button"
                onPress={loadGroceryList}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Refresh</Text>
              </Pressable>
              {checkedItemCount > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  disabled={isClearing}
                  onPress={confirmClearChecked}
                  style={[
                    styles.dangerButton,
                    isClearing ? styles.disabled : null
                  ]}
                >
                  <Text style={styles.dangerButtonText}>
                    {isClearing ? "Clearing" : "Clear checked"}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          {itemGroups.map((group) => (
            <Section key={group.category} title={group.category}>
              {group.items.map((item) => (
                <GroceryListItem
                  item={item}
                  key={item.id}
                  onDelete={confirmDeleteItem}
                  onSave={handleSaveItem}
                  onToggle={handleToggleItem}
                />
              ))}
            </Section>
          ))}
        </>
      ) : null}
    </ScreenScaffold>
  );
}

function Section({
  children,
  title
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <View style={styles.groupSection}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  dangerButton: {
    alignItems: "center",
    borderColor: "#d89b95",
    borderRadius: radii.button,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  dangerButtonText: {
    color: "#9b3d35",
    fontSize: 14,
    fontWeight: "800"
  },
  disabled: {
    opacity: 0.65
  },
  groupSection: {
    gap: spacing.sm
  },
  groupTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    textTransform: "capitalize"
  },
  loading: {
    alignItems: "center",
    minHeight: 180,
    justifyContent: "center"
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
  sectionContent: {
    gap: spacing.sm
  }
});
