import {cache} from "react";
import {connectDB} from "@/lib/db";
import {AddOn} from "@/models/AddOn";
import {localizeField} from "@/lib/catalog";

function toAddOnView(addOn, locale) {
  return {
    id: String(addOn._id),
    name: localizeField(addOn.name, locale),
    priceMode: addOn.priceMode,
    price: typeof addOn.price === "number" ? addOn.price : null,
    sizePrices: {
      S: typeof addOn.sizePrices?.S === "number" ? addOn.sizePrices.S : null,
      M: typeof addOn.sizePrices?.M === "number" ? addOn.sizePrices.M : null,
      L: typeof addOn.sizePrices?.L === "number" ? addOn.sizePrices.L : null,
    },
  };
}

/**
 * Server-side listing of active add-ons for the storefront, sorted by sortOrder
 * ascending (ties resolved newest-first).
 *
 * Never throws: returns an empty array when MongoDB is unavailable (missing
 * MONGODB_URI, connection failure) or when there are no active add-ons. Only
 * plain, serializable view objects are returned (no raw docs, no _id values).
 * P3 will narrow the selection to the add-ons attached to a product; this is
 * the catalog-level helper the storefront reads from.
 */
export const getActiveAddOns = cache(async function getActiveAddOns(locale) {
  if (!process.env.MONGODB_URI) {
    return [];
  }

  try {
    await connectDB();

    const docs = await AddOn.find({isActive: true})
      .sort({sortOrder: 1, createdAt: -1})
      .lean();

    return docs.map((addOn) => toAddOnView(addOn, locale));
  } catch (error) {
    console.warn(
      `getActiveAddOns: database unavailable, returning empty list (${
        error instanceof Error ? error.message : String(error)
      })`
    );
    return [];
  }
});