import {forwardRef} from "react";
import {cn} from "@/lib/utils";

const variants = {
  default: "border-transparent bg-primary text-primary-foreground",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  destructive: "border-transparent bg-error text-error-foreground",
  outline: "text-foreground",
};

const Badge = forwardRef(function Badge({className, variant = "default", ...props}, ref) {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});

export {Badge};