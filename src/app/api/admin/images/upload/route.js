import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth";
import {imagekit, imagekitConfigured} from "@/lib/imagekit";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({error: "UNAUTHORIZED"}, {status: 401});
    }

    let formData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({error: "INVALID_BODY"}, {status: 400});
    }

    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({error: "NO_FILE"}, {status: 400});
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({error: "INVALID_TYPE"}, {status: 400});
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({error: "FILE_TOO_LARGE"}, {status: 400});
    }

    const rawExt = file.name.split(".").pop()?.toLowerCase();
    const ext = rawExt && /^[a-z0-9]{1,10}$/.test(rawExt) ? rawExt : "image";
    const fileName = `upload-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}.${ext}`;

    if (!imagekitConfigured || !imagekit) {
      return NextResponse.json({
        url: `https://ik.imagekit.io/mock/pizzato/${fileName}`,
        fileId: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      });
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    let result;
    try {
      result = await imagekit.upload({
        file: bytes,
        fileName,
        folder: "/pizzato",
      });
    } catch (error) {
      console.error("imagekit upload failed", error);
      return NextResponse.json({error: "UPLOAD_FAILED"}, {status: 500});
    }

    return NextResponse.json({url: result.url, fileId: result.fileId});
  } catch (error) {
    console.error("admin image upload: unexpected error", error);
    return NextResponse.json({error: "INTERNAL_ERROR"}, {status: 500});
  }
}