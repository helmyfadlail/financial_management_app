import { forwardRef, HTMLAttributes } from "react";

import { cn } from "@/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "outline";
  size?: "sm" | "md" | "lg";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = "default", size = "md", ...props }, ref) => {
  const variants = {
    default: "bg-primary text-white",
    success: "bg-green-500 text-white",
    warning: "bg-yellow-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
    outline: "border-2 border-primary text-primary bg-transparent",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return <span ref={ref} className={cn("inline-flex items-center gap-1 rounded-full font-medium", variants[variant], sizes[size], className)} {...props} />;
});
Badge.displayName = "Badge";

export { Badge };
