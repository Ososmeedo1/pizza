import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth";
import {connectDB} from "@/lib/db";
import {Category} from "@/models/Category";
import {isValidCategoryId} from "@/lib/data/adminCategories";
import {revalidateCategoryPaths} from "@/lib/revalidate";

export async function PATCH(request, {params}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({error: "UNAUTHORIZED"}, {status: 401});
    }

    const {id} = await params;

    if (!isValidCategoryId(id)) {
      return NextResponse.json({error: "INVALID_ID"}, {status: 400});
    }

    const body = await request.json().catch(() => null);
    const isActive = body?.isActive;

    if (typeof isActive !== "boolean") {
      return NextResponse.json({error: "INVALID_BODY"}, {status: 400});
    }

    await connectDB();

    const updated = await Category.findByIdAndUpdate(
      id,
      {isActive},
      {new: true}
    ).lean();

    if (!updated) {
      return NextResponse.json({error: "NOT_FOUND"}, {status: 404});
    }

    revalidateCategoryPaths({slug: updated.slug});

    return NextResponse.json({
      category: {
        id: String(updated._id),
        name: updated.name,
        slug: updated.slug,
        isActive: updated.isActive,
        sortOrder: updated.sortOrder,
      },
    });
  } catch (error) {
    console.error("admin category activate: unexpected error", error);
    return NextResponse.json({error: "INTERNAL_ERROR"}, {status: 500});
  }
}