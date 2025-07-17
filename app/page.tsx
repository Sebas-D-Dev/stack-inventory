export const dynamic = "force-dynamic"; // This disables SSG and ISR

import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { checkPostTableExists } from "@/lib/db-utils";

export default async function Home() {
  // Check if the post table exists
  const tableExists = await checkPostTableExists();

  // If the post table doesn't exist, redirect to setup page
  if (!tableExists) {
    redirect("/setup");
  }

  const posts = await prisma.post.findMany({
    where: {
      modStatus: "APPROVED",
      published: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{
        paddingTop: `var(--spacing-3xl)`,
        paddingBottom: `var(--spacing-3xl)`,
        paddingLeft: `var(--spacing-xl)`,
        paddingRight: `var(--spacing-xl)`,
      }}
    >
      <h1
        className="text-responsive-5xl font-extrabold themed-span-primary"
        style={{ marginBottom: `var(--spacing-2xl)` }}
      >
        Recent Posts
      </h1>
      <div
        className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl"
        style={{
          marginBottom: `var(--spacing-xl)`,
          gap: `var(--spacing-xl)`,
        }}
      >
        {posts.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`} className="group">
            <div
              className="border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              style={{
                padding: `var(--spacing-lg)`,
                borderRadius: `var(--radius-lg)`,
                borderColor: "var(--card-border)",
                backgroundColor: "var(--card-background)",
              }}
            >
              <h2
                className="font-semibold group-hover:underline themed-span-primary"
                style={{
                  fontSize: `var(--font-2xl)`,
                  marginBottom: `var(--spacing-sm)`,
                }}
              >
                {post.title}
              </h2>
              <p
                className="themed-span-secondary"
                style={{ fontSize: `var(--font-sm)` }}
              >
                by {post.author ? post.author.name : "Anonymous"}
              </p>
              <p
                className="themed-span-muted"
                style={{
                  fontSize: `var(--font-xs)`,
                  marginBottom: `var(--spacing-md)`,
                }}
              >
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <div className="relative">
                <p
                  className="leading-relaxed line-clamp-2 themed-span-primary"
                  style={{ fontSize: `var(--font-base)` }}
                >
                  {post.content || "No content available."}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
