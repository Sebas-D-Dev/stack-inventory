import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch pending posts for the current user
  const pendingPosts = await prisma.post.findMany({
    where: {
      authorId: session.user.id,
      modStatus: "PENDING",
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      modStatus: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(pendingPosts);
}