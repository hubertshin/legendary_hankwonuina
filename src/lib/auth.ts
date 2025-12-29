import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        console.log("[Auth] ===== LOGIN ATTEMPT =====");
        console.log("[Auth] Email:", email);
        console.log("[Auth] ADMIN_EMAILS env:", process.env.ADMIN_EMAILS);

        if (!email) {
          console.log("[Auth] ERROR: No email provided");
          return null;
        }

        const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
        console.log("[Auth] Parsed admin emails:", JSON.stringify(adminEmails));
        console.log("[Auth] Email to check:", JSON.stringify(email));
        console.log("[Auth] Includes check:", adminEmails.includes(email));

        if (!adminEmails.includes(email)) {
          console.log("[Auth] ERROR: Email not in admin list");
          console.log("[Auth] Admin list length:", adminEmails.length);
          console.log("[Auth] First admin email:", adminEmails[0]);
          return null;
        }

        try {
          let user = await prisma.user.findUnique({ where: { email } });

          if (!user) {
            console.log("[Auth] Creating user");
            user = await prisma.user.create({
              data: {
                email,
                name: email.split("@")[0],
                role: "ADMIN",
              },
            });
          }

          console.log("[Auth] Success:", user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("[Auth] DB error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});

// Helper to get the current user in server components
export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

// Helper to require authentication
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

// Helper to require admin role
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (user as any).role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}
