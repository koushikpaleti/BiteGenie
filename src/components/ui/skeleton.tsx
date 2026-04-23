import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-[linear-gradient(110deg,rgba(226,232,240,0.55),rgba(255,255,255,0.95),rgba(226,232,240,0.55))] bg-[length:200%_100%]",
        className,
      )}
    />
  );
}
