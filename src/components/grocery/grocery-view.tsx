"use client";

import { RefreshCcw } from "lucide-react";
import { useTransition } from "react";
import useSWR from "swr";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch, swrFetcher } from "@/lib/api-client";
import { formatGroceryQuantity } from "@/lib/grocery";
import { formatDisplayDate } from "@/lib/utils";
import type { GroceryListPayload, MealPlanPayload } from "@/types";

export function GroceryView() {
  const {
    data,
    isLoading,
    mutate,
  } = useSWR<GroceryListPayload | null>(
    "/api/grocery-list",
    swrFetcher,
  );
  const { data: mealPlan } = useSWR<MealPlanPayload | null>("/api/meal-plan", swrFetcher);
  const [isPending, startTransition] = useTransition();

  async function refreshFromPlanner() {
    try {
      await apiFetch("/api/grocery-list");
      await mutate();
      toast.success("Grocery list synced with your latest planner");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sync grocery list");
    }
  }

  function toggleItem(itemKey: string, checked: boolean) {
    if (!data) {
      return;
    }

    startTransition(async () => {
      try {
        const updated = await apiFetch<GroceryListPayload>("/api/grocery-list", {
          method: "PATCH",
          body: JSON.stringify({
            listId: data._id,
            itemKey,
            checked,
          }),
        });
        await mutate(updated, false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to update grocery item",
        );
      }
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-80 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const grouped = (data?.items ?? []).reduce<Record<string, GroceryListPayload["items"]>>(
    (accumulator, item) => {
      accumulator[item.category] = [...(accumulator[item.category] ?? []), item];
      return accumulator;
    },
    {},
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Grocery"
        title="Auto-built shopping intelligence"
        description="The list below is generated directly from your active meal plan, merges duplicates, and scales ingredient quantities by serving count and household size."
        action={
          <Button type="button" variant="secondary" onClick={refreshFromPlanner}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Sync from planner
          </Button>
        }
      />

      {!data ? (
        <Panel className="text-sm leading-7 text-slate-600">
          Add meals to your weekly planner first. The grocery list is generated directly from
          the active week and will update when you sync it from the planner or this page.
        </Panel>
      ) : (
        <div className="space-y-6">
          {mealPlan && (
            <Panel>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-slate-500">Linked planner week</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    {formatDisplayDate(mealPlan.startDate)} to {formatDisplayDate(mealPlan.endDate)}
                  </h2>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Meals in planner</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    {mealPlan.days.reduce((sum, day) => sum + day.meals.length, 0)}
                  </h2>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Grocery items</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    {data.items.length}
                  </h2>
                </div>
              </div>
            </Panel>
          )}

          <div className="grid gap-5 lg:grid-cols-3">
            {Object.entries(grouped).map(([category, items]) => (
              <Panel key={category} className="h-full">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{category}</p>
                <h2 className="mt-2 font-serif text-3xl text-slate-950">{items.length} items</h2>
                <div className="mt-6 space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.key}
                      className="rounded-[22px] border border-slate-200/70 bg-slate-50/75 p-4"
                    >
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          disabled={isPending}
                          onChange={(event) => toggleItem(item.key, event.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-500"
                        />
                        <div>
                          <p
                            className={`font-medium ${
                              item.checked ? "text-slate-400 line-through" : "text-slate-900"
                            }`}
                          >
                            {item.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatGroceryQuantity(item.quantity, item.unit)}
                          </p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </Panel>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
