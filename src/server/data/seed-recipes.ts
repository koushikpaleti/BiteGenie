import type { RecipeDocumentShape, RecipeIngredient } from "@/types";

import { slugify } from "@/lib/utils";

type StepTechnique =
  | "poha"
  | "upma"
  | "idli"
  | "dosa"
  | "chilla"
  | "paratha"
  | "pongal"
  | "appam"
  | "curry"
  | "rice"
  | "wrap"
  | "khichdi"
  | "snack"
  | "drink";

type RecipeSeedTuple = [
  name: string,
  mealType: RecipeDocumentShape["mealType"],
  dietaryTags: RecipeDocumentShape["dietaryTags"],
  ingredientNames: string[],
  cookingTime: number,
  nutrition: RecipeDocumentShape["nutrition"],
  estimatedCost: number,
  technique: StepTechnique,
  notes: string,
];

const ingredientCatalog: Record<string, Omit<RecipeIngredient, "name">> = {
  poha: { quantity: 1.5, unit: "cup", category: "grains", estimatedCost: 0.7 },
  semolina: { quantity: 0.75, unit: "cup", category: "grains", estimatedCost: 0.5 },
  oats: { quantity: 0.75, unit: "cup", category: "grains", estimatedCost: 0.4 },
  millet: { quantity: 0.75, unit: "cup", category: "grains", estimatedCost: 0.6 },
  vermicelli: { quantity: 1, unit: "cup", category: "grains", estimatedCost: 0.5 },
  "idli batter": { quantity: 1.5, unit: "cup", category: "grains", estimatedCost: 0.9 },
  "dosa batter": { quantity: 1.5, unit: "cup", category: "grains", estimatedCost: 0.9 },
  "moong dal": { quantity: 0.75, unit: "cup", category: "pantry", estimatedCost: 0.7 },
  besan: { quantity: 0.75, unit: "cup", category: "pantry", estimatedCost: 0.5 },
  atta: { quantity: 1, unit: "cup", category: "grains", estimatedCost: 0.4 },
  curd: { quantity: 0.5, unit: "cup", category: "dairy", estimatedCost: 0.5 },
  yogurt: { quantity: 0.5, unit: "cup", category: "dairy", estimatedCost: 0.5 },
  paneer: { quantity: 120, unit: "g", category: "protein", estimatedCost: 1.8 },
  tofu: { quantity: 120, unit: "g", category: "protein", estimatedCost: 1.4 },
  chicken: { quantity: 150, unit: "g", category: "protein", estimatedCost: 2.8 },
  fish: { quantity: 150, unit: "g", category: "protein", estimatedCost: 3.2 },
  eggs: { quantity: 2, unit: "count", category: "protein", estimatedCost: 0.8 },
  egg: { quantity: 2, unit: "count", category: "protein", estimatedCost: 0.8 },
  rajma: { quantity: 0.75, unit: "cup", category: "pantry", estimatedCost: 0.8 },
  chole: { quantity: 0.75, unit: "cup", category: "pantry", estimatedCost: 0.8 },
  "black lentils": { quantity: 0.75, unit: "cup", category: "pantry", estimatedCost: 0.8 },
  "masoor dal": { quantity: 0.75, unit: "cup", category: "pantry", estimatedCost: 0.7 },
  "toor dal": { quantity: 0.75, unit: "cup", category: "pantry", estimatedCost: 0.7 },
  "moong dal split": { quantity: 0.75, unit: "cup", category: "pantry", estimatedCost: 0.7 },
  rice: { quantity: 1, unit: "cup", category: "grains", estimatedCost: 0.4 },
  "basmati rice": { quantity: 1, unit: "cup", category: "grains", estimatedCost: 0.6 },
  "brown rice": { quantity: 1, unit: "cup", category: "grains", estimatedCost: 0.6 },
  "red rice": { quantity: 1, unit: "cup", category: "grains", estimatedCost: 0.7 },
  quinoa: { quantity: 0.75, unit: "cup", category: "grains", estimatedCost: 0.8 },
  "ragi flour": { quantity: 0.75, unit: "cup", category: "grains", estimatedCost: 0.5 },
  bajra: { quantity: 0.75, unit: "cup", category: "grains", estimatedCost: 0.5 },
  "appam batter": { quantity: 1.5, unit: "cup", category: "grains", estimatedCost: 0.9 },
  "neer dosa batter": { quantity: 1.5, unit: "cup", category: "grains", estimatedCost: 0.8 },
  onion: { quantity: 1, unit: "count", category: "produce", estimatedCost: 0.3 },
  tomato: { quantity: 1, unit: "count", category: "produce", estimatedCost: 0.3 },
  potatoes: { quantity: 1, unit: "count", category: "produce", estimatedCost: 0.3 },
  "green peas": { quantity: 0.5, unit: "cup", category: "produce", estimatedCost: 0.4 },
  peanuts: { quantity: 2, unit: "tbsp", category: "nuts", estimatedCost: 0.3 },
  "curry leaves": { quantity: 8, unit: "leaves", category: "produce", estimatedCost: 0.1 },
  "mustard seeds": { quantity: 1, unit: "tsp", category: "pantry", estimatedCost: 0.1 },
  lemon: { quantity: 0.5, unit: "count", category: "produce", estimatedCost: 0.2 },
  coconut: { quantity: 2, unit: "tbsp", category: "produce", estimatedCost: 0.3 },
  carrots: { quantity: 0.5, unit: "cup", category: "produce", estimatedCost: 0.3 },
  beans: { quantity: 0.5, unit: "cup", category: "produce", estimatedCost: 0.3 },
  capsicum: { quantity: 0.5, unit: "count", category: "produce", estimatedCost: 0.4 },
  spinach: { quantity: 1, unit: "cup", category: "produce", estimatedCost: 0.4 },
  "methi leaves": { quantity: 1, unit: "cup", category: "produce", estimatedCost: 0.4 },
  mint: { quantity: 0.5, unit: "cup", category: "produce", estimatedCost: 0.2 },
  coriander: { quantity: 0.5, unit: "cup", category: "produce", estimatedCost: 0.2 },
  ginger: { quantity: 1, unit: "inch", category: "produce", estimatedCost: 0.1 },
  garlic: { quantity: 4, unit: "cloves", category: "produce", estimatedCost: 0.1 },
  "green chili": { quantity: 1, unit: "count", category: "produce", estimatedCost: 0.1 },
  "sambar powder": { quantity: 1, unit: "tbsp", category: "pantry", estimatedCost: 0.2 },
  "garam masala": { quantity: 1, unit: "tsp", category: "pantry", estimatedCost: 0.1 },
  turmeric: { quantity: 0.5, unit: "tsp", category: "pantry", estimatedCost: 0.1 },
  cumin: { quantity: 1, unit: "tsp", category: "pantry", estimatedCost: 0.1 },
  ghee: { quantity: 1, unit: "tbsp", category: "pantry", estimatedCost: 0.2 },
  oil: { quantity: 1, unit: "tbsp", category: "pantry", estimatedCost: 0.2 },
  "coconut milk": { quantity: 0.75, unit: "cup", category: "pantry", estimatedCost: 0.8 },
  "mixed vegetables": { quantity: 1, unit: "cup", category: "produce", estimatedCost: 0.7 },
  cauliflower: { quantity: 1, unit: "cup", category: "produce", estimatedCost: 0.5 },
  okra: { quantity: 1, unit: "cup", category: "produce", estimatedCost: 0.5 },
  cabbage: { quantity: 1, unit: "cup", category: "produce", estimatedCost: 0.4 },
  "bottle gourd": { quantity: 1, unit: "cup", category: "produce", estimatedCost: 0.4 },
  brinjal: { quantity: 1, unit: "cup", category: "produce", estimatedCost: 0.4 },
  mushroom: { quantity: 1, unit: "cup", category: "produce", estimatedCost: 0.8 },
  "chickpea flour noodles": { quantity: 1, unit: "cup", category: "grains", estimatedCost: 0.7 },
  phulka: { quantity: 2, unit: "count", category: "grains", estimatedCost: 0.4 },
  roti: { quantity: 2, unit: "count", category: "grains", estimatedCost: 0.4 },
  chapati: { quantity: 2, unit: "count", category: "grains", estimatedCost: 0.4 },
  paratha: { quantity: 2, unit: "count", category: "grains", estimatedCost: 0.7 },
  pav: { quantity: 2, unit: "count", category: "bakery", estimatedCost: 0.5 },
  "whole wheat wrap": { quantity: 1, unit: "count", category: "bakery", estimatedCost: 0.5 },
  banana: { quantity: 1, unit: "count", category: "produce", estimatedCost: 0.2 },
  mango: { quantity: 0.75, unit: "cup", category: "produce", estimatedCost: 0.6 },
  cucumber: { quantity: 0.5, unit: "count", category: "produce", estimatedCost: 0.2 },
  "puffed rice": { quantity: 1.5, unit: "cup", category: "grains", estimatedCost: 0.2 },
  chana: { quantity: 0.75, unit: "cup", category: "pantry", estimatedCost: 0.5 },
  "roasted chana": { quantity: 0.75, unit: "cup", category: "pantry", estimatedCost: 0.5 },
  makhana: { quantity: 1.5, unit: "cup", category: "nuts", estimatedCost: 0.6 },
  corn: { quantity: 1, unit: "cup", category: "produce", estimatedCost: 0.4 },
  "dhokla batter": { quantity: 1, unit: "cup", category: "pantry", estimatedCost: 0.5 },
  buttermilk: { quantity: 1, unit: "glass", category: "dairy", estimatedCost: 0.4 },
  milk: { quantity: 1, unit: "cup", category: "dairy", estimatedCost: 0.4 },
  "yogurt drink": { quantity: 1, unit: "glass", category: "dairy", estimatedCost: 0.5 },
  "sweet potato": { quantity: 1, unit: "count", category: "produce", estimatedCost: 0.4 },
  sprouts: { quantity: 1, unit: "cup", category: "protein", estimatedCost: 0.5 },
};

function createIngredient(name: string): RecipeIngredient {
  const preset = ingredientCatalog[name.toLowerCase()];

  if (preset) {
    return { name, ...preset };
  }

  return {
    name,
    quantity: 1,
    unit: "cup",
    category: "produce",
    estimatedCost: 0.4,
  };
}

function buildSteps(technique: StepTechnique, ingredients: string[]) {
  const hero = ingredients.slice(0, 3).join(", ");

  switch (technique) {
    case "poha":
      return [
        "Rinse the poha lightly and let it soften while you prep the tempering ingredients.",
        `Cook ${hero} with spices until fragrant and lightly golden.`,
        "Fold in the poha, season well, and finish with herbs or citrus before serving.",
      ];
    case "upma":
      return [
        "Dry roast the grain base briefly for a nuttier flavor and better texture.",
        `Saute ${hero} with tempered spices, then add water and simmer.`,
        "Finish with lemon or coriander and serve hot.",
      ];
    case "idli":
      return [
        "Prepare or portion the batter and grease the moulds or tray.",
        `Steam or warm the base while the ${hero} accompaniment cooks through.`,
        "Plate hot and finish with chutney, podi, or sambar.",
      ];
    case "dosa":
      return [
        "Spread the batter on a hot tawa until thin and crisp at the edges.",
        `Cook the ${hero} filling or side until aromatic and balanced.`,
        "Fold, serve hot, and pair with chutney or sambar.",
      ];
    case "chilla":
      return [
        "Whisk the batter until smooth and season it well.",
        `Cook thin chillas on a hot pan and add ${hero} as a topping or filling.`,
        "Fold and serve warm with mint chutney or yogurt.",
      ];
    case "paratha":
      return [
        `Prepare the stuffing with ${hero} and season it assertively.`,
        "Roll, stuff, and cook the flatbread until both sides are golden.",
        "Serve hot with yogurt, pickle, or a simple salad.",
      ];
    case "pongal":
      return [
        "Cook the rice and lentils together until soft and creamy.",
        `Temper ${hero} in ghee or oil until fragrant.`,
        "Fold the tempering into the pot and serve warm.",
      ];
    case "appam":
      return [
        "Cook the batter or starch base until the texture is tender and set.",
        `Simmer ${hero} together into a light stew or side.`,
        "Serve immediately while the center stays soft and delicate.",
      ];
    case "curry":
      return [
        `Build the masala with ${hero} until the base turns rich and glossy.`,
        "Simmer the main protein or vegetables until fully cooked and coated.",
        "Finish with herbs or a final spice touch and serve hot.",
      ];
    case "rice":
      return [
        `Cook the rice base and prep ${hero} in parallel for a faster meal.`,
        "Build the masala or seasoning until aromatic, then combine everything.",
        "Rest briefly, fluff, and serve with the suggested side.",
      ];
    case "wrap":
      return [
        `Cook or warm ${hero} until well seasoned and ready to pack.`,
        "Layer the filling inside the bread or wrap with a quick salad component.",
        "Roll tightly and serve warm for an easy planner-friendly meal.",
      ];
    case "khichdi":
      return [
        "Rinse the grains and lentils, then pressure cook or simmer until soft.",
        `Temper ${hero} in ghee or oil and fold it through.`,
        "Adjust the texture with water as needed and serve warm.",
      ];
    case "snack":
      return [
        `Prep ${hero} into bite-size pieces or a spoonable snack base.`,
        "Season with chaat masala, herbs, and crunch where needed.",
        "Serve fresh for the best texture and flavor.",
      ];
    case "drink":
      return [
        `Blend or whisk ${hero} until smooth and evenly mixed.`,
        "Adjust sweetness, spice, or salt to taste.",
        "Chill briefly or pour over ice before serving.",
      ];
  }
}

function createRecipe(seed: RecipeSeedTuple): RecipeDocumentShape {
  const [name, mealType, dietaryTags, ingredientNames, cookingTime, nutrition, estimatedCost, technique, notes] = seed;

  return {
    name,
    slug: slugify(name),
    mealType,
    dietaryTags,
    ingredients: ingredientNames.map(createIngredient),
    steps: buildSteps(technique, ingredientNames),
    cookingTime,
    nutrition,
    estimatedCost,
    source: "seed",
    likedBy: [],
    notes,
  };
}

const breakfastCatalog: RecipeSeedTuple[] = [
  ["Kanda Poha", "breakfast", ["balanced", "vegetarian"], ["poha", "onion", "green peas", "peanuts", "curry leaves", "mustard seeds", "lemon"], 18, { calories: 340, protein: 9, carbs: 49, fats: 12 }, 3.6, "poha", "Classic weekday poha with good satiety."],
  ["Peas Poha", "breakfast", ["balanced", "vegetarian"], ["poha", "green peas", "onion", "curry leaves", "mustard seeds", "lemon"], 16, { calories: 320, protein: 8, carbs: 50, fats: 9 }, 3.3, "poha", "Lighter poha that still feels complete."],
  ["Paneer Poha", "breakfast", ["balanced", "vegetarian", "high-protein"], ["poha", "paneer", "onion", "green peas", "curry leaves", "lemon"], 20, { calories: 410, protein: 20, carbs: 42, fats: 17 }, 4.5, "poha", "Higher-protein poha for busy mornings."],
  ["Peanut Poha", "breakfast", ["balanced", "vegetarian"], ["poha", "peanuts", "onion", "mustard seeds", "curry leaves", "lemon"], 17, { calories: 370, protein: 10, carbs: 45, fats: 16 }, 3.7, "poha", "Crunchy and pantry-friendly."],
  ["Vegetable Poha", "breakfast", ["balanced", "vegetarian"], ["poha", "mixed vegetables", "onion", "mustard seeds", "curry leaves", "lemon"], 18, { calories: 335, protein: 9, carbs: 51, fats: 10 }, 3.6, "poha", "Uses common Indian market vegetables."],
  ["Lemon Coconut Poha", "breakfast", ["balanced", "vegetarian"], ["poha", "coconut", "peanuts", "curry leaves", "mustard seeds", "lemon"], 15, { calories: 350, protein: 8, carbs: 44, fats: 15 }, 3.5, "poha", "Bright flavor and familiar pantry ingredients."],
  ["Rava Upma", "breakfast", ["balanced", "vegetarian"], ["semolina", "onion", "green chili", "curry leaves", "mustard seeds", "lemon"], 20, { calories: 330, protein: 8, carbs: 47, fats: 12 }, 3.2, "upma", "South Indian staple breakfast option."],
  ["Vegetable Upma", "breakfast", ["balanced", "vegetarian"], ["semolina", "mixed vegetables", "onion", "curry leaves", "mustard seeds", "lemon"], 22, { calories: 345, protein: 9, carbs: 49, fats: 12 }, 3.5, "upma", "Easily available vegetable mix across India."],
  ["Oats Upma", "breakfast", ["balanced", "vegetarian", "high-protein"], ["oats", "onion", "carrots", "beans", "curry leaves", "mustard seeds"], 18, { calories: 310, protein: 11, carbs: 41, fats: 11 }, 3.1, "upma", "A lighter, fiber-forward breakfast."],
  ["Masala Oats Bowl", "breakfast", ["balanced", "vegetarian", "high-protein"], ["oats", "onion", "tomato", "green chili", "coriander", "lemon"], 16, { calories: 320, protein: 12, carbs: 43, fats: 10 }, 3.0, "upma", "Savory masala oats for fast weekday mornings."],
  ["Millet Upma", "breakfast", ["balanced", "vegetarian"], ["millet", "onion", "mixed vegetables", "curry leaves", "mustard seeds", "lemon"], 24, { calories: 355, protein: 10, carbs: 50, fats: 11 }, 3.8, "upma", "Useful for whole-grain focused plans."],
  ["Vermicelli Upma", "breakfast", ["balanced", "vegetarian"], ["vermicelli", "onion", "green peas", "carrots", "curry leaves", "mustard seeds"], 18, { calories: 340, protein: 8, carbs: 52, fats: 10 }, 3.2, "upma", "Quick breakfast with familiar texture."],
  ["Aval Upma", "breakfast", ["balanced", "vegetarian"], ["poha", "coconut", "green chili", "curry leaves", "mustard seeds", "peanuts"], 16, { calories: 335, protein: 8, carbs: 46, fats: 13 }, 3.3, "upma", "Kerala-style pressed-rice breakfast."],
  ["Idli Sambar Plate", "breakfast", ["balanced", "vegetarian"], ["idli batter", "toor dal", "sambar powder", "onion", "tomato", "curry leaves"], 28, { calories: 360, protein: 13, carbs: 56, fats: 8 }, 3.8, "idli", "Reliable breakfast for all ages."],
  ["Ragi Idli Sambar", "breakfast", ["balanced", "vegetarian"], ["idli batter", "ragi flour", "toor dal", "sambar powder", "onion", "tomato"], 30, { calories: 350, protein: 14, carbs: 53, fats: 8 }, 3.9, "idli", "Whole-grain version with good satiety."],
  ["Oats Idli", "breakfast", ["balanced", "vegetarian"], ["oats", "curd", "carrots", "mustard seeds", "curry leaves"], 22, { calories: 300, protein: 11, carbs: 39, fats: 10 }, 3.1, "idli", "Soft and quick for lighter mornings."],
  ["Plain Dosa Sambar", "breakfast", ["balanced", "vegetarian"], ["dosa batter", "toor dal", "sambar powder", "onion", "tomato"], 25, { calories: 390, protein: 11, carbs: 59, fats: 11 }, 3.9, "dosa", "Classic dosa-and-sambar breakfast."],
  ["Onion Uttapam", "breakfast", ["balanced", "vegetarian"], ["dosa batter", "onion", "tomato", "green chili", "coriander"], 20, { calories: 370, protein: 10, carbs: 54, fats: 11 }, 3.7, "dosa", "Soft, topping-rich breakfast option."],
  ["Paneer Dosa Roll", "breakfast", ["balanced", "vegetarian", "high-protein"], ["dosa batter", "paneer", "onion", "coriander", "green chili"], 22, { calories: 430, protein: 21, carbs: 46, fats: 18 }, 4.4, "dosa", "Crisp dosa wrapped around a paneer filling."],
  ["Set Dosa with Vegetable Kurma", "breakfast", ["balanced", "vegetarian"], ["dosa batter", "mixed vegetables", "coconut milk", "onion", "garam masala"], 27, { calories: 420, protein: 11, carbs: 58, fats: 15 }, 4.2, "dosa", "Soft dosa format that works well for weekends."],
  ["Pesarattu", "breakfast", ["balanced", "vegan", "high-protein"], ["moong dal", "ginger", "green chili", "cumin", "onion"], 24, { calories: 330, protein: 16, carbs: 41, fats: 10 }, 3.2, "dosa", "Protein-forward Andhra-style crepe."],
  ["Moong Dal Chilla", "breakfast", ["balanced", "vegan", "high-protein"], ["moong dal", "onion", "green chili", "coriander"], 20, { calories: 300, protein: 15, carbs: 34, fats: 10 }, 3.0, "chilla", "Everyday savory chilla with strong protein."],
  ["Sprouts Chilla", "breakfast", ["balanced", "vegan", "high-protein"], ["moong dal", "sprouts", "onion", "coriander"], 22, { calories: 320, protein: 18, carbs: 33, fats: 10 }, 3.2, "chilla", "Higher-protein chilla with extra texture from sprouts."],
  ["Besan Chilla", "breakfast", ["balanced", "vegetarian", "high-protein"], ["besan", "onion", "tomato", "green chili", "coriander"], 15, { calories: 290, protein: 13, carbs: 28, fats: 11 }, 2.8, "chilla", "Fast pantry breakfast with Indian flavors."],
  ["Paneer Stuffed Chilla", "breakfast", ["balanced", "vegetarian", "high-protein"], ["besan", "paneer", "onion", "tomato", "coriander"], 20, { calories: 390, protein: 24, carbs: 29, fats: 18 }, 4.1, "chilla", "Protein dense breakfast for fuller mornings."],
  ["Aloo Paratha", "breakfast", ["balanced", "vegetarian"], ["atta", "potatoes", "coriander", "curd"], 28, { calories: 430, protein: 10, carbs: 61, fats: 16 }, 3.5, "paratha", "North Indian breakfast staple."],
  ["Paneer Paratha", "breakfast", ["balanced", "vegetarian", "high-protein"], ["atta", "paneer", "onion", "coriander", "curd"], 30, { calories: 450, protein: 22, carbs: 44, fats: 20 }, 4.5, "paratha", "Higher-protein stuffed flatbread option."],
  ["Methi Thepla", "breakfast", ["balanced", "vegetarian"], ["atta", "methi leaves", "curd", "cumin"], 24, { calories: 340, protein: 9, carbs: 47, fats: 12 }, 3.0, "paratha", "Travel-friendly Gujarati breakfast."],
  ["Egg Bhurji Pav", "breakfast", ["balanced", "high-protein"], ["eggs", "onion", "tomato", "green chili", "pav"], 18, { calories: 410, protein: 20, carbs: 31, fats: 22 }, 3.9, "curry", "Street-style egg breakfast adapted for home."],
  ["Ven Pongal", "breakfast", ["balanced", "vegetarian"], ["rice", "moong dal split", "ghee", "cumin", "ginger"], 26, { calories: 380, protein: 12, carbs: 52, fats: 13 }, 3.4, "pongal", "Comforting and soft breakfast bowl."],
  ["Appam with Vegetable Stew", "breakfast", ["balanced", "vegetarian"], ["appam batter", "mixed vegetables", "coconut milk", "curry leaves"], 28, { calories: 400, protein: 8, carbs: 55, fats: 16 }, 4.0, "appam", "Kerala-style breakfast with gentle spice."],
  ["Sabudana Khichdi", "breakfast", ["balanced", "vegetarian"], ["sweet potato", "peanuts", "green chili", "coriander", "lemon"], 22, { calories: 360, protein: 8, carbs: 50, fats: 13 }, 3.4, "khichdi", "Popular fasting breakfast that still fits the planner."],
  ["Akki Roti with Yogurt", "breakfast", ["balanced", "vegetarian"], ["rice", "onion", "coriander", "green chili", "yogurt"], 25, { calories: 350, protein: 9, carbs: 48, fats: 12 }, 3.4, "paratha", "Karnataka-style breakfast with easy ingredients."],
];

const lunchCatalog: RecipeSeedTuple[] = [
  ["Rajma Chawal", "lunch", ["balanced", "vegetarian"], ["rajma", "basmati rice", "onion", "tomato", "ginger", "garlic"], 35, { calories: 560, protein: 19, carbs: 87, fats: 12 }, 4.3, "curry", "North Indian lunch classic with pantry ingredients."],
  ["Chole Chawal", "lunch", ["balanced", "vegan"], ["chole", "basmati rice", "onion", "tomato", "garam masala", "ginger"], 34, { calories: 570, protein: 18, carbs: 86, fats: 13 }, 4.2, "curry", "Hearty chickpea lunch bowl."],
  ["Dal Tadka Rice Bowl", "lunch", ["balanced", "vegetarian"], ["toor dal", "rice", "onion", "tomato", "cumin", "ghee"], 28, { calories: 500, protein: 17, carbs: 74, fats: 14 }, 3.8, "curry", "Comfort lunch with broad Indian availability."],
  ["Sambar Rice Lunch Bowl", "lunch", ["balanced", "vegetarian"], ["rice", "toor dal", "sambar powder", "mixed vegetables", "curry leaves"], 30, { calories: 490, protein: 16, carbs: 77, fats: 11 }, 3.9, "rice", "South Indian one-bowl lunch."],
  ["Curd Rice with Tempered Peanuts", "lunch", ["balanced", "vegetarian"], ["rice", "curd", "peanuts", "curry leaves", "mustard seeds"], 15, { calories: 430, protein: 12, carbs: 54, fats: 17 }, 3.2, "rice", "Cooling lunch that travels well."],
  ["Lemon Rice and Sundal", "lunch", ["balanced", "vegan"], ["rice", "lemon", "mustard seeds", "curry leaves", "chana"], 22, { calories: 470, protein: 15, carbs: 72, fats: 13 }, 3.5, "rice", "Tangy rice with a protein side."],
  ["Vegetable Pulao with Raita", "lunch", ["balanced", "vegetarian"], ["basmati rice", "mixed vegetables", "garam masala", "yogurt", "mint"], 28, { calories: 520, protein: 12, carbs: 76, fats: 16 }, 4.0, "rice", "Simple market-vegetable pulao meal."],
  ["Jeera Rice with Dal Fry", "lunch", ["balanced", "vegetarian"], ["basmati rice", "toor dal", "cumin", "onion", "tomato", "ghee"], 28, { calories: 530, protein: 17, carbs: 79, fats: 15 }, 4.0, "rice", "Reliable home-style lunch combination."],
  ["Palak Paneer with Phulka", "lunch", ["balanced", "vegetarian", "high-protein"], ["paneer", "spinach", "onion", "tomato", "garlic", "phulka"], 30, { calories: 540, protein: 28, carbs: 34, fats: 28 }, 4.8, "curry", "Protein-rich North Indian lunch."],
  ["Kadai Paneer with Roti", "lunch", ["balanced", "vegetarian", "high-protein"], ["paneer", "capsicum", "onion", "tomato", "garam masala", "roti"], 32, { calories: 560, protein: 27, carbs: 38, fats: 29 }, 4.9, "curry", "Restaurant-style flavors using common ingredients."],
  ["Aloo Gobi with Chapati", "lunch", ["balanced", "vegan"], ["potatoes", "cauliflower", "onion", "tomato", "chapati"], 26, { calories: 470, protein: 11, carbs: 63, fats: 18 }, 3.6, "curry", "Everyday dry sabzi lunch."],
  ["Bhindi Masala with Roti", "lunch", ["balanced", "vegan"], ["okra", "onion", "tomato", "garam masala", "roti"], 24, { calories: 455, protein: 10, carbs: 58, fats: 17 }, 3.8, "curry", "Straightforward home-style lunch plate."],
  ["Mixed Veg Curry with Chapati", "lunch", ["balanced", "vegetarian"], ["mixed vegetables", "onion", "tomato", "garam masala", "chapati"], 25, { calories: 460, protein: 10, carbs: 60, fats: 16 }, 3.7, "curry", "Flexible lunch for seasonal vegetables."],
  ["Dal Makhani with Jeera Rice", "lunch", ["balanced", "vegetarian", "high-protein"], ["black lentils", "basmati rice", "onion", "tomato", "ghee"], 40, { calories: 590, protein: 21, carbs: 77, fats: 21 }, 4.5, "curry", "Richer lentil lunch for high-satiety days."],
  ["Kadhi Chawal", "lunch", ["balanced", "vegetarian"], ["curd", "besan", "rice", "mustard seeds", "curry leaves"], 30, { calories: 500, protein: 15, carbs: 70, fats: 15 }, 3.6, "curry", "Punjabi comfort lunch with pantry staples."],
  ["Vegetable Khichdi Lunch Bowl", "lunch", ["balanced", "vegetarian"], ["rice", "moong dal split", "mixed vegetables", "ghee", "cumin"], 25, { calories: 465, protein: 15, carbs: 67, fats: 14 }, 3.4, "khichdi", "Easy digestion and efficient meal prep."],
  ["Paneer Bhurji Rice Bowl", "lunch", ["balanced", "vegetarian", "high-protein"], ["paneer", "rice", "onion", "tomato", "green chili"], 22, { calories: 540, protein: 26, carbs: 46, fats: 25 }, 4.6, "curry", "Fast protein-forward lunch bowl."],
  ["Chicken Curry Rice Bowl", "lunch", ["balanced", "high-protein"], ["chicken", "rice", "onion", "tomato", "garam masala", "ginger"], 32, { calories: 590, protein: 35, carbs: 55, fats: 24 }, 5.3, "curry", "Classic Indian chicken-and-rice lunch."],
  ["Egg Curry Rice Bowl", "lunch", ["balanced", "high-protein"], ["eggs", "rice", "onion", "tomato", "garam masala"], 24, { calories: 520, protein: 22, carbs: 58, fats: 20 }, 4.1, "curry", "Affordable high-protein lunch."],
  ["Fish Curry Rice Bowl", "lunch", ["balanced", "high-protein", "pescatarian"], ["fish", "rice", "onion", "tomato", "coconut milk", "curry leaves"], 30, { calories: 560, protein: 33, carbs: 49, fats: 24 }, 5.8, "curry", "Coastal-style lunch with pantry-friendly flavors."],
  ["Paneer Tikka Wrap", "lunch", ["balanced", "vegetarian", "high-protein"], ["paneer", "whole wheat wrap", "onion", "capsicum", "yogurt", "mint"], 20, { calories: 500, protein: 24, carbs: 38, fats: 26 }, 4.7, "wrap", "Portable Indian lunch option."],
  ["Paneer Pulao", "lunch", ["balanced", "vegetarian", "high-protein"], ["basmati rice", "paneer", "mixed vegetables", "garam masala", "mint"], 26, { calories: 540, protein: 21, carbs: 64, fats: 21 }, 4.6, "rice", "Paneer-led pulao for a more filling vegetarian lunch."],
  ["Chicken Tikka Wrap", "lunch", ["balanced", "high-protein"], ["chicken", "whole wheat wrap", "onion", "capsicum", "yogurt", "mint"], 22, { calories: 520, protein: 31, carbs: 37, fats: 24 }, 5.1, "wrap", "Meal-prep friendly high-protein wrap."],
  ["Egg Fried Rice Indian Style", "lunch", ["balanced", "high-protein"], ["rice", "eggs", "onion", "capsicum", "carrots", "beans"], 20, { calories: 530, protein: 20, carbs: 62, fats: 21 }, 4.0, "rice", "Quick egg fried rice with Indian pantry vegetables."],
  ["Tawa Pulao", "lunch", ["balanced", "vegetarian"], ["rice", "mixed vegetables", "onion", "tomato", "capsicum", "garam masala"], 22, { calories: 490, protein: 11, carbs: 74, fats: 15 }, 3.9, "rice", "Mumbai-style rice lunch using leftovers well."],
  ["Methi Chana Bowl", "lunch", ["balanced", "vegan", "high-protein"], ["chana", "methi leaves", "onion", "tomato", "rice"], 26, { calories: 510, protein: 18, carbs: 69, fats: 16 }, 4.0, "curry", "Budget-friendly protein bowl."],
  ["Sprouts Pulao", "lunch", ["balanced", "vegan", "high-protein"], ["rice", "sprouts", "onion", "carrots", "beans", "garam masala"], 24, { calories: 480, protein: 17, carbs: 70, fats: 13 }, 3.8, "rice", "High-fiber Indian lunch with fast prep."],
  ["Avial with Red Rice", "lunch", ["balanced", "vegetarian"], ["mixed vegetables", "coconut", "curd", "red rice", "curry leaves"], 30, { calories: 500, protein: 12, carbs: 67, fats: 18 }, 4.2, "curry", "Kerala-inspired vegetable lunch."],
  ["Cabbage Poriyal Rice Plate", "lunch", ["balanced", "vegan"], ["cabbage", "coconut", "mustard seeds", "curry leaves", "rice"], 20, { calories: 430, protein: 9, carbs: 62, fats: 15 }, 3.3, "curry", "Simple South Indian lunch plate."],
  ["Lauki Chana Dal Bowl", "lunch", ["balanced", "vegan"], ["bottle gourd", "chana", "onion", "tomato", "roti"], 28, { calories: 460, protein: 16, carbs: 58, fats: 13 }, 3.7, "curry", "Light lunch with broad ingredient availability."],
  ["Masoor Dal and Roti", "lunch", ["balanced", "vegan", "high-protein"], ["masoor dal", "onion", "tomato", "garlic", "roti"], 25, { calories: 450, protein: 18, carbs: 56, fats: 12 }, 3.4, "curry", "Fast lentil lunch with strong nutrition."],
  ["Tofu Curry Rice Bowl", "lunch", ["balanced", "vegan", "high-protein"], ["tofu", "rice", "onion", "tomato", "garam masala", "spinach"], 25, { calories: 500, protein: 22, carbs: 55, fats: 18 }, 4.2, "curry", "Plant-protein lunch bowl that still feels familiar."],
  ["Paneer Fried Millet Bowl", "lunch", ["balanced", "vegetarian", "high-protein"], ["paneer", "millet", "capsicum", "onion", "coriander"], 24, { calories: 520, protein: 24, carbs: 45, fats: 24 }, 4.6, "rice", "Indian-spiced millet bowl for weekday lunches."],
];
const dinnerCatalog: RecipeSeedTuple[] = [
  ["Butter Chicken Rice Plate", "dinner", ["balanced", "high-protein"], ["chicken", "rice", "onion", "tomato", "garam masala", "ghee"], 35, { calories: 640, protein: 36, carbs: 54, fats: 29 }, 5.8, "curry", "Comfort-focused dinner with Indian pantry flavors."],
  ["Palak Chicken with Rice", "dinner", ["balanced", "high-protein"], ["chicken", "spinach", "onion", "garlic", "rice"], 32, { calories: 600, protein: 37, carbs: 48, fats: 25 }, 5.4, "curry", "Greens-forward chicken dinner."],
  ["Tandoori Chicken Millet Bowl", "dinner", ["balanced", "high-protein"], ["chicken", "millet", "yogurt", "onion", "mint"], 30, { calories: 590, protein: 38, carbs: 43, fats: 24 }, 5.2, "curry", "High-protein dinner with better whole-grain balance."],
  ["Chicken Stew with Appam", "dinner", ["balanced", "high-protein"], ["chicken", "appam batter", "coconut milk", "onion", "ginger"], 34, { calories: 620, protein: 34, carbs: 50, fats: 29 }, 5.7, "appam", "Kerala-style dinner with soft appam."],
  ["Kerala Fish Curry Rice Plate", "dinner", ["balanced", "high-protein", "pescatarian"], ["fish", "rice", "coconut milk", "onion", "tomato", "curry leaves"], 30, { calories: 610, protein: 34, carbs: 49, fats: 27 }, 5.9, "curry", "Coastal curry that fits weeknight dinner."],
  ["Egg Bhurji Roti Plate", "dinner", ["balanced", "high-protein"], ["eggs", "onion", "tomato", "green chili", "roti"], 18, { calories: 480, protein: 23, carbs: 34, fats: 24 }, 3.9, "curry", "Fast and affordable Indian dinner."],
  ["Anda Ghotala Pav", "dinner", ["balanced", "high-protein"], ["eggs", "paneer", "onion", "tomato", "pav"], 22, { calories: 560, protein: 28, carbs: 35, fats: 31 }, 4.6, "curry", "Street-style dinner with strong protein."],
  ["Paneer Butter Masala with Naan Bowl", "dinner", ["balanced", "vegetarian", "high-protein"], ["paneer", "onion", "tomato", "garam masala", "paratha"], 34, { calories: 650, protein: 28, carbs: 47, fats: 38 }, 5.2, "curry", "Restaurant-inspired dinner at home."],
  ["Shahi Paneer with Roti", "dinner", ["balanced", "vegetarian", "high-protein"], ["paneer", "onion", "tomato", "curd", "roti"], 32, { calories: 610, protein: 27, carbs: 39, fats: 35 }, 5.0, "curry", "Rich paneer dinner for slower evenings."],
  ["Matar Paneer with Phulka", "dinner", ["balanced", "vegetarian", "high-protein"], ["paneer", "green peas", "onion", "tomato", "phulka"], 28, { calories: 560, protein: 25, carbs: 38, fats: 29 }, 4.8, "curry", "Familiar dinner with broad ingredient availability."],
  ["Paneer Jalfrezi", "dinner", ["balanced", "vegetarian", "high-protein"], ["paneer", "capsicum", "onion", "tomato", "roti"], 26, { calories: 550, protein: 24, carbs: 36, fats: 30 }, 4.8, "curry", "Bright capsicum-led paneer dinner."],
  ["Malai Kofta with Jeera Rice", "dinner", ["balanced", "vegetarian"], ["paneer", "potatoes", "onion", "tomato", "basmati rice"], 38, { calories: 640, protein: 20, carbs: 65, fats: 33 }, 5.1, "curry", "Special-feeling dinner for weekends."],
  ["Chana Masala Phulka Plate", "dinner", ["balanced", "vegan", "high-protein"], ["chole", "onion", "tomato", "garam masala", "phulka"], 28, { calories: 520, protein: 18, carbs: 67, fats: 16 }, 4.0, "curry", "Affordable dinner with strong satiety."],
  ["Rajma Masala with Phulka", "dinner", ["balanced", "vegan", "high-protein"], ["rajma", "onion", "tomato", "garlic", "phulka"], 30, { calories: 510, protein: 18, carbs: 65, fats: 15 }, 4.0, "curry", "Rajma-focused dinner for a strong pantry rotation."],
  ["Dum Aloo with Roti", "dinner", ["balanced", "vegetarian"], ["potatoes", "onion", "tomato", "curd", "roti"], 32, { calories: 530, protein: 11, carbs: 59, fats: 24 }, 3.9, "curry", "Hearty potato dinner with roti."],
  ["Baingan Bharta with Chapati", "dinner", ["balanced", "vegan"], ["brinjal", "onion", "tomato", "garlic", "chapati"], 30, { calories: 440, protein: 10, carbs: 54, fats: 16 }, 3.6, "curry", "Smoky vegetable dinner with low cost."],
  ["Mushroom Masala Rice Plate", "dinner", ["balanced", "vegetarian"], ["mushroom", "rice", "onion", "tomato", "garam masala"], 24, { calories: 500, protein: 13, carbs: 62, fats: 18 }, 4.4, "curry", "Quick mushroom-led dinner."],
  ["Kadai Mushroom with Roti", "dinner", ["balanced", "vegetarian"], ["mushroom", "onion", "tomato", "capsicum", "roti"], 24, { calories: 490, protein: 14, carbs: 49, fats: 21 }, 4.3, "curry", "Peppery mushroom dinner with roti."],
  ["Veg Korma with Paratha", "dinner", ["balanced", "vegetarian"], ["mixed vegetables", "coconut milk", "onion", "garam masala", "paratha"], 30, { calories: 590, protein: 12, carbs: 52, fats: 32 }, 4.6, "curry", "Creamier mixed-veg dinner option."],
  ["Dal Palak Rice Bowl", "dinner", ["balanced", "vegetarian", "high-protein"], ["toor dal", "spinach", "onion", "tomato", "rice"], 27, { calories: 500, protein: 18, carbs: 70, fats: 13 }, 3.8, "curry", "Greens and lentils in one bowl."],
  ["Moong Khichdi Dinner Bowl", "dinner", ["balanced", "vegetarian"], ["rice", "moong dal split", "ghee", "cumin", "ginger"], 24, { calories: 460, protein: 15, carbs: 63, fats: 14 }, 3.2, "khichdi", "Light dinner for easier digestion."],
  ["Bajra Khichdi with Kadhi", "dinner", ["balanced", "vegetarian"], ["bajra", "curd", "besan", "cumin", "ghee"], 32, { calories: 510, protein: 16, carbs: 62, fats: 18 }, 3.9, "khichdi", "Whole-grain dinner with classic pairing."],
  ["Quinoa Khichdi", "dinner", ["balanced", "vegan", "high-protein"], ["quinoa", "moong dal split", "mixed vegetables", "cumin", "ginger"], 25, { calories: 470, protein: 18, carbs: 58, fats: 13 }, 4.3, "khichdi", "Modern grain option still rooted in Indian flavors."],
  ["Ragi Mudde with Sambar", "dinner", ["balanced", "vegan"], ["ragi flour", "toor dal", "sambar powder", "onion", "tomato"], 30, { calories: 500, protein: 15, carbs: 73, fats: 10 }, 3.8, "pongal", "Karnataka-style dinner with excellent satiety."],
  ["Neer Dosa with Veg Kurma", "dinner", ["balanced", "vegetarian"], ["neer dosa batter", "mixed vegetables", "coconut milk", "onion"], 28, { calories: 520, protein: 10, carbs: 63, fats: 22 }, 4.4, "dosa", "Soft dosa dinner with mild curry."],
  ["Adai with Avial", "dinner", ["balanced", "vegetarian", "high-protein"], ["moong dal", "rice", "mixed vegetables", "coconut", "curd"], 30, { calories: 530, protein: 20, carbs: 58, fats: 20 }, 4.2, "dosa", "Protein-rich South Indian dinner."],
  ["Podi Idli Dinner Plate", "dinner", ["balanced", "vegetarian"], ["idli batter", "ghee", "curry leaves", "mustard seeds"], 18, { calories: 430, protein: 11, carbs: 58, fats: 15 }, 3.4, "idli", "Quick dinner using steamed idlis."],
  ["Paneer Tikka Salad Bowl", "dinner", ["balanced", "vegetarian", "high-protein"], ["paneer", "capsicum", "onion", "mint", "cucumber"], 22, { calories: 470, protein: 27, carbs: 18, fats: 30 }, 4.8, "wrap", "Lighter dinner with strong protein."],
  ["Tofu Bhurji Millet Bowl", "dinner", ["balanced", "vegan", "high-protein"], ["tofu", "millet", "onion", "tomato", "green chili"], 24, { calories: 480, protein: 22, carbs: 44, fats: 21 }, 4.2, "curry", "Plant-forward dinner with Indian masala."],
  ["Tofu Korma Millet Bowl", "dinner", ["balanced", "vegan", "high-protein"], ["tofu", "millet", "coconut milk", "onion", "mixed vegetables"], 28, { calories: 520, protein: 21, carbs: 47, fats: 25 }, 4.5, "curry", "Milder tofu dinner with better prep-ahead value."],
  ["Saag Tofu Rice Plate", "dinner", ["balanced", "vegan", "high-protein"], ["tofu", "spinach", "onion", "garlic", "rice"], 28, { calories: 500, protein: 23, carbs: 49, fats: 21 }, 4.3, "curry", "A vegan riff on a familiar saag plate."],
  ["Methi Malai Paneer", "dinner", ["balanced", "vegetarian", "high-protein"], ["paneer", "methi leaves", "onion", "curd", "roti"], 30, { calories: 590, protein: 26, carbs: 35, fats: 35 }, 5.0, "curry", "North Indian-style paneer dinner with richness."],
  ["Vegetable Hakka Noodles Indian Style", "dinner", ["balanced", "vegetarian"], ["chickpea flour noodles", "cabbage", "carrots", "capsicum", "onion"], 20, { calories: 480, protein: 13, carbs: 63, fats: 17 }, 4.0, "rice", "India-available dinner option for variety."],
];

const snackCatalog: RecipeSeedTuple[] = [
  ["Bhel Puri Bowl", "snack", ["balanced", "vegan"], ["puffed rice", "onion", "tomato", "coriander", "lemon"], 10, { calories: 220, protein: 5, carbs: 38, fats: 5 }, 2.2, "snack", "Street-style snack with lighter planning math."],
  ["Roasted Makhana Masala", "snack", ["balanced", "vegetarian"], ["makhana", "ghee", "turmeric"], 8, { calories: 180, protein: 5, carbs: 20, fats: 8 }, 2.4, "snack", "Crunchy pantry snack for evenings."],
  ["Chana Chaat", "snack", ["balanced", "vegan", "high-protein"], ["chana", "onion", "tomato", "coriander", "lemon"], 12, { calories: 240, protein: 11, carbs: 34, fats: 6 }, 2.5, "snack", "High-fiber and protein-forward snack."],
  ["Dhokla Bites", "snack", ["balanced", "vegetarian"], ["dhokla batter", "mustard seeds", "curry leaves"], 18, { calories: 210, protein: 9, carbs: 30, fats: 6 }, 2.3, "snack", "Gujarati steamed snack with good portability."],
  ["Sweet Corn Chaat", "snack", ["balanced", "vegetarian"], ["corn", "onion", "coriander", "lemon"], 12, { calories: 210, protein: 7, carbs: 33, fats: 5 }, 2.2, "snack", "Fast snack with reliable ingredient access."],
  ["Corn Sundal", "snack", ["balanced", "vegan"], ["corn", "coconut", "curry leaves", "mustard seeds"], 12, { calories: 200, protein: 6, carbs: 28, fats: 7 }, 2.2, "snack", "South Indian-style corn snack with light prep."],
  ["Fruit Chaat", "snack", ["balanced", "vegan"], ["banana", "mango", "lemon"], 8, { calories: 190, protein: 2, carbs: 45, fats: 1 }, 2.4, "snack", "Fresh fruit snack with Indian seasoning potential."],
  ["Masala Buttermilk", "snack", ["balanced", "vegetarian"], ["buttermilk", "coriander", "cumin"], 5, { calories: 90, protein: 4, carbs: 8, fats: 4 }, 1.5, "drink", "Cooling drink snack for hot days."],
  ["Mango Lassi", "snack", ["balanced", "vegetarian"], ["mango", "yogurt", "milk"], 8, { calories: 230, protein: 8, carbs: 36, fats: 6 }, 2.8, "drink", "Classic sweet Indian snack drink."],
  ["Salted Lassi", "snack", ["balanced", "vegetarian"], ["yogurt drink", "cumin", "coriander"], 5, { calories: 120, protein: 6, carbs: 11, fats: 5 }, 1.8, "drink", "Simple savory dairy snack."],
  ["Paneer Tikka Cubes", "snack", ["balanced", "vegetarian", "high-protein"], ["paneer", "yogurt", "capsicum", "onion", "mint"], 16, { calories: 250, protein: 17, carbs: 9, fats: 16 }, 3.2, "snack", "Protein-forward snack or add-on."],
  ["Paneer Chaat Bowl", "snack", ["balanced", "vegetarian", "high-protein"], ["paneer", "onion", "tomato", "coriander", "lemon"], 10, { calories: 230, protein: 15, carbs: 10, fats: 14 }, 2.9, "snack", "Quick paneer chaat for an easy high-protein snack."],
  ["Moong Sprouts Chaat", "snack", ["balanced", "vegan", "high-protein"], ["sprouts", "onion", "tomato", "coriander", "lemon"], 10, { calories: 210, protein: 13, carbs: 27, fats: 5 }, 2.4, "snack", "High-protein fresh snack for active days."],
  ["Banana Lassi", "snack", ["balanced", "vegetarian"], ["banana", "yogurt", "milk"], 6, { calories: 220, protein: 8, carbs: 34, fats: 6 }, 2.4, "drink", "Simple blended snack drink with steady energy."],
  ["Jhalmuri", "snack", ["balanced", "vegan"], ["puffed rice", "onion", "tomato", "mustard seeds", "lemon"], 10, { calories: 200, protein: 4, carbs: 35, fats: 4 }, 2.0, "snack", "Crisp Kolkata-style snack."],
  ["Sabudana Vada Plate", "snack", ["balanced", "vegetarian"], ["sweet potato", "peanuts", "green chili", "curd"], 22, { calories: 280, protein: 7, carbs: 32, fats: 14 }, 2.8, "snack", "Weekend tea-time snack option."],
  ["Vegetable Cutlet", "snack", ["balanced", "vegetarian"], ["potatoes", "carrots", "beans", "green peas", "coriander"], 20, { calories: 230, protein: 6, carbs: 32, fats: 8 }, 2.3, "snack", "Tea-time snack with common produce."],
  ["Roasted Chana Banana Bowl", "snack", ["balanced", "vegan", "high-protein"], ["roasted chana", "banana"], 5, { calories: 220, protein: 8, carbs: 35, fats: 5 }, 2.0, "snack", "Efficient combo for quick hunger control."],
  ["Samosa Chaat Lite", "snack", ["balanced", "vegetarian"], ["potatoes", "curd", "chana", "onion", "coriander"], 18, { calories: 290, protein: 10, carbs: 35, fats: 12 }, 2.9, "snack", "Planner-friendly take on a classic."],
  ["South Indian Sundal", "snack", ["balanced", "vegan", "high-protein"], ["chana", "coconut", "curry leaves", "mustard seeds"], 14, { calories: 210, protein: 10, carbs: 25, fats: 8 }, 2.3, "snack", "Simple protein snack with pantry staples."],
  ["Peanut Curd Snack Bowl", "snack", ["balanced", "vegetarian", "high-protein"], ["curd", "peanuts", "coriander", "cumin"], 6, { calories: 210, protein: 10, carbs: 9, fats: 14 }, 2.2, "snack", "Quick chilled snack with better satiety."],
];

export const seedRecipes: RecipeDocumentShape[] = [
  ...breakfastCatalog,
  ...lunchCatalog,
  ...dinnerCatalog,
  ...snackCatalog,
].map(createRecipe);
