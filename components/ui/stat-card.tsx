import { cn } from "@/lib/utils/cn";

type StatCardProps = {
  label: string;
  value: number;
  accent?: "default" | "success" | "warning" | "primary";
};

const accentClasses = {
  default: "text-white",
  success: "text-[#4AFF32]",
  warning: "text-[#FDC600]",
  primary: "text-[#8260FF]",
};

export function StatCard({ label, value, accent = "default" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-brand-1000/50 px-4 py-3">
      <p className="text-xs font-medium text-white/50">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold tabular-nums", accentClasses[accent])}>
        {value}
      </p>
    </div>
  );
}
