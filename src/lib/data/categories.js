import {cache} from "react";
import {connectDB} from "@/lib/db";
import {Category} from "@/models/Category";
import {Product} from "@/models/Product";
import {localizeField} from "@/lib/catalog";
import {toSummaryView} from "@/lib/data/products";

/**
 * Server-side list of active categories for the storefront, sorted by
 * sortOrder ascending.
 *
 * Returns plain, serializable category view objects ({slug, name,
 * description, image}) or an empty array when the database is unavailable or
 * there are no active categories. Never throws.
 */
export const getActiveCategories = cache(async function getActiveCategories(locale) {
  if (!process.env.MONGODB_URI) {
    return [];
  }

  try {
    await connectDB();

    const docs = await Category.find({isActive: true})
      .sort({sortOrder: 1, createdAt: -1})
      .lean();

    return docs.map((category) => {
      const name = localizeField(category.name, locale);
      return {
        slug: category.slug,
        name,
        description: localizeField(category.description, locale),
        parent: category.parent ? String(category.parent) : null,
        image: category.image?.url
          ? {
              url: category.image.url,
              alt: localizeField(category.image.alt, locale) ?? name,
            }
          : null,
      };
    });
  } catch (error) {
    console.warn(
      `getActiveCategories: database unavailable, returning empty list (${
        error instanceof Error ? error.message : String(error)
      })`
    );
    return [];
  }
});

/**
 * Server-side category lookup for a storefront slug. Only active categories
 * are returned.
 *
 * Returns a plain, serializable category view (localized name, description and
 * image) or null when the category is not found or the database is
 * unavailable. Never throws.
 */
export const getCategoryBySlug = cache(async function getCategoryBySlug(slug, locale) {
  if (!process.env.MONGODB_URI || !slug) {
    return null;
  }

  try {
    await connectDB();

    const category = await Category.findOne({slug, isActive: true}).lean();

    if (!category) {
      return null;
    }

    const name = localizeField(category.name, locale);

    return {
      slug: category.slug,
      name,
      description: localizeField(category.description, locale),
      parent: category.parent ? String(category.parent) : null,
      image: category.image?.url
        ? {
            url: category.image.url,
            alt: localizeField(category.image.alt, locale) ?? name,
          }
        : null,
    };
  } catch (error) {
    console.warn(
      `getCategoryBySlug: database unavailable, returning null (${
        error instanceof Error ? error.message : String(error)
      })`
    );
    return null;
  }
});

function toCategoryView(category, locale) {
  const name = localizeField(category.name, locale);
  return {
    slug: category.slug,
    name,
    description: localizeField(category.description, locale),
    parent: category.parent ? String(category.parent) : null,
    image: category.image?.url
      ? {
          url: category.image.url,
          alt: localizeField(category.image.alt, locale) ?? name,
        }
      : null,
  };
}

/**
 * Server-side data bundle for a storefront category page.
 *
 * Resolves the category, its hierarchy context and a paginated products list:
 * - Parent categories (e.g. "pizzas") list every active product whose category
 *   is the parent OR any of its children (descendant products), useful for the
 *   "All" chip.
 * - Child categories (e.g. "vegetarian-pizza") list only their own products.
 * - `children` is always the parent's child list (used for filter chips),
 *   which is the category's own children when it is top-level.
 * - `group` is the chip-grouping anchor ("All"): the category itself when
 *   top-level, otherwise its parent.
 *
 * Never throws: returns null when the category is missing or the database is
 * unavailable. Returns plain, serializable category and summary view objects.
 */
export const getCategoryPageData = cache(async function getCategoryPageData(
  categorySlug,
  locale,
  query = {}
) {
  if (!process.env.MONGODB_URI || !categorySlug) {
    return null;
  }

  try {
    await connectDB();

    const category = await Category.findOne({
      slug: categorySlug,
      isActive: true,
    }).lean();

    if (!category) {
      return null;
    }

    const parentCategory = category.parent
      ? await Category.findById(category.parent)
          .where("isActive", true)
          .lean()
      : null;

    let children = [];
    let categoryIds;

    if (parentCategory) {
      children = await Category.find({
        parent: parentCategory._id,
        isActive: true,
      })
        .sort({sortOrder: 1, createdAt: -1})
        .lean();
      categoryIds = [category._id];
    } else {
      children = await Category.find({
        parent: category._id,
        isActive: true,
      })
        .sort({sortOrder: 1, createdAt: -1})
        .lean();
      categoryIds = [category._id, ...children.map((child) => child._id)];
    }

    const pageSize = Math.min(parseInt(query.pageSize, 10) || 12, 100);
    const rawPage = parseInt(query.page, 10);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

    const conditions = {isActive: true, category: {$in: categoryIds}};
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
      category: toCategoryView(category, locale),
      group: parentCategory
        ? toCategoryView(parentCategory, locale)
        : toCategoryView(category, locale),
      children: children.map((child) => toCategoryView(child, locale)),
      pagination: {
        items: docs.map((product) => toSummaryView(product, locale)),
        total,
        page: safePage,
        totalPages,
        pageSize,
      },
    };
  } catch (error) {
    console.warn(
      `getCategoryPageData: database unavailable, returning null (${
        error instanceof Error ? error.message : String(error)
      })`
    );
    return null;
  }
});