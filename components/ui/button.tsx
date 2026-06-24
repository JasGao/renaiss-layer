import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "rainbow" | "primary" | "outline" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  children: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  rainbow:
    "relative overflow-hidden bg-brand text-white font-semibold before:absolute before:inset-0 before:rounded-full before:p-px before:bg-rainbow-conic before:animate-spin-slow before:-z-10 after:absolute after:inset-px after:rounded-full after:bg-brand after:-z-10 hover:brightness-110",
  primary:
    "bg-primary text-white font-semibold hover:brightness-110",
  outline:
    "border border-white/20 bg-brand text-white font-semibold hover:border-white/40",
  ghost:
    "text-white/80 font-medium hover:text-white hover:bg-white/5",
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full px-6 text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
