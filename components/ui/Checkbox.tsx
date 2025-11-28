"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'onChange'> {
  label?: string;
  error?: string;
  // Support for legacy onChange API
  onChange?: (e: { target: { checked: boolean } }) => void;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, label, error, id, onChange, onCheckedChange, ...props }, ref) => {
  const generatedId = React.useId();
  const checkboxId = id || `checkbox-${generatedId}`;

  // Handle both onChange (legacy) and onCheckedChange (Radix) APIs
  const handleCheckedChange = (checked: boolean | 'indeterminate') => {
    if (onCheckedChange) {
      onCheckedChange(checked);
    }
    if (onChange && checked !== 'indeterminate') {
      onChange({ target: { checked } });
    }
  };

  if (label) {
    return (
      <div className="flex items-start space-x-3">
        <CheckboxPrimitive.Root
          ref={ref}
          id={checkboxId}
          onCheckedChange={handleCheckedChange}
          className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
            error && "border-destructive",
            className
          )}
          {...props}
        >
          <CheckboxPrimitive.Indicator
            className={cn("flex items-center justify-center text-current")}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        <div className="grid gap-1.5 leading-none">
          <label
            htmlFor={checkboxId}
            className={cn(
              "text-sm font-medium leading-none text-foreground",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            )}
          >
            {label}
          </label>
          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      id={checkboxId}
      onCheckedChange={handleCheckedChange}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        error && "border-destructive",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
