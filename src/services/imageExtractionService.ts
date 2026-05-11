export async function extractTextFromImage(imageUri: string) {
  if (!imageUri.trim()) {
    throw new Error("Choose an image before extracting a recipe.");
  }

  await new Promise((resolve) => setTimeout(resolve, 250));

  return `
Chocolate Pancakes

Ingredients:
- 200 g flour
- 2 eggs
- 300 ml milk
- 2 tbsp sugar
- 50 g chocolate chips

Instructions:
1. Mix flour, eggs, milk, and sugar into a smooth batter.
2. Fold in the chocolate chips.
3. Fry small pancakes in a lightly oiled pan until golden.

Cooking time: 20 minutes
Servings: 2
`.trim();
}
