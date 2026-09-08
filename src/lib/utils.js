import {clsx} from "clsx";
import {twMerge} from "tailwind-merge";

/**
 * Merges conditional Tailwind classes, resolving conflicts with tailwind-merge.
 *
 * @param {...(string | undefined | null | false | Record<string, unknown>)} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes a phone value into a tel: href fragment: strips spaces, dashes
 * and parentheses while keeping an optional leading "+". Returns "" for
 * empty/missing input so callers can render a disabled state.
 */
export function normalizePhone(value) {
  return String(value ?? "").replace(/[\s\-()]/g, "");
}