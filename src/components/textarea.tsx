import { forwardRef, TextareaHTMLAttributes } from "react";

import { cn } from "@/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, label, error, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-primary-700 mb-1.5">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
          "w-full px-4 py-2.5 rounded-lg border-2 border-primary-100 bg-white text-primary-900 placeholder:text-primary-300",
          "focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none",
          "transition-all duration-200 resize-none",
          "disabled:bg-neutral-100 disabled:cursor-not-allowed",
          error && "border-red-500 focus:border-red-500 focus:ring-red-200",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
