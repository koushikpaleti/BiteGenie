"use client";

import { useState, useTransition } from "react";
import useSWR from "swr";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch, swrFetcher } from "@/lib/api-client";
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/utils";
import type { AuthUser } from "@/types";

function FieldBlock({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {hint ? <p className="text-xs leading-5 text-slate-500">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

const defaults = {
  name: "",
  preferences: {
    diet: "balanced",
    dailyCalories: 2100,
    proteinTarget: 140,
    carbsTarget: 220,
    fatTarget: 70,
    goal: "maintain",
    weeklyBudget: 110,
    householdSize: 1,
    preferredMealTypes: ["breakfast", "lunch", "dinner", "snack"],
    dislikedIngredients: [] as string[],
    likedIngredients: [] as string[],
    allergies: [] as string[],
  },
};

export function SettingsView() {
  const { data, isLoading, mutate } = useSWR<AuthUser>("/api/profile", swrFetcher);

  if (isLoading || !data) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-[540px] w-full" />
      </div>
    );
  }

  return <SettingsForm user={data} onSaved={mutate} />;
}

function SettingsForm({
  user,
  onSaved,
}: {
  user: AuthUser;
  onSaved: () => Promise<AuthUser | undefined>;
}) {
  const [form, setForm] = useState({
    name: user.name,
    preferences: user.preferences ?? defaults.preferences,
  });
  const [isPending, startTransition] = useTransition();

  function updatePreference(name: string, value: string | number | string[]) {
    setForm((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        [name]: value,
      },
    }));
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await apiFetch("/api/profile", {
          method: "PATCH",
          body: JSON.stringify(form),
        });
        await onSaved();
        toast.success("Preferences updated");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to save settings");
      }
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Preference memory"
        description="These values directly shape meal-plan generation, AI recipe prompting, grocery scaling, and dashboard target tracking."
        action={
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        }
      />

      <Panel className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FieldBlock label="Name">
            <Input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Full name"
            />
          </FieldBlock>
          <FieldBlock label="Email">
            <Input value={user.email} disabled />
          </FieldBlock>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FieldBlock label="Diet preference">
            <Select
              value={form.preferences.diet}
              onChange={(event) => updatePreference("diet", event.target.value)}
            >
              <option value="balanced">Balanced</option>
              <option value="high-protein">High Protein</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="pescatarian">Pescatarian</option>
              <option value="keto">Keto</option>
            </Select>
          </FieldBlock>
          <FieldBlock label="Primary goal">
            <Select
              value={form.preferences.goal}
              onChange={(event) => updatePreference("goal", event.target.value)}
            >
              <option value="maintain">Maintain</option>
              <option value="lose">Lose</option>
              <option value="gain">Gain</option>
              <option value="performance">Performance</option>
            </Select>
          </FieldBlock>
          <FieldBlock
            label="Household size"
            hint="Used for grocery quantity scaling."
          >
            <Input
              type="number"
              value={form.preferences.householdSize}
              onChange={(event) =>
                updatePreference("householdSize", Number(event.target.value))
              }
            />
          </FieldBlock>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <FieldBlock label="Daily calories">
            <Input
              type="number"
              value={form.preferences.dailyCalories}
              onChange={(event) =>
                updatePreference("dailyCalories", Number(event.target.value))
              }
            />
          </FieldBlock>
          <FieldBlock label="Protein target (g)">
            <Input
              type="number"
              value={form.preferences.proteinTarget}
              onChange={(event) =>
                updatePreference("proteinTarget", Number(event.target.value))
              }
            />
          </FieldBlock>
          <FieldBlock label="Carbs target (g)">
            <Input
              type="number"
              value={form.preferences.carbsTarget}
              onChange={(event) =>
                updatePreference("carbsTarget", Number(event.target.value))
              }
            />
          </FieldBlock>
          <FieldBlock label="Fat target (g)">
            <Input
              type="number"
              value={form.preferences.fatTarget}
              onChange={(event) => updatePreference("fatTarget", Number(event.target.value))}
            />
          </FieldBlock>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FieldBlock
            label="Weekly food budget"
            hint="Enter your target in rupees per week."
          >
            <Input
              type="number"
              value={formatCurrencyInput(form.preferences.weeklyBudget)}
              onChange={(event) =>
                updatePreference(
                  "weeklyBudget",
                  parseCurrencyInput(Number(event.target.value)),
                )
              }
            />
          </FieldBlock>
          <FieldBlock
            label="Liked ingredients"
            hint="Comma separated ingredients the planner and AI generator should prefer."
          >
            <Input
              value={form.preferences.likedIngredients.join(", ")}
              onChange={(event) =>
                updatePreference(
                  "likedIngredients",
                  event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                )
              }
              placeholder="Liked ingredients, comma separated"
            />
          </FieldBlock>
          <FieldBlock
            label="Disliked ingredients"
            hint="Comma separated ingredients to avoid where possible."
          >
            <Input
              value={form.preferences.dislikedIngredients.join(", ")}
              onChange={(event) =>
                updatePreference(
                  "dislikedIngredients",
                  event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                )
              }
              placeholder="Disliked ingredients, comma separated"
            />
          </FieldBlock>
          <FieldBlock
            label="Allergies"
            hint="Comma separated ingredients that must be excluded."
          >
            <Input
              value={form.preferences.allergies.join(", ")}
              onChange={(event) =>
                updatePreference(
                  "allergies",
                  event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                )
              }
              placeholder="Allergies, comma separated"
            />
          </FieldBlock>
        </div>
      </Panel>
    </div>
  );
}
