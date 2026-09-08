import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth";
import {connectDB} from "@/lib/db";
import {AddOn} from "@/models/AddOn";
import {
  getAdminAddOnById,
  isValidAddOnId,
  toAddOnView,
} from "@/lib/data/adminAddOns";
import {addOnSchema} from "@/lib/validations/addon";
import {revalidateAddOnPaths} from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function GET(request, {params}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({error: "UNAUTHORIZED"}, {status: 401});
    }

    const {id} = await params;

    if (!isValidAddOnId(id)) {
      return NextResponse.json({error: "INVALID_ID"}, {status: 400});
    }

    const addOn = await getAdminAddOnById(id);

    if (!addOn) {
      return NextResponse.json({error: "NOT_FOUND"}, {status: 404});
    }

    return NextResponse.json({addon: addOn});
  } catch (error) {
    console.error("admin add-on GET: unexpected error", error);
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

    if (!isValidAddOnId(id)) {
      return NextResponse.json({error: "INVALID_ID"}, {status: 400});
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

    let updated;
    try {
      updated = await AddOn.findByIdAndUpdate(
        id,
        {$set: data},
        {new: true, runValidators: true}
      ).lean();
    } catch (error) {
      console.error("admin add-on PUT: update failed", error);
      return NextResponse.json({error: "INTERNAL_ERROR"}, {status: 500});
    }

    if (!updated) {
      return NextResponse.json({error: "NOT_FOUND"}, {status: 404});
    }

    revalidateAddOnPaths();

    return NextResponse.json({addon: toAddOnView(updated)});
  } catch (error) {
    console.error("admin add-on PUT: unexpected error", error);
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

    if (!isValidAddOnId(id)) {
      return NextResponse.json({error: "INVALID_ID"}, {status: 400});
    }

    await connectDB();

    await AddOn.findByIdAndDelete(id);

    // Idempotent: deleting a missing add-on still resolves the catalog.
    revalidateAddOnPaths();

    return NextResponse.json({success: true, id});
  } catch (error) {
    console.error("admin add-on DELETE: unexpected error", error);
    return NextResponse.json({error: "INTERNAL_ERROR"}, {status: 500});
  }
}