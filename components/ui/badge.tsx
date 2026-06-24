import { cn } from "@/lib/utils/cn";
import type { CardBadge } from "@/lib/utils/badges";

const variantClasses: Record<CardBadge["variant"], string> = {
  default: "bg-white/10 text-white/80",
  success: "bg-[#78FF6C23] text-[#4AFF32]",
  warning: "bg-[#FDC60033] text-[#FDC600]",
  error: "bg-[#FF326833] text-[#FF3268]",
  primary: "bg-[#8260FF33] text-[#8260FF]",
  muted: "bg-white/5 text-white/50",
};

const dotClasses: Record<CardBadge["variant"], string> = {
  default: "bg-white/60",
  success: "bg-[#4AFF32]",
  warning: "bg-[#FDC600]",
  error: "bg-[#FF3268]",
  primary: "bg-[#8260FF]",
  muted: "bg-white/40",
};

export function Badge({ label, variant }: CardBadge) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        variantClasses[variant],
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotClasses[variant])} />
      {label}
    </span>
  );
}
