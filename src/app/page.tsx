import Link from "next/link";
import { ArrowRight, ChefHat, ShoppingBasket, Sparkles, Target } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-6 sm:px-6 lg:px-10">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-slate-500">BiteGenie</p>
          <p className="mt-2 text-sm text-slate-600">Eat smarter with calm, premium planning.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex h-11 items-center rounded-2xl px-4 text-sm font-semibold text-slate-700 transition hover:bg-white/70"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-11 items-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-[0_18px_50px_-20px_rgba(15,23,42,0.7)]"
          >
            Start free
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto grid min-h-[calc(100svh-88px)] w-full max-w-[1400px] items-center gap-8 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:pb-24">
          <div className="space-y-8">
            <p className="inline-flex rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur-xl">
              AI meal planning, nutrition intelligence, and grocery automation
            </p>
            <div className="space-y-6">
              <h1 className="max-w-4xl font-serif text-6xl leading-none tracking-tight text-slate-950 text-balance sm:text-7xl">
                BiteGenie helps you eat smarter every day.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Generate full meal plans in minutes, control calories and macros with
                real logic, and turn ingredients into realistic recipes your week can
                actually support.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 text-sm font-semibold text-white shadow-[0_22px_55px_-22px_rgba(15,23,42,0.8)]"
              >
                Launch the planner
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/70 bg-white/75 px-6 text-sm font-semibold text-slate-900 backdrop-blur-xl"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[40px] border border-white/70 bg-[linear-gradient(145deg,rgba(15,23,42,0.96),rgba(30,41,59,0.88),rgba(249,115,22,0.8))] p-6 text-white shadow-[0_45px_120px_-40px_rgba(15,23,42,0.8)] sm:p-8">
            <div className="grid gap-4">
              <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.26em] text-white/60">
                      Weekly status
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">87% plan adherence</h2>
                  </div>
                  <Sparkles className="h-5 w-5 text-amber-300" />
                </div>
                <div className="mt-5 h-2 rounded-full bg-white/10">
                  <div className="h-2 w-[87%] rounded-full bg-[linear-gradient(90deg,#fbbf24,#fb923c)]" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Target, title: "Macro aligned", copy: "Targets adapt to your goal and serving changes." },
                  { icon: ChefHat, title: "AI recipes", copy: "Ingredient-first meals with validation, caching, and save flows." },
                  { icon: ShoppingBasket, title: "Grocery automation", copy: "Duplicates merged, categories sorted, prep friction cut." },
                ].map((feature, index) => (
                  <div
                    key={feature.title}
                    className={index === 2 ? "sm:col-span-2" : undefined}
                  >
                    <div className="h-full rounded-[28px] border border-white/10 bg-white/7 p-5">
                      <feature.icon className="h-5 w-5 text-amber-300" />
                      <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/70">{feature.copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-[1400px] gap-5 px-4 pb-24 sm:px-6 lg:grid-cols-3 lg:px-10">
          {[
            {
              label: "Plan your week",
              copy: "Generate daily or weekly plans using calories, diet style, goals, ingredient preferences, and budget constraints.",
            },
            {
              label: "Cook with what you have",
              copy: "Turn pantry ingredients into realistic meals, validate structured JSON output, then save or schedule the result.",
            },
            {
              label: "Shop with confidence",
              copy: "Extract groceries from the full plan, merge duplicates automatically, and keep categories clean and ready to act on.",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[32px] border border-white/70 bg-white/75 p-8 shadow-[0_24px_80px_-34px_rgba(15,23,42,0.3)] backdrop-blur-xl"
            >
              <p className="text-sm uppercase tracking-[0.26em] text-slate-500">Capability</p>
              <h3 className="mt-4 font-serif text-3xl text-slate-950">{item.label}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{item.copy}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
