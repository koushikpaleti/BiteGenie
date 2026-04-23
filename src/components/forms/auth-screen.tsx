"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";

export function AuthScreen({
  title,
  description,
  endpoint,
  submitLabel,
  footer,
  fields,
}: {
  title: string;
  description: string;
  endpoint: string;
  submitLabel: string;
  footer: React.ReactNode;
  fields: Array<"name" | "email" | "password">;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  function updateField(field: "name" | "email" | "password", value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        await apiFetch(endpoint, {
          method: "POST",
          body: JSON.stringify(values),
        });
        toast.success(fields.includes("name") ? "Account created" : "Welcome back");
        router.push("/dashboard");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to continue");
      }
    });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.18),transparent_24%)]" />
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(15,23,42,0.84),rgba(249,115,22,0.78))] p-8 text-white shadow-[0_45px_120px_-40px_rgba(15,23,42,0.7)] sm:p-12"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="mt-10 text-sm uppercase tracking-[0.3em] text-white/60">
            BiteGenie
          </p>
          <h1 className="mt-6 max-w-xl font-serif text-5xl leading-tight text-balance sm:text-6xl">
            BiteGenie — Eat smarter.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-white/72">
            Generate realistic meal plans, auto-build grocery lists, and use AI recipes
            that remember how you actually like to eat.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["Weekly plans", "Goals, calories, and budget aligned in one flow."],
              ["AI meal creation", "Ingredient-first recipes with validation and caching."],
              ["Nutrition clarity", "Macro insight and serving updates without spreadsheets."],
            ].map(([label, copy]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/8 p-5">
                <p className="text-sm font-semibold">{label}</p>
                <p className="mt-2 text-sm leading-6 text-white/70">{copy}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="rounded-[36px] border border-white/70 bg-white/80 p-8 shadow-[0_35px_100px_-40px_rgba(15,23,42,0.35)] backdrop-blur-2xl sm:p-10"
        >
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Account</p>
            <h2 className="font-serif text-4xl tracking-tight text-slate-950">{title}</h2>
            <p className="text-sm leading-7 text-slate-600">{description}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {fields.includes("name") && (
              <Input
                placeholder="Full name"
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
            )}
            {fields.includes("email") && (
              <Input
                placeholder="Email address"
                type="email"
                value={values.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
            )}
            {fields.includes("password") && (
              <Input
                placeholder="Password"
                type="password"
                value={values.password}
                onChange={(event) => updateField("password", event.target.value)}
              />
            )}
            <Button type="submit" className="w-full justify-center">
              {isPending ? "Please wait..." : submitLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6">{footer}</div>
        </motion.div>
      </div>
    </div>
  );
}
