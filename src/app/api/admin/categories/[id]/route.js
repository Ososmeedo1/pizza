import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth";
import {connectDB} from "@/lib/db";
import {Category} from "@/models/Category";
import {Product} from "@/models/Product";
import {isValidCategoryId, guardCategoryParent} from "@/lib/data/adminCategories";
import {categorySchema} from "@/lib/validations/category";
import {revalidateCategoryPaths} from "@/lib/revalidate";

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

export async function PUT(request, {params}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({error: "UNAUTHORIZED"}, {status: 401});
    }

    const {id} = await params;

    if (!isValidCategoryId(id)) {
      return NextResponse.json({error: "INVALID_ID"}, {status: 400});
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

    const guard = await guardCategoryParent({
      parentId: data.parent,
      categoryId: id,
    });
    if (!guard.ok) {
      return NextResponse.json({error: guard.error}, {status: 400});
    }

    const existing = await Category.findOne({
      slug: data.slug,
      _id: {$ne: id},
    }).lean();

    if (existing) {
      return NextResponse.json({error: "SLUG_EXISTS"}, {status: 409});
    }

    let updated;
    try {
      updated = await Category.findByIdAndUpdate(
        id,
        {$set: data},
        {new: true, runValidators: true}
      ).lean();
    } catch (error) {
      if (error?.code === 11000) {
        return NextResponse.json({error: "SLUG_EXISTS"}, {status: 409});
      }
      throw error;
    }

    if (!updated) {
      return NextResponse.json({error: "NOT_FOUND"}, {status: 404});
    }

    revalidateCategoryPaths({slug: updated.slug});

    return NextResponse.json({category: toCategoryView(updated)});
  } catch (error) {
    console.error("admin category update: unexpected error", error);
    return NextResponse.json({error: "INTERNAL_ERROR"}, {status: 500});
  }
}

export async function DELETE(request, {params}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({error: "UNAUTHORIZED"}, {status: 401});
    }

    const {id} = await params;

    if (!isValidCategoryId(id)) {
      return NextResponse.json({error: "INVALID_ID"}, {status: 400});
    }

    await connectDB();

    const category = await Category.findById(id).lean();

    if (!category) {
      return NextResponse.json({error: "NOT_FOUND"}, {status: 404});
    }

    const activeProducts = await Product.countDocuments({
      category: id,
      isActive: true,
    });

    if (activeProducts > 0) {
      return NextResponse.json(
        {error: "HAS_ACTIVE_PRODUCTS", count: activeProducts},
        {status: 400}
      );
    }

    await Category.deleteOne({_id: id});

    revalidateCategoryPaths({slug: category.slug});

    return NextResponse.json({success: true, id});
  } catch (error) {
    console.error("admin category delete: unexpected error", error);
    return NextResponse.json({error: "INTERNAL_ERROR"}, {status: 500});
  }
}