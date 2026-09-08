import {forwardRef} from "react";
import {ChevronDown} from "lucide-react";
import {cn} from "@/lib/utils";

const Select = forwardRef(function Select({className, children, ...props}, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "flex h-11 w-full appearance-none rounded-xl border border-input bg-background px-3 py-2 text-sm",
          "pr-9 ring-offset-background placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 end-3 my-auto h-4 w-4 text-muted-foreground"
      />
    </div>
  );
});

export {Select};