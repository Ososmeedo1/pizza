import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth";
import {connectDB} from "@/lib/db";
import {AddOn} from "@/models/AddOn";
import {
  isValidAddOnId,
  toAddOnView,
} from "@/lib/data/adminAddOns";
import {revalidateAddOnPaths} from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function PATCH(request, {params}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({error: "UNAUTHORIZED"}, {status: 401});
    }

    const {id} = await params;

    if (!isValidAddOnId(id)) {
      return NextResponse.json({error: "INVALID_ID"}, {status: 400});
    }

    let body;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    if (typeof body?.isActive !== "boolean") {
      return NextResponse.json({error: "INVALID_BODY"}, {status: 400});
    }

    await connectDB();

    const updated = await AddOn.findByIdAndUpdate(
      id,
      {isActive: body.isActive},
      {new: true}
    ).lean();

    if (!updated) {
      return NextResponse.json({error: "NOT_FOUND"}, {status: 404});
    }

    revalidateAddOnPaths();

    return NextResponse.json({addon: toAddOnView(updated)});
  } catch (error) {
    console.error("admin add-on activate: unexpected error", error);
    return NextResponse.json({error: "INTERNAL_ERROR"}, {status: 500});
  }
}