import { Badge } from "@/components/ui/badge";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        <Badge>{eyebrow}</Badge>
        <div className="space-y-2">
          <h1 className="font-serif text-4xl tracking-tight text-slate-950 sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            {description}
          </p>
        </div>
      </div>
      {action}
    </div>
  );
}
