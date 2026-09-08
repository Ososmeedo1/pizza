import {z} from "zod";

export const CATEGORY_MESSAGES = {
  required: "This field is required.",
  invalidSlug: "Slug must be lowercase letters, numbers, and hyphens only.",
  invalidUrl: "Image URL must be a valid http(s) URL.",
  minZero: "Sort order must be zero or greater.",
  invalidParent: "Please select a valid parent category.",
};

const optionalString = z.string().trim();

function isImageUrl(value) {
  return !value || /^(?:https?:\/\/|\/)/i.test(value);
}

function optionalObjectId(message) {
  return z.preprocess(
    (value) =>
      value === "" || value === null || value === undefined ? undefined : value,
    z.string().trim().regex(/^[0-9a-fA-F]{24}$/, message).optional()
  );
}

export function categorySchema(messages = CATEGORY_MESSAGES) {
  return z.object({
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
    image: z.object({
      url: optionalString.refine(isImageUrl, messages.invalidUrl),
      fileId: z.string().optional(),
      alt: z.object({
        ar: optionalString,
        en: optionalString,
      }),
    }),
    parent: optionalObjectId(messages.invalidParent),
    isActive: z.boolean(),
    sortOrder: z.coerce.number().min(0, messages.minZero),
  });
}