import mongoose from "mongoose";
import {connectDB} from "@/lib/db";
import {Product} from "@/models/Product";
import {Category} from "@/models/Category";

function getPrimaryImage(product) {
  const images = Array.isArray(product.images) ? product.images : [];
  const primary = images.find((image) => image?.url && image.isPrimary);
  const fallback = images.find((image) => image?.url);
  return primary ?? fallback ?? null;
}

export function toAdminProductView(product) {
  const image = getPrimaryImage(product);

  return {
    id: String(product._id),
    name: product.name,
    slug: product.slug,
    price: typeof product.price === "number" ? product.price : 0,
    category: product.category
      ? {
          id: String(product.category._id ?? product.category),
          name: product.category.name,
          slug: product.category.slug,
        }
      : null,
    isActive: product.isActive !== false,
    isAvailable: product.isAvailable !== false,
    isFeatured: product.isFeatured === true,
    isNewItem: product.isNewItem === true,
    image: image ? {url: image.url, alt: image.alt ?? {ar: "", en: ""}} : null,
  };
}

export function toAdminProductDetailView(product) {
  return {
    id: String(product._id),
    name: product.name,
    slug: product.slug,
    description: product.description ?? {ar: "", en: ""},
    category: String(product.category?._id ?? product.category ?? ""),
    price: typeof product.price === "number" ? product.price : 0,
    isActive: product.isActive !== false,
    isAvailable: product.isAvailable !== false,
    isFeatured: product.isFeatured === true,
    isNewItem: product.isNewItem === true,
    sortOrder: product.sortOrder ?? 0,
    ingredients: (Array.isArray(product.ingredients)
      ? product.ingredients
      : []
    ).map((ingredient) => ({
      ar: ingredient.ar ?? "",
      en: ingredient.en ?? "",
    })),
    images: (Array.isArray(product.images) ? product.images : []).map((image) => ({
      url: image.url ?? "",
      fileId: image.fileId ?? "",
      alt: image.alt ?? {ar: "", en: ""},
      isPrimary: image.isPrimary === true,
      sortOrder: image.sortOrder ?? 0,
    })),
    hasMeasuringUnit: product.hasMeasuringUnit === true,
    measuringUnit: {
      unitType: product.measuringUnit?.unitType ?? "size",
      options: (Array.isArray(product.measuringUnit?.options)
        ? product.measuringUnit.options
        : []
      ).map((option) => ({
        name: option.name ?? {ar: "", en: ""},
        price: typeof option.price === "number" ? option.price : 0,
        key: option.key ?? "",
        isActive: option.isActive !== false,
        sortOrder: option.sortOrder ?? 0,
      })),
    },
  };
}

function buildProductFilter({search, category, availability}) {
  const filter = {};

  if (search) {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{"name.ar": regex}, {"name.en": regex}];
  }

  if (category && mongoose.isValidObjectId(category)) {
    filter.category = category;
  }

  if (availability === "active") {
    filter.isActive = true;
  } else if (availability === "inactive") {
    filter.isActive = false;
  } else if (availability === "available") {
    filter.isAvailable = true;
  } else if (availability === "soldout") {
    filter.isAvailable = false;
  }

  return filter;
}

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function getAdminProducts(query = {}) {
  const pageSize = Math.min(toPositiveInt(query.pageSize, 10), 100);
  const page = toPositiveInt(query.page, 1);

  try {
    await connectDB();

    const filter = buildProductFilter(query);
    const total = await Product.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);

    const docs = await Product.find(filter)
      .sort({sortOrder: 1, createdAt: -1, _id: 1})
      .skip((safePage - 1) * pageSize)
      .limit(pageSize)
      .populate({path: "category", select: "name slug"})
      .lean();

    return {
      items: docs.map(toAdminProductView),
      total,
      page: safePage,
      totalPages,
      pageSize,
    };
  } catch (error) {
    console.warn(
      `getAdminProducts: database unavailable (${error instanceof Error ? error.message : String(error)})`
    );
    return {items: [], total: 0, page: 1, totalPages: 1, pageSize};
  }
}

export function isValidProductId(id) {
  return mongoose.isValidObjectId(id);
}

export async function getAdminProductById(id) {
  if (!isValidProductId(id)) {
    return null;
  }

  try {
    await connectDB();

    const product = await Product.findById(id)
      .populate({path: "category", select: "name slug"})
      .lean();

    return product ? toAdminProductDetailView(product) : null;
  } catch (error) {
    console.warn(
      `getAdminProductById: database unavailable (${error instanceof Error ? error.message : String(error)})`
    );
    return null;
  }
}

export async function getAdminCategoryOptions() {
  try {
    await connectDB();

    const categories = await Category.find({isActive: true})
      .sort({sortOrder: 1, createdAt: -1})
      .select("name slug parent sortOrder")
      .lean();

    return categories.map((category) => ({
      id: String(category._id),
      name: category.name,
      slug: category.slug,
      parent: category.parent ? String(category.parent) : null,
      sortOrder: category.sortOrder ?? 0,
    }));
  } catch (error) {
    console.warn(
      `getAdminCategoryOptions: database unavailable (${error instanceof Error ? error.message : String(error)})`
    );
    return [];
  }
}