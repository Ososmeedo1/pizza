import {cache} from "react";
import {connectDB} from "@/lib/db";
import {Category} from "@/models/Category";
import {Product} from "@/models/Product";
import {AddOn} from "@/models/AddOn";
import {localizeField} from "@/lib/catalog";
import {toSummaryView} from "@/lib/data/products";

const ADD_ONS_SLUG = "add-ons";

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
 * Server-side grouped menu for /products.
 *
 * Builds an ordered list of menu sections with only non-empty ones:
 * - top-level categories that have active children (e.g. pizzas) become
 *   "group" sections rendered first, with one child sub-section per
 *   non-empty child category (subheader + grid);
 * - other top-level categories that have direct products become "simple"
 *   sections (sides, salads, desserts, drinks);
 * - the add-ons category is excluded from sections and returned as a list of
 *   add-on cards for the trailing ADD-ONS section.
 *
 * Categories keep their sortOrder; empty categories are dropped entirely.
 * Never throws: returns `{sections: [], addOns: []}` when MongoDB is
 * unavailable or there are no active items. Only plain, serializable views.
 */
export const getGroupedMenu = cache(async function getGroupedMenu(locale) {
  if (!process.env.MONGODB_URI) {
    return {sections: [], addOns: []};
  }

  try {
    await connectDB();

    const [categoryDocs, productDocs, addOnDocs] = await Promise.all([
      Category.find({isActive: true})
        .sort({sortOrder: 1, createdAt: -1})
        .lean(),
      Product.find({isActive: true})
        .sort({sortOrder: 1, createdAt: -1, _id: 1})
        .populate({path: "category", select: "name slug"})
        .lean(),
      AddOn.find({isActive: true})
        .sort({sortOrder: 1, createdAt: -1})
        .lean(),
    ]);

    const catView = (category) => ({
      slug: category.slug,
      name: localizeField(category.name, locale),
      description: localizeField(category.description, locale),
    });

    const itemsByCategory = new Map();
    for (const product of productDocs) {
      const categoryId = String(product.category?._id ?? product.category ?? "");
      const bucket = itemsByCategory.get(categoryId);
      const view = toSummaryView(product, locale);
      if (bucket) {
        bucket.push(view);
      } else {
        itemsByCategory.set(categoryId, [view]);
      }
    }

    const hasItems = (categoryId) =>
      (itemsByCategory.get(String(categoryId)) ?? []).length > 0;

    const sections = [];
    for (const category of categoryDocs) {
      if (!category.parent && category.slug !== ADD_ONS_SLUG) {
        const children = categoryDocs.filter(
          (candidate) => String(candidate.parent) === String(category._id)
        );
        const childSections = children
          .filter((child) => hasItems(child._id))
          .map((child) => ({
            category: catView(child),
            items: itemsByCategory.get(String(child._id)) ?? [],
          }));

        if (childSections.length > 0) {
          sections.push({
            type: "group",
            category: catView(category),
            children: childSections,
          });
        } else if (hasItems(category._id)) {
          sections.push({
            type: "simple",
            category: catView(category),
            items: itemsByCategory.get(String(category._id)) ?? [],
          });
        }
      }
    }

    return {
      sections,
      addOns: addOnDocs.map((addOn) => toAddOnView(addOn, locale)),
    };
  } catch (error) {
    console.warn(
      `getGroupedMenu: database unavailable, returning empty menu (${
        error instanceof Error ? error.message : String(error)
      })`
    );
    return {sections: [], addOns: []};
  }
});