import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth";
import {connectDB} from "@/lib/db";
import {Product} from "@/models/Product";
import {
  getAdminProductById,
  isValidProductId,
  toAdminProductDetailView,
} from "@/lib/data/adminProducts";
import {productSchema} from "@/lib/validations/product";
import {deriveSizePricing} from "@/lib/productSizes";
import {revalidateProductPaths} from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function GET(request, {params}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({error: "UNAUTHORIZED"}, {status: 401});
    }

    const {id} = await params;

    if (!isValidProductId(id)) {
      return NextResponse.json({error: "INVALID_ID"}, {status: 400});
    }

    const product = await getAdminProductById(id);

    if (!product) {
      return NextResponse.json({error: "NOT_FOUND"}, {status: 404});
    }

    return NextResponse.json({product});
  } catch (error) {
    console.error("admin product GET: unexpected error", error);
    return NextResponse.json({error: "INTERNAL_ERROR"}, {status: 500});
  }
}

export async function PUT(request, {params}) {
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
      return NextResponse.json({error: "INVALID_BODY"}, {status: 400});
    }

    const parsed = productSchema().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({error: "INVALID_BODY"}, {status: 400});
    }

    const data = parsed.data;

    const pricing = deriveSizePricing(data.sizePrices, data.price);
    Object.assign(data, pricing);
    delete data.sizePrices;

    await connectDB();

    const existing = await Product.findOne({
      slug: data.slug,
      _id: {$ne: id},
    }).lean();

    if (existing) {
      return NextResponse.json({error: "SLUG_EXISTS"}, {status: 409});
    }

    const previous = await Product.findById(id).lean();

    if (!previous) {
      return NextResponse.json({error: "NOT_FOUND"}, {status: 404});
    }

    let updated;
    try {
      updated = await Product.findByIdAndUpdate(
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

    revalidateProductPaths({
      oldSlug: previous.slug,
      newSlug: updated.slug,
    });

    return NextResponse.json({product: toAdminProductDetailView(updated)});
  } catch (error) {
    console.error("admin product PUT: unexpected error", error);
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

    if (!isValidProductId(id)) {
      return NextResponse.json({error: "INVALID_ID"}, {status: 400});
    }

    await connectDB();

    const deleted = await Product.findByIdAndDelete(id).lean();

    if (!deleted) {
      return NextResponse.json({error: "NOT_FOUND"}, {status: 404});
    }

    revalidateProductPaths({oldSlug: deleted.slug});

    return NextResponse.json({success: true, id});
  } catch (error) {
    console.error("admin product DELETE: unexpected error", error);
    return NextResponse.json({error: "INTERNAL_ERROR"}, {status: 500});
  }
}