"use client";

import { motion } from "framer-motion";
import {
  ChefHat,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingBasket,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/planner", label: "Meal Planner", icon: ChefHat },
  { href: "/generator", label: "AI Generator", icon: Sparkles },
  { href: "/grocery", label: "Grocery", icon: ShoppingBasket },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to logout");
    }
  }

  return (
    <aside className="hidden w-72 shrink-0 xl:flex">
      <div className="sticky top-0 flex h-screen w-full flex-col border-r border-white/60 bg-white/45 px-6 py-8 backdrop-blur-2xl">
        <div className="space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.9),rgba(249,115,22,0.9),rgba(15,23,42,0.95))] text-white shadow-[0_18px_55px_-20px_rgba(249,115,22,0.9)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
              BiteGenie
            </p>
            <h2 className="mt-2 font-serif text-3xl text-slate-950">
              Eat smarter.
            </h2>
          </div>
        </div>

        <nav className="mt-10 flex flex-1 flex-col gap-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative overflow-hidden rounded-2xl px-4 py-3 text-sm font-medium transition",
                  active ? "text-slate-950" : "text-slate-500 hover:text-slate-900",
                )}
              >
                {active && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 rounded-2xl bg-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.45)]"
                  />
                )}
                <span className="relative flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="rounded-[24px] border border-white/70 bg-white/75 p-5 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.45)]">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Signed in</p>
          <p className="mt-3 text-lg font-semibold text-slate-950">{user.name}</p>
          <p className="text-sm text-slate-500">{user.email}</p>
          <Button
            type="button"
            variant="secondary"
            onClick={handleLogout}
            className="mt-5 w-full justify-center"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
