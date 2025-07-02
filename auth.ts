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

        const admin = user ? await prisma.admin.findUnique({ where: { userId: user.id } }) : null;

        if (!user) {
          const newUser = await prisma.user.create({
            data: {
              name: credentials.name ?? credentials.email,
              email: credentials.email,
              password: await bcrypt.hash(credentials.password, 10),
            },
          });
          
          // Convert null name to string to satisfy NextAuth type requirements
          return {
            id: newUser.id,
            name: newUser.name ?? "", // Ensure name is never null
            email: newUser.email,
            role: credentials.role ?? "USER", // Use provided role or default
            isAdmin: false,
          };
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        // Convert null name to string to satisfy NextAuth type requirements
        return {
          id: user.id,
          name: user.name ?? "", // Ensure name is never null
          email: user.email,
          role: admin ? "ADMIN" : "USER", // Determine role based on admin status
          isAdmin: !!admin,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        
        // Check if user is an admin
        const admin = await prisma.admin.findFirst({
          where: { userId: user.id }
        });
        
        token.isAdmin = !!admin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
};