import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import {z} from "zod";
import {connectDB} from "@/lib/db";
import {Admin} from "@/models/Admin";

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const authOptions = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {label: "Email", type: "email"},
        password: {label: "Password", type: "password"},
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const {email, password} = parsed.data;

        try {
          await connectDB();

          const admin = await Admin.findOne({email})
            .select("+passwordHash")
            .lean();

          if (!admin) {
            return null;
          }

          const passwordMatches = await bcrypt.compare(
            password,
            admin.passwordHash
          );

          if (!passwordMatches) {
            return null;
          }

          return {
            id: String(admin._id),
            email: admin.email,
          };
        } catch (error) {
          console.error("authorize: database error", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({token, user}) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({session, token}) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
};