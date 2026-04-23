import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn("bg-card border border-card-border rounded-xl p-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}
