import { forwardRef, HTMLAttributes } from "react";

import { cn } from "@/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "elevated";
}

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-white rounded-xl shadow-sm border border-primary-100",
    bordered: "bg-white rounded-xl border-2 border-primary-200",
    elevated: "bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow",
  };

  return <div ref={ref} className={cn(variants[variant], className)} {...props} />;
});
Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pb-4", className)} {...props} />);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-xl font-bold text-primary-900", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-primary-600 mt-1", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />);
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 flex items-center gap-3", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
