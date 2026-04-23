"use client";

import { Toaster } from "sonner";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        richColors
        theme="light"
        position="top-right"
        toastOptions={{
          classNames: {
            toast:
              "border border-white/70 bg-white/90 text-slate-900 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.4)] backdrop-blur-xl",
          },
        }}
      />
    </>
  );
}
