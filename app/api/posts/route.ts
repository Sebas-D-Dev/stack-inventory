import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const authorId = url.searchParams.get("authorId");
  const postsPerPage = 5;
  const offset = (page - 1) * postsPerPage;

  // Prepare query filters
  const where = authorId ? { authorId } : {};

  // Fetch paginated posts
  const posts = await prisma.post.findMany({
    where,
    skip: offset,
    take: postsPerPage,
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, id: true } } },
  });

  const totalPosts = await prisma.post.count({ where });
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  return NextResponse.json({ posts, totalPages });
}
