import {connectDB} from "@/lib/db";
import {Category} from "@/models/Category";
import {Product} from "@/models/Product";
import {siteUrl} from "@/lib/seo";

export const revalidate = 3600;

const LOCALES = ["ar", "en"];

const staticRoutes = [
  {path: "", priority: 1, changeFrequency: "weekly"},
  {path: "/products", priority: 0.8, changeFrequency: "weekly"},
  {path: "/about", priority: 0.5, changeFrequency: "monthly"},
  {path: "/contact", priority: 0.5, changeFrequency: "monthly"},
];

function localizedEntry(pathWithoutLocale, {priority, changeFrequency, lastModified}) {
  const entry = {
    url: siteUrl(`/${LOCALES[0]}${pathWithoutLocale}`),
    lastModified: lastModified || new Date(),
    changeFrequency,
    priority,
    alternates: {
      languages: {},
    },
  };

  for (const locale of LOCALES) {
    entry.alternates.languages[locale] = siteUrl(
      `/${locale}${pathWithoutLocale}`
    );
  }
  entry.alternates.languages["x-default"] = entry.alternates.languages[LOCALES[0]];

  return entry;
}

export default async function sitemap() {
  const entries = [];

  for (const route of staticRoutes) {
    entries.push(localizedEntry(route.path, route));
  }

  let categories = [];
  let products = [];
  let dbOk = true;

  if (!process.env.MONGODB_URI) {
    dbOk = false;
  } else {
    try {
      await connectDB();
      const [cats, prods] = await Promise.all([
        Category.find({isActive: true}).select("slug updatedAt").lean(),
        Product.find({isActive: true}).select("slug updatedAt").lean(),
      ]);
      categories = cats;
      products = prods;
    } catch (error) {
      console.warn(
        `sitemap: database unavailable, emitting static routes only (${
          error instanceof Error ? error.message : String(error)
        })`
      );
      dbOk = false;
    }
  }

  if (dbOk) {
    for (const category of categories) {
      entries.push(
        localizedEntry(`/categories/${category.slug}`, {
          priority: 0.8,
          changeFrequency: "weekly",
          lastModified: category.updatedAt,
        })
      );
    }

    for (const product of products) {
      entries.push(
        localizedEntry(`/products/${product.slug}`, {
          priority: 0.8,
          changeFrequency: "daily",
          lastModified: product.updatedAt,
        })
      );
    }
  }

  return entries;
}
