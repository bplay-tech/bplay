"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
  {
    variants: {
      variant: {
        solid: "bg-primary text-white hover:bg-primary-hover",
        outline: "border border-card-border text-foreground hover:bg-card",
        ghost: "text-foreground hover:bg-card",
        danger: "bg-danger text-white hover:bg-red-600",
        success: "bg-success text-white hover:bg-green-600",
        gradient: "bg-linear-to-r from-primary to-accent text-white hover:opacity-90",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "solid", size: "md" },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button({ className, variant, size, loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}
