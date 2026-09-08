import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth";
import {connectDB} from "@/lib/db";
import {Category} from "@/models/Category";
import {getAdminCategories, guardCategoryParent} from "@/lib/data/adminCategories";
import {categorySchema} from "@/lib/validations/category";
import {revalidateCategoryPaths} from "@/lib/revalidate";

export const dynamic = "force-dynamic";

function toCategoryView(category) {
  return {
    id: String(category._id),
    name: category.name,
    slug: category.slug,
    description: category.description ?? {ar: "", en: ""},
    image: category.image ?? {url: "", alt: {ar: "", en: ""}},
    isActive: category.isActive,
    parent: category.parent ? String(category.parent) : null,
    sortOrder: category.sortOrder,
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({error: "UNAUTHORIZED"}, {status: 401});
    }

    const categories = await getAdminCategories();

    return NextResponse.json({categories});
  } catch (error) {
    console.error("admin categories GET: unexpected error", error);
    return NextResponse.json({error: "INTERNAL_ERROR"}, {status: 500});
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({error: "UNAUTHORIZED"}, {status: 401});
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({error: "INVALID_BODY"}, {status: 400});
    }

    const parsed = categorySchema().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({error: "INVALID_BODY"}, {status: 400});
    }

    const data = parsed.data;
    data.parent = data.parent ?? null;

    await connectDB();

    const guard = await guardCategoryParent({parentId: data.parent});
    if (!guard.ok) {
      return NextResponse.json({error: guard.error}, {status: 400});
    }

    const existing = await Category.findOne({slug: data.slug}).lean();

    if (existing) {
      return NextResponse.json({error: "SLUG_EXISTS"}, {status: 409});
    }

    let created;
    try {
      created = await Category.create(data);
    } catch (error) {
      if (error?.code === 11000) {
        return NextResponse.json({error: "SLUG_EXISTS"}, {status: 409});
      }
      throw error;
    }

    revalidateCategoryPaths({slug: created.slug});

    return NextResponse.json({category: toCategoryView(created)}, {status: 201});
  } catch (error) {
    console.error("admin categories POST: unexpected error", error);
    return NextResponse.json({error: "INTERNAL_ERROR"}, {status: 500});
  }
}