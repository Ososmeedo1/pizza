import mongoose from "mongoose";
import {connectDB} from "@/lib/db";
import {Category} from "@/models/Category";
import {Product} from "@/models/Product";

export async function getAdminCategories() {
  try {
    await connectDB();

    const categories = await Category.find({}).sort({sortOrder: 1, createdAt: -1}).lean();

    const activeProductsByCategory = await Product.aggregate([
      {$match: {isActive: true}},
      {$group: {_id: "$category", count: {$sum: 1}}},
    ]);

    const counts = new Map(
      activeProductsByCategory.map((entry) => [String(entry._id), entry.count])
    );

    return categories.map((category) => ({
      id: String(category._id),
      name: category.name,
      slug: category.slug,
      isActive: category.isActive,
      parent: category.parent ? String(category.parent) : null,
      sortOrder: category.sortOrder,
      activeProductsCount: counts.get(String(category._id)) || 0,
    }));
  } catch (error) {
    console.warn(
      `getAdminCategories: database unavailable (${error instanceof Error ? error.message : String(error)})`
    );
    return [];
  }
}

export function isValidCategoryId(id) {
  return mongoose.isValidObjectId(id);
}

export async function getAdminCategoryById(id) {
  if (!isValidCategoryId(id)) {
    return null;
  }

  try {
    await connectDB();

    const category = await Category.findById(id).lean();

    if (!category) {
      return null;
    }

    return {
      id: String(category._id),
      name: category.name,
      slug: category.slug,
      description: category.description ?? {ar: "", en: ""},
      image: category.image ?? {url: "", fileId: "", alt: {ar: "", en: ""}},
      isActive: category.isActive ?? true,
      parent: category.parent ? String(category.parent) : null,
      sortOrder: category.sortOrder ?? 0,
    };
  } catch (error) {
    console.warn(
      `getAdminCategoryById: database unavailable (${error instanceof Error ? error.message : String(error)})`
    );
    return null;
  }
}

function collectDescendantIds(categories, rootId) {
  const excluded = new Set([String(rootId)]);
  const queue = [String(rootId)];

  while (queue.length > 0) {
    const current = queue.shift();
    for (const category of categories) {
      const parentId = category.parent ? String(category.parent) : null;
      if (parentId === current) {
        const id = String(category._id);
        if (!excluded.has(id)) {
          excluded.add(id);
          queue.push(id);
        }
      }
    }
  }

  return excluded;
}

/**
 * Candidate parent categories for the category form. Only top-level
 * categories (parent === null) can be chosen as a parent; when `excludeId`
 * is given (editing), that category and every one of its descendants are
 * removed from the list so the hierarchy can never contain a cycle.
 *
 * Returns plain option objects ({id, name, slug}) or an empty array when the
 * database is unavailable.
 */
export async function getAdminParentCategoryOptions({excludeId} = {}) {
  try {
    await connectDB();

    const categories = await Category.find({})
      .sort({sortOrder: 1, createdAt: -1})
      .select("_id name slug parent sortOrder")
      .lean();

    const excluded =
      excludeId && isValidCategoryId(excludeId)
        ? collectDescendantIds(categories, excludeId)
        : null;

    return categories
      .filter((category) => !category.parent)
      .filter(
        (category) =>
          excluded === null || !excluded.has(String(category._id))
      )
      .map((category) => ({
        id: String(category._id),
        name: category.name,
        slug: category.slug,
      }));
  } catch (error) {
    console.warn(
      `getAdminParentCategoryOptions: database unavailable (${error instanceof Error ? error.message : String(error)})`
    );
    return [];
  }
}

/**
 * Validates a parent assignment on the categories API. Returns
 * `{ok: true}` when the parent is empty or a valid, existing category that
 * cannot create a cycle (not the category itself, not one of its
 * descendants). Returns `{ok: false, error}` with a machine-readable error
 * code otherwise.
 */
export async function guardCategoryParent({parentId, categoryId}) {
  if (!parentId) {
    return {ok: true};
  }

  if (!isValidCategoryId(parentId)) {
    return {ok: false, error: "PARENT_INVALID"};
  }

  try {
    await connectDB();

    const parent = await Category.findById(parentId).select("_id").lean();
    if (!parent) {
      return {ok: false, error: "PARENT_NOT_FOUND"};
    }

    if (categoryId && String(categoryId) === String(parent._id)) {
      return {ok: false, error: "PARENT_SELF"};
    }

    const categories = await Category.find({}).select("_id parent").lean();
    const descendants = collectDescendantIds(categories, categoryId);
    if (descendants.has(String(parent._id))) {
      return {ok: false, error: "PARENT_CYCLE"};
    }

    return {ok: true};
  } catch (error) {
    console.warn(
      `guardCategoryParent: database unavailable (${error instanceof Error ? error.message : String(error)})`
    );
    return {ok: false, error: "INTERNAL_ERROR"};
  }
}