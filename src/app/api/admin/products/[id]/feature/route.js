import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth";
import {connectDB} from "@/lib/db";
import {Product} from "@/models/Product";
import {
  isValidProductId,
  toAdminProductView,
} from "@/lib/data/adminProducts";
import {revalidateProductPaths} from "@/lib/revalidate";

export async function PATCH(request, {params}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({error: "UNAUTHORIZED"}, {status: 401});
    }

    const {id} = await params;

    if (!isValidProductId(id)) {
      return NextResponse.json({error: "INVALID_ID"}, {status: 400});
    }

    let body;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    if (typeof body?.isFeatured !== "boolean") {
      return NextResponse.json({error: "INVALID_BODY"}, {status: 400});
    }

    await connectDB();

    const updated = await Product.findByIdAndUpdate(
      id,
      {isFeatured: body.isFeatured},
      {new: true}
    ).lean();

    if (!updated) {
      return NextResponse.json({error: "NOT_FOUND"}, {status: 404});
    }

    revalidateProductPaths({oldSlug: updated.slug, newSlug: updated.slug});

    return NextResponse.json({product: toAdminProductView(updated)});
  } catch (error) {
    console.error("admin product feature: unexpected error", error);
    return NextResponse.json({error: "INTERNAL_ERROR"}, {status: 500});
  }
}