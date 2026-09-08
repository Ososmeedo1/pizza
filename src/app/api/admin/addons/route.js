import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth";
import {connectDB} from "@/lib/db";
import {AddOn} from "@/models/AddOn";
import {getAdminAddOns, toAddOnView} from "@/lib/data/adminAddOns";
import {addOnSchema} from "@/lib/validations/addon";
import {revalidateAddOnPaths} from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({error: "UNAUTHORIZED"}, {status: 401});
    }

    const addOns = await getAdminAddOns();

    return NextResponse.json({addons: addOns});
  } catch (error) {
    console.error("admin add-ons GET: unexpected error", error);
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

    const parsed = addOnSchema().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({error: "INVALID_BODY"}, {status: 400});
    }

    const data = parsed.data;

    await connectDB();

    let created;
    try {
      created = await AddOn.create(data);
    } catch (error) {
      console.error("admin add-ons POST: create failed", error);
      return NextResponse.json({error: "INTERNAL_ERROR"}, {status: 500});
    }

    revalidateAddOnPaths();

    return NextResponse.json({addon: toAddOnView(created)}, {status: 201});
  } catch (error) {
    console.error("admin add-ons POST: unexpected error", error);
    return NextResponse.json({error: "INTERNAL_ERROR"}, {status: 500});
  }
}