import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/70 bg-white/70 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur-2xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
