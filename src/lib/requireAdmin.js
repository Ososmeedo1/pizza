import {getServerSession} from "next-auth";
import {redirect} from "next/navigation";
import {authOptions} from "@/auth";

export async function requireAdmin(locale) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/${locale}/admin/login`);
  }

  return session;
}