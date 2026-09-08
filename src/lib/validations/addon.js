import {z} from "zod";

export const ADDON_MESSAGES = {
  required: "This field is required.",
  invalidPriceMode: "Select a valid pricing mode.",
  minZero: "Must be zero or greater.",
  flatPriceRequired: "Enter a price for this add-on.",
  atLeastOneSize: "Add a price for at least one size (S, M, or L).",
};

const optionalNonNegativeNumber = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? undefined : value,
  z.coerce.number().min(0).optional()
);

export function addOnSchema(messages = ADDON_MESSAGES) {
  return z
    .object({
      name: z.object({
        ar: z.string().trim().min(1, messages.required),
        en: z.string().trim().min(1, messages.required),
      }),
      priceMode: z.enum(["flat", "bySize"]),
      price: optionalNonNegativeNumber,
      sizePrices: z
        .object({
          S: optionalNonNegativeNumber,
          M: optionalNonNegativeNumber,
          L: optionalNonNegativeNumber,
        })
        .default({}),
      isActive: z.boolean().default(true),
      sortOrder: z.coerce.number().min(0, messages.minZero).default(0),
    })
    .superRefine((data, ctx) => {
      if (data.priceMode === "flat") {
        if (typeof data.price !== "number") {
          ctx.addIssue({
            path: ["price"],
            message: messages.flatPriceRequired,
            code: z.ZodIssueCode.custom,
          });
        }
      } else {
        const prices = data.sizePrices ?? {};
        const hasAnySize = [prices.S, prices.M, prices.L].some(
          (value) => typeof value === "number"
        );
        if (!hasAnySize) {
          ctx.addIssue({
            path: ["sizePrices"],
            message: messages.atLeastOneSize,
            code: z.ZodIssueCode.custom,
          });
        }
      }
    });
}