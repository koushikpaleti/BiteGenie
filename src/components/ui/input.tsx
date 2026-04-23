import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm text-slate-900 shadow-sm outline-none backdrop-blur-xl transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200",
        className,
      )}
      {...props}
    />
  );
}
