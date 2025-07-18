import CredentialsProvider from "next-auth/providers/credentials";
import { type NextAuthOptions } from "next-auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "name" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        
        // Check if user exists and is not disabled
        if (!user || user.isDisabled) {
          throw new Error("Invalid credentials or account disabled");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        // At this point user is guaranteed to exist and be enabled
        // Determine permissions based solely on role
        const userRole = user.role;
        const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

        return {
          id: user.id,
          name: user.name ?? "", // Ensure name is never null
          email: user.email,
          role: userRole, // Use the actual role from the user record
          isAdmin: isAdmin,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        token.role = user.role as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle production URL configuration
      const productionUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || baseUrl;
      
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        return `${productionUrl}${url}`;
      }
      
      // Allows callback URLs on the same origin
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(productionUrl);
        
        if (urlObj.origin === baseUrlObj.origin) {
          return url;
        }
      } catch (e) {
        // If URL parsing fails, return base URL
        console.error("URL parsing error in redirect callback:", e);
      }
      
      return productionUrl;
    },
  },
};