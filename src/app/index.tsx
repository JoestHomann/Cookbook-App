import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Cookbook App</Text>
      <Text style={styles.title}>Project foundation is ready.</Text>
      <Text style={styles.body}>
        The tab shell, data layer, and recipe workflows will land in the next
        work packages.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fbfaf7"
  },
  eyebrow: {
    marginBottom: 12,
    color: "#617264",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  title: {
    color: "#20251f",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36
  },
  body: {
    marginTop: 14,
    color: "#566057",
    fontSize: 16,
    lineHeight: 24
  }
});