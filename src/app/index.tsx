import { Href, Redirect } from "expo-router";

export default function HomeScreen() {
  return <Redirect href={"/recipes" as Href} />;
}
