import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        danger: "bg-danger/10 text-danger",
        info: "bg-blue-500/10 text-blue-400",
        purple: "bg-primary/10 text-primary",
        gray: "bg-muted/10 text-muted",
      },
    },
    defaultVariants: { variant: "gray" },
  }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, variant, className }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)}>{children}</span>;
}

const STATUS_MAP: Record<string, VariantProps<typeof badgeVariants>["variant"]> = {
  confirmed: "success",
  approved: "success",
  tokens_transferred: "success",
  pending: "warning",
  pending_payment: "warning",
  payment_confirmed: "info",
  failed: "danger",
  rejected: "danger",
  SALE: "purple",
  REFERRAL: "info",
  PAYOUT: "gray",
  USER: "gray",
  SALES: "success",
  ADMIN: "info",
  SUPER_ADMIN: "purple",
};

export function StatusBadge({ status }: { status: string }) {
  const variant = STATUS_MAP[status] ?? "gray";
  const label = status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  return <Badge variant={variant}>{label}</Badge>;
}
