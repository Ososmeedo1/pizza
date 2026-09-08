import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth";
import {imagekit, imagekitConfigured} from "@/lib/imagekit";

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

    const fileId = body?.fileId;

    if (typeof fileId !== "string" || fileId.length === 0) {
      return NextResponse.json({error: "MISSING_FILE_ID"}, {status: 400});
    }

    if (imagekitConfigured && imagekit) {
      try {
        await imagekit.deleteFile(fileId);
      } catch (error) {
        const statusCode = error?.$ResponseMetadata?.statusCode;
        const duplicateMessage =
          typeof error?.message === "string" &&
          /(not found|does not exist|no.*file.*with.*id)/i.test(error.message);

        if (statusCode !== 404 && !duplicateMessage) {
          console.error("imagekit delete failed", error);
          return NextResponse.json({error: "DELETE_FAILED"}, {status: 500});
        }
      }
    }

    return NextResponse.json({success: true});
  } catch (error) {
    console.error("admin image delete: unexpected error", error);
    return NextResponse.json({error: "INTERNAL_ERROR"}, {status: 500});
  }
}