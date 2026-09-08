import {cache} from "react";
import mongoose from "mongoose";
import {connectDB} from "@/lib/db";
import {Product} from "@/models/Product";
import {Category} from "@/models/Category";
import {
  getPrimaryProductImage,
  getProductDisplayPrice,
  localizeField,
} from "@/lib/catalog";

export function toSummaryView(product, locale) {
  return {
    slug: product.slug,
    name: localizeField(product.name, locale),
    description: localizeField(product.description, locale),
    price: getProductDisplayPrice(product),
    hasMeasuringUnit: product.hasMeasuringUnit === true,
    isAvailable: product.isAvailable !== false,
    isFeatured: product.isFeatured === true,
    isNewItem: product.isNewItem === true,
    image: getPrimaryProductImage(product, locale),
    category: product.category
      ? {
          slug: product.category.slug,
          name: localizeField(product.category.name, locale),
        }
      : null,
  };
}

function toDetailView(product, locale) {
  return {
    id: String(product._id),
    slug: product.slug,
    name: localizeField(product.name, locale),
    description: localizeField(product.description, locale),
    price:
      typeof product.price === "number" ? product.price : 0,
    hasMeasuringUnit: product.hasMeasuringUnit === true,
    isAvailable: product.isAvailable !== false,
    isFeatured: product.isFeatured === true,
    isNewItem: product.isNewItem === true,
    ingredients: (Array.isArray(product.ingredients)
      ? product.ingredients
      : []
    ).map((ingredient) => ({
      ar: ingredient.ar ?? "",
      en: ingredient.en ?? "",
    })),
    images: (Array.isArray(product.images) ? product.images : [])
      .filter((image) => image?.url)
      .map((image) => ({
        url: image.url,
        alt: localizeField(image.alt, locale) ?? "",
      })),
    measuringUnit: {
      unitType: product.measuringUnit?.unitType ?? "size",
      options: (Array.isArray(product.measuringUnit?.options)
        ? product.measuringUnit.options
        : []
      )
        .filter((option) => option.isActive !== false)
        .map((option) => ({
          name: localizeField(option.name, locale),
          price: option.price,
          key: option.key ?? "",
        })),
    },
    category: product.category
      ? {
          slug: product.category.slug,
          name: localizeField(product.category.name, locale),
        }
      : null,
  };
}

/**
 * Server-side listing of active products for the storefront.
 *
 * Never throws: returns an empty array when MongoDB is unavailable (missing
 * MONGODB_URI, connection failure) or when there are no active products. Only
 * plain, serializable view objects are returned (no raw docs, no _id values).
 */
export const getActiveProducts = cache(async function getActiveProducts(locale) {
  if (!process.env.MONGODB_URI) {
    return [];
  }

  try {
    await connectDB();

    const docs = await Product.find({isActive: true})
      .sort({sortOrder: 1, createdAt: -1})
      .populate({path: "category", select: "name slug"})
      .lean();

    return docs.map((product) => toSummaryView(product, locale));
  } catch (error) {
    console.warn(
      `getActiveProducts: database unavailable, returning empty list (${
        error instanceof Error ? error.message : String(error)
      })`
    );
    return [];
  }
});

/**
 * Server-side, filterable listing of active products for the storefront.
 *
 * `query` accepts `{ search, categorySlug, page, pageSize }`:
 * - `search`: case-insensitive substring match against `name.ar` or `name.en`.
 * - `categorySlug`: restrict results to that (active) category by slug.
 * - `page`: 1-based page number (default 1).
 * - `pageSize`: items per page capped at 100 (default 12).
 *
 * Never throws: returns `{ items, total, page, totalPages, pageSize }` with
 * empty items when MongoDB is unavailable (missing MONGODB_URI, connection
 * failure) or there are no matching active products. The requested page is
 * clamped into [1, totalPages] so `items` is stable across out-of-range URLs.
 * Returns plain, serializable summary view objects.
 */
export const getStoreProducts = cache(async function getStoreProducts(query = {}, locale) {
  const {search = "", categorySlug = ""} = query;
  const trimmedSearch = String(search).trim();
  const trimmedCategory = String(categorySlug).trim();
  const EMPTY = {items: [], total: 0, page: 1, totalPages: 1, pageSize: 12};

  const pageSize = Math.min(parsePositiveInt(query.pageSize, 12), 100);
  const page = parsePositiveInt(query.page, 1);

  if (!process.env.MONGODB_URI) {
    return EMPTY;
  }

  try {
    await connectDB();

    const conditions = {isActive: true};

    if (trimmedSearch) {
      const escaped = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      conditions.$or = [{"name.ar": regex}, {"name.en": regex}];
    }

    if (trimmedCategory) {
      let categoryId;
      if (mongoose.Types.ObjectId.isValid(trimmedCategory)) {
        categoryId = trimmedCategory;
      } else {
        const category = await Category.findOne({slug: trimmedCategory})
          .select("_id")
          .lean();
        categoryId = category?._id;
      }

      if (!categoryId) {
        return EMPTY;
      }
      conditions.category = categoryId;
    }

    const total = await Product.countDocuments(conditions);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);

    const docs = await Product.find(conditions)
      .sort({sortOrder: 1, createdAt: -1, _id: 1})
      .skip((safePage - 1) * pageSize)
      .limit(pageSize)
      .populate({path: "category", select: "name slug"})
      .lean();

    return {
      items: docs.map((product) => toSummaryView(product, locale)),
      total,
      page: safePage,
      totalPages,
      pageSize,
    };
  } catch (error) {
    console.warn(
      `getStoreProducts: database unavailable, returning empty list (${
        error instanceof Error ? error.message : String(error)
      })`
    );
    return EMPTY;
  }
});

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Server-side listing of featured products for the storefront.
 *
 * Never throws: returns an empty array when MongoDB is unavailable (missing
 * MONGODB_URI, connection failure) or when there are no featured active
 * products. Only plain, serializable summary views are returned.
 */
export const getFeaturedProducts = cache(async function getFeaturedProducts(locale) {
  if (!process.env.MONGODB_URI) {
    return [];
  }

  try {
    await connectDB();

    const docs = await Product.find({isActive: true, isFeatured: true})
      .sort({sortOrder: 1, createdAt: -1})
      .populate({path: "category", select: "name slug"})
      .lean();

    return docs.map((product) => toSummaryView(product, locale));
  } catch (error) {
    console.warn(
      `getFeaturedProducts: database unavailable, returning empty list (${
        error instanceof Error ? error.message : String(error)
      })`
    );
    return [];
  }
});

/**
 * Server-side product detail lookup. Only active products are returned.
 *
 * Returns a plain, serializable detail view (base price, all images, localized
 * option groups and their active options) or null when the product is not
 * found or the database is unavailable.
 */
export const getProductBySlug = cache(async function getProductBySlug(slug, locale) {
  if (!process.env.MONGODB_URI || !slug) {
    return null;
  }

  try {
    await connectDB();

    const product = await Product.findOne({slug, isActive: true})
      .populate({path: "category", select: "name slug"})
      .lean();

    return product ? toDetailView(product, locale) : null;
  } catch (error) {
    console.warn(
      `getProductBySlug: database unavailable, returning null (${
        error instanceof Error ? error.message : String(error)
      })`
    );
    return null;
  }
});

/**
 * Server-side related products: active products in the same category as the
 * given product, excluding it, newest-aware and featured-first.
 *
 * Returns summary view objects or an empty array when the database is
 * unavailable or the inputs are invalid.
 */
export const getRelatedProducts = cache(async function getRelatedProducts(
  productId,
  categorySlug,
  locale,
  limit = 4
) {
  if (!process.env.MONGODB_URI || !productId || !categorySlug) {
    return [];
  }

  try {
    await connectDB();

    let categoryId;
    if (mongoose.Types.ObjectId.isValid(categorySlug)) {
      categoryId = categorySlug;
    } else {
      const category = await Category.findOne({slug: categorySlug})
        .select("_id")
        .lean();
      categoryId = category?._id;
    }
    if (!categoryId) {
      return [];
    }

    const docs = await Product.find({
      isActive: true,
      category: categoryId,
      _id: {$ne: new mongoose.Types.ObjectId(productId)},
    })
      .sort({isFeatured: -1, sortOrder: 1, createdAt: -1})
      .limit(limit)
      .populate({path: "category", select: "name slug"})
      .lean();

    return docs.map((product) => toSummaryView(product, locale));
  } catch (error) {
    console.warn(
      `getRelatedProducts: database unavailable, returning empty list (${
        error instanceof Error ? error.message : String(error)
      })`
    );
    return [];
  }
});