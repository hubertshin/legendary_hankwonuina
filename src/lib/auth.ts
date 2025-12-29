import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    // Admin login with email
    Credentials({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        try {
          const email = credentials?.email as string;
          console.log("[Auth] Login attempt with email:", email);

          if (!email) {
            console.log("[Auth] No email provided");
            throw new Error("이메일을 입력해주세요");
          }

          // Check if email is in admin whitelist - ONLY admins can login
          const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
          console.log("[Auth] Admin emails:", adminEmails);
          console.log("[Auth] Email check:", email, "in", adminEmails, "=", adminEmails.includes(email));

          if (!adminEmails.includes(email)) {
            // Not an admin email - reject login
            console.log("[Auth] Email not in admin list - rejecting");
            throw new Error("관리자 권한이 없습니다");
          }

          // Find or create admin user
          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            // Create new admin user
            console.log("[Auth] Creating new admin user");
            user = await prisma.user.create({
              data: {
                email,
                name: email.split("@")[0],
                role: "ADMIN",
              },
            });
          }

          console.log("[Auth] Login successful for:", user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("[Auth] Error during authorization:", error);
          throw error;
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-request",
    error: "/auth/error",
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
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      // Default redirect to home page instead of dashboard
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
