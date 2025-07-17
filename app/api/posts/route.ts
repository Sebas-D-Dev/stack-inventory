import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { ModStatus } from "@prisma/client";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const authorId = url.searchParams.get("authorId");
  const showAll = url.searchParams.get("showAll") === "true"; // For admin/moderator view
  const postsPerPage = 5;
  const offset = (page - 1) * postsPerPage;

  // Check if user is admin or moderator
  const isAdminOrModerator = session?.user?.isAdmin || session?.user?.role === "MODERATOR";

  // Prepare query filters
  const where: {
    authorId?: string;
    modStatus?: ModStatus;
    published?: boolean;
  } = {};
  
  if (authorId) {
    where.authorId = authorId;
    // If viewing own posts, show all statuses
    if (session?.user?.id === authorId) {
      // User can see their own posts regardless of status
    } else {
      // Others can only see approved posts from this author
      where.modStatus = ModStatus.APPROVED;
      where.published = true;
    }
  } else {
    // For general post listing
    if (showAll && isAdminOrModerator) {
      // Admin/moderator can see all posts when showAll is true
    } else {
      // Regular users only see approved and published posts
      where.modStatus = ModStatus.APPROVED;
      where.published = true;
    }
  }

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
