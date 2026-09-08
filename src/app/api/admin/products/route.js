import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth";
import {connectDB} from "@/lib/db";
import {Product} from "@/models/Product";
import {
  getAdminProducts,
  toAdminProductDetailView,
} from "@/lib/data/adminProducts";
import {productSchema} from "@/lib/validations/product";
import {deriveSizePricing} from "@/lib/productSizes";
import {revalidateProductPaths} from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({error: "UNAUTHORIZED"}, {status: 401});
    }

    const {searchParams} = new URL(request.url);
    const query = {
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      availability: searchParams.get("availability") || undefined,
      page: searchParams.get("page") || undefined,
      pageSize: searchParams.get("pageSize") || undefined,
    };

    const result = await getAdminProducts(
      Object.fromEntries(Object.entries(query).filter(([, value]) => value))
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("admin products GET: unexpected error", error);
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

    const parsed = productSchema().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({error: "INVALID_BODY"}, {status: 400});
    }

    const data = parsed.data;

    const pricing = deriveSizePricing(data.sizePrices, data.price);
    Object.assign(data, pricing);
    delete data.sizePrices;

    await connectDB();

    const existing = await Product.findOne({slug: data.slug}).lean();

    if (existing) {
      return NextResponse.json({error: "SLUG_EXISTS"}, {status: 409});
    }

    let created;
    try {
      created = await Product.create(data);
    } catch (error) {
      if (error?.code === 11000) {
        return NextResponse.json({error: "SLUG_EXISTS"}, {status: 409});
      }
      throw error;
    }

    revalidateProductPaths({newSlug: created.slug});

    return NextResponse.json(
      {product: toAdminProductDetailView(created)},
      {status: 201}
    );
  } catch (error) {
    console.error("admin products POST: unexpected error", error);
    return NextResponse.json({error: "INTERNAL_ERROR"}, {status: 500});
  }
}