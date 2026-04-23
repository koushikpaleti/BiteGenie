"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Flame, HeartPulse, ShoppingBasket, Sparkles } from "lucide-react";
import useSWR from "swr";

import { MacroChart } from "@/components/charts/macro-chart";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { swrFetcher } from "@/lib/api-client";
import { formatCompactNumber, formatCurrency } from "@/lib/utils";
import type { DashboardSnapshot } from "@/types";

const statConfig = [
  {
    key: "savedRecipesCount",
    label: "Saved recipes",
    icon: Sparkles,
    formatter: (value: number) => formatCompactNumber(value),
  },
  {
    key: "favoriteRecipesCount",
    label: "Favorites",
    icon: HeartPulse,
    formatter: (value: number) => formatCompactNumber(value),
  },
  {
    key: "groceryItems",
    label: "Grocery items",
    icon: ShoppingBasket,
    formatter: (value: number) => formatCompactNumber(value),
  },
  {
    key: "weeklySpend",
    label: "Projected spend",
    icon: Flame,
    formatter: (value: number) => formatCurrency(value),
  },
] as const;

export function DashboardView() {
  const { data, isLoading } = useSWR<DashboardSnapshot>("/api/dashboard", swrFetcher);

  if (isLoading || !data) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-36 w-full" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <Skeleton className="h-[420px] w-full" />
          <Skeleton className="h-[420px] w-full" />
        </div>
      </div>
    );
  }

  const weeklySpend = data.latestMealPlan?.estimatedCost ?? 0;
  const statValues = {
    savedRecipesCount: data.savedRecipesCount,
    favoriteRecipesCount: data.favoriteRecipesCount,
    groceryItems: data.groceryStats.itemCount,
    weeklySpend,
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${data.user.name.split(" ")[0]}`}
        description="Track weekly nutrition, spot budget pressure before it hits, and keep your plan moving with clear, low-friction decision support."
      />

      <div className="grid gap-4 lg:grid-cols-4">
        {statConfig.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Panel className="h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                      {item.formatter(statValues[item.key])}
                    </h3>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </Panel>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <Panel>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Weekly calorie pattern</p>
              <h2 className="mt-2 font-serif text-3xl text-slate-950">Nutrition trend</h2>
            </div>
            <Badge>Live from latest plan</Badge>
          </div>
          <div className="mt-8">
            <MacroChart data={data.macroTrend} />
          </div>
        </Panel>

        <Panel className="space-y-6">
          <div>
            <p className="text-sm text-slate-500">Target completion</p>
            <h2 className="mt-2 font-serif text-3xl text-slate-950">Daily alignment</h2>
          </div>
          {Object.entries(data.nutritionCompletion).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium capitalize text-slate-700">{key}</p>
                <p className="text-sm text-slate-500">{value}%</p>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-[linear-gradient(90deg,#0f172a,#fb923c)]"
                  style={{ width: `${Math.max(8, value)}%` }}
                />
              </div>
            </div>
          ))}

          <div className="rounded-[24px] bg-slate-950 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.24em] text-white/55">Grocery mix</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.groceryStats.categories.map((category) => (
                <Badge
                  key={category.category}
                  className="border-white/10 bg-white/10 text-white/80"
                >
                  {category.category}: {category.count}
                </Badge>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.15fr]">
        <Panel>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Insight feed</p>
              <h2 className="mt-2 font-serif text-3xl text-slate-950">What stands out</h2>
            </div>
            <ArrowUpRight className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-6 space-y-4">
            {data.insights.map((insight) => (
              <div
                key={insight}
                className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-5"
              >
                <p className="text-sm leading-7 text-slate-700">{insight}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <p className="text-sm text-slate-500">This week at a glance</p>
          <h2 className="mt-2 font-serif text-3xl text-slate-950">Plan summary</h2>
          {data.latestMealPlan ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {data.latestMealPlan.days.map((day) => (
                <div
                  key={day.date}
                  className="rounded-[24px] border border-slate-200/70 bg-white/70 p-5"
                >
                  <p className="text-sm font-semibold text-slate-900">{day.date}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    {day.meals.length} meals scheduled
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {day.meals.map((meal) => (
                      <Badge key={meal._id}>{meal.recipe?.name ?? meal.mealType}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 p-6 text-sm leading-7 text-slate-600">
              No meal plan yet. Generate your first week from the planner page and your
              dashboard will populate automatically.
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
