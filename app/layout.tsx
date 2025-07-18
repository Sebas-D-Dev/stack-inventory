import "./globals.css";
import Header from "./Header";
import Footer from "./Footer"
import Providers from "./providers";
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: "Stack Inventory",
  description: "A multifunctional app with an inventory management system, a blog, and a user authentication system.",
  keywords: "Next.js, React, Tailwind CSS, TypeScript, PostgreSQL, Prisma, Inventory Management, Blog, NextAuth"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
