import {Beef, Drumstick, Fish, Leaf, Milk, Pizza, Sandwich, UtensilsCrossed} from "lucide-react";
import {cn} from "@/lib/utils";

const CATEGORY_ICONS = {
  pizzas: Pizza,
  "add-ons": Sandwich,
  "vegetarian-pizza": Leaf,
  "cheese-pizza": Milk,
  "chicken-pizza": Drumstick,
  "meat-pizza": Beef,
  "seafood-pizza": Fish,
};

export function CategoryIconTile({
  slug,
  iconClassName = "h-10 w-10",
  iconColorClassName = "text-brand/70",
  className,
}) {
  const Icon = CATEGORY_ICONS[slug] ?? UtensilsCrossed;

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-primary/10 dark:bg-primary/15",
        className
      )}
    >
      <Icon className={cn(iconColorClassName, iconClassName)} />
    </div>
  );
}