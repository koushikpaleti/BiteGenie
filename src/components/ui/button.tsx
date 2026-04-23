"use client";

import { motion } from "framer-motion";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export function Button({
  className,
  variant = "primary",
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} whileHover={{ y: -1 }} className="inline-flex">
      <button
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-60",
          variant === "primary" &&
            "bg-slate-950 text-white shadow-[0_18px_45px_-18px_rgba(15,23,42,0.85)] hover:bg-slate-800 focus-visible:ring-slate-500",
          variant === "secondary" &&
            "border border-white/70 bg-white/70 text-slate-900 shadow-sm backdrop-blur-xl hover:bg-white focus-visible:ring-slate-300",
          variant === "ghost" &&
            "bg-transparent text-slate-700 hover:bg-white/60 focus-visible:ring-slate-300",
          variant === "danger" &&
            "bg-rose-600 text-white shadow-[0_18px_45px_-18px_rgba(225,29,72,0.7)] hover:bg-rose-500 focus-visible:ring-rose-300",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    </motion.div>
  );
}
