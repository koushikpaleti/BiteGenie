import { clsx, type ClassValue } from "clsx";
import { format, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

const INR_EXCHANGE_RATE = 83;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function roundTo(value: number, precision = 1) {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
}

export function normalizeToken(value: string) {
  return value.trim().toLowerCase();
}

export function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

export function titleCase(value: string) {
  return value
    .split(" ")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount * INR_EXCHANGE_RATE);
}

export function formatCurrencyInput(amount: number) {
  return Number.isFinite(amount) ? Math.round(amount * INR_EXCHANGE_RATE) : 0;
}

export function parseCurrencyInput(amount: number) {
  return Number.isFinite(amount) ? roundTo(amount / INR_EXCHANGE_RATE, 2) : 0;
}

export function formatCompactNumber(amount: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatDisplayDate(isoDate: string) {
  return format(parseISO(isoDate), "EEE, MMM d");
}

export function formatIsoDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function normalizeIngredientNames(ingredients: string[]) {
  return unique(
    ingredients
      .map((ingredient) => ingredient.trim().toLowerCase())
      .filter(Boolean),
  ).sort();
}
