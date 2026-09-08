import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {z} from "zod";
import {connectDB} from "@/lib/db";
import {Admin} from "@/models/Admin";

const setupSchema = z
  .object({
    setupToken: z.string().min(16),
    email: z.email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
  });

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);

    const parsed = setupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {error: "VALIDATION_FAILED"},
        {status: 400}
      );
    }

    const {setupToken, email, password} = parsed.data;

    if (
      !process.env.ADMIN_SETUP_TOKEN ||
      setupToken !== process.env.ADMIN_SETUP_TOKEN
    ) {
      return NextResponse.json({error: "INVALID_TOKEN"}, {status: 403});
    }

    await connectDB();

    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      return NextResponse.json({error: "ADMIN_EXISTS"}, {status: 403});
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      email,
      passwordHash,
    });

    return NextResponse.json(
      {
        id: String(admin._id),
        email: admin.email,
      },
      {status: 201}
    );
  } catch (error) {
    console.error("admin setup: unexpected error", error);
    return NextResponse.json(
      {error: "INTERNAL_ERROR"},
      {status: 500}
    );
  }
}