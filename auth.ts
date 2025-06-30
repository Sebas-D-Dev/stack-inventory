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
      async authorize(credentials, _req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          const newUser = await prisma.user.create({
            data: {
              name: credentials.name ?? credentials.email,
              email: credentials.email,
              password: await bcrypt.hash(credentials.password, 10),
              role: credentials.role ?? "USER",
            },
          });
          
          // Convert null name to string to satisfy NextAuth type requirements
          return {
            id: newUser.id,
            name: newUser.name ?? "", // Ensure name is never null
            email: newUser.email,
            role: newUser.role,
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
          role: user.role,
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
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      return { 
        ...session, 
        user: { 
          ...session.user, 
          id: token.id as string,
          role: token.role as string | undefined
        } 
      };
    },
  },
};