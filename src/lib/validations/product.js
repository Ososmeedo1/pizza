import {z} from "zod";

export const PRODUCT_MESSAGES = {
  required: "This field is required.",
  invalidSlug: "Slug must be lowercase letters, numbers, and hyphens only.",
  invalidCategory: "Please select a valid category.",
  minZero: "Must be zero or greater.",
  sizeOrBaseRequired: "Set a base price or at least one size price.",
};

const optionalString = z.string().trim();

const optionalNonNegativeNumber = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? undefined : value,
  z.coerce.number().min(0).optional()
);

const sizePricesFields = z.object({
  S: optionalNonNegativeNumber,
  M: optionalNonNegativeNumber,
  L: optionalNonNegativeNumber,
});

const measuringUnitOptionFields = z.object({
  name: z.object({
    ar: z.string().trim().min(1),
    en: z.string().trim().min(1),
  }),
  price: z.coerce.number().min(0),
  key: z.enum(["S", "M", "L"]).or(z.literal("")).default(""),
  isActive: z.boolean(),
  sortOrder: z.number().min(0).default(0),
});

export function productSchema(messages = PRODUCT_MESSAGES) {
  return z
    .object({
      name: z.object({
        ar: z.string().trim().min(1, messages.required),
        en: z.string().trim().min(1, messages.required),
      }),
      slug: z
        .string()
        .trim()
        .min(1, messages.required)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, messages.invalidSlug),
      description: z.object({
        ar: optionalString,
        en: optionalString,
      }),
      category: z
        .string()
        .trim()
        .min(1, messages.required)
        .refine((value) => /^[0-9a-fA-F]{24}$/.test(value), messages.invalidCategory),
      price: optionalNonNegativeNumber,
      sizePrices: sizePricesFields.optional(),
      isActive: z.boolean(),
      isAvailable: z.boolean(),
      isFeatured: z.boolean(),
      isNewItem: z.boolean().default(false),
      ingredients: z.array(
        z.object({
          ar: z.string().trim().min(1, messages.required),
          en: z.string().trim().min(1, messages.required),
        })
      ).default([]),
      sortOrder: z.coerce.number().min(0, messages.minZero),
      images: z.array(
        z.object({
          url: z.string().trim().min(1, messages.required),
          fileId: optionalString,
          alt: z.object({
            ar: optionalString,
            en: optionalString,
          }),
          isPrimary: z.boolean(),
          sortOrder: z.coerce.number().min(0, messages.minZero),
        })
      ),
      hasMeasuringUnit: z.boolean().optional(),
      measuringUnit: z
        .object({
          unitType: z.enum(["weight", "pieces", "size"]).or(z.literal("")).optional(),
          options: z.array(measuringUnitOptionFields),
        })
        .optional(),
    })
    .superRefine((data, ctx) => {
      const sizePrices = data.sizePrices ?? {};
      const hasAnySize = ["S", "M", "L"].some(
        (key) => typeof sizePrices[key] === "number"
      );

      if (!hasAnySize && (data.price === undefined || data.price === null)) {
        ctx.addIssue({
          path: ["price"],
          message: messages.sizeOrBaseRequired,
          code: z.ZodIssueCode.custom,
        });
      }
    });
}