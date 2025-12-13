import { HTMLAttributes } from "react";

import { cn } from "@/utils";

export const Skeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("animate-pulse rounded-lg bg-primary-100", className)} {...props} />;
};
