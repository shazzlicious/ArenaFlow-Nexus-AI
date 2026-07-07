import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<"input">
>(function Checkbox({ className, ...props }, ref) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        className="peer sr-only"
        {...props}
      />
      <span className="grid place-content-center h-4 w-4 shrink-0 rounded-sm border border-primary shadow bg-background text-current peer-checked:bg-primary peer-checked:text-primary-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
        <Check className="h-4 w-4 opacity-0 transition-opacity peer-checked:opacity-100" />
      </span>
    </label>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
