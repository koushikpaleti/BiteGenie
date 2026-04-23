"use client";

import { Menu, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/planner", label: "Planner" },
  { href: "/generator", label: "Generator" },
  { href: "/grocery", label: "Grocery" },
  { href: "/settings", label: "Settings" },
];

export function Topbar({ user }: { user: AuthUser }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="xl:hidden">
      <div className="sticky top-0 z-40 border-b border-white/60 bg-white/70 px-4 py-4 backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">BiteGenie</p>
              <p className="text-sm font-semibold text-slate-950">{user.name}</p>
            </div>
          </div>
          <Button type="button" variant="secondary" onClick={() => setOpen((value) => !value)}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        <div
          className={cn(
            "grid transition-all",
            open ? "grid-rows-[1fr] pt-4" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div className="grid gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
