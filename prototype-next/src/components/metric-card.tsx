import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  delta,
  tone = "neutral"
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: "neutral" | "success" | "warning";
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
        </div>
        {delta ? (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium",
              tone === "success" && "bg-emerald-50 text-emerald-700",
              tone === "warning" && "bg-amber-50 text-amber-700",
              tone === "neutral" && "bg-slate-100 text-slate-600"
            )}
          >
            {delta}
          </span>
        ) : null}
      </div>
    </div>
  );
}
