export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type DietaryPreference =
  | "balanced"
  | "high-protein"
  | "vegetarian"
  | "vegan"
  | "pescatarian"
  | "keto";

export type GoalType = "maintain" | "lose" | "gain" | "performance";

export type RecipeSource = "seed" | "ai" | "user";

export interface NutritionValues {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  estimatedCost: number;
}

export interface RecipeDocumentShape {
  _id?: string;
  name: string;
  slug: string;
  mealType: MealType;
  dietaryTags: DietaryPreference[];
  ingredients: RecipeIngredient[];
  steps: string[];
  cookingTime: number;
  nutrition: NutritionValues;
  estimatedCost: number;
  source: RecipeSource;
  notes?: string;
  likedBy?: string[];
  createdBy?: string | null;
}

export interface UserPreferences {
  diet: DietaryPreference;
  dailyCalories: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  goal: GoalType;
  weeklyBudget: number;
  householdSize: number;
  preferredMealTypes: MealType[];
  dislikedIngredients: string[];
  likedIngredients: string[];
  allergies: string[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
}

export interface PlannedMeal {
  _id?: string;
  mealType: MealType;
  recipeId: string;
  servings: number;
  nutrition: NutritionValues;
  estimatedCost: number;
  recipe?: RecipeDocumentShape;
}

export interface PlannedDay {
  _id?: string;
  date: string;
  meals: PlannedMeal[];
  totalNutrition: NutritionValues;
  estimatedCost: number;
}

export interface MealPlanPayload {
  _id: string;
  userId: string;
  startDate: string;
  endDate: string;
  days: PlannedDay[];
  totalNutrition: NutritionValues;
  estimatedCost: number;
  reuseSuggestions: string[];
  insights: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GroceryItem {
  key: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  checked: boolean;
}

export interface GroceryListPayload {
  _id: string;
  userId: string;
  linkedMealPlanId: string;
  items: GroceryItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GeneratedRecipePayload {
  name: string;
  ingredients: string[];
  steps: string[];
  cooking_time: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface DashboardSnapshot {
  user: AuthUser;
  latestMealPlan: MealPlanPayload | null;
  macroTrend: Array<{
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    budget: number;
  }>;
  nutritionCompletion: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  groceryStats: {
    itemCount: number;
    categories: Array<{ category: string; count: number }>;
  };
  savedRecipesCount: number;
  favoriteRecipesCount: number;
  insights: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
