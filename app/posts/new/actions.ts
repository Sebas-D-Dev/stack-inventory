"use server";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function createPost(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("You must be logged in to create a post");
  }

  // Check if the user is an admin
  const isAdmin = session.user.isAdmin;

  // Create the post with the appropriate moderation status
  // Admins' posts are automatically approved
  const post = await prisma.post.create({
    data: {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      authorId: session.user.id,
      modStatus: isAdmin ? "APPROVED" : "PENDING",
      published: isAdmin, // Only publish immediately if admin
    },
  });

  // Log post creation in history
  await prisma.postHistory.create({
    data: {
      postId: post.id,
      title: post.title,
      content: post.content || "",
      action: "CREATE",
      performedById: session.user.id,
    }
  });

  // If user is not an admin, create a notification for admins
  if (!isAdmin) {
    // Find all admin users
    const admins = await prisma.admin.findMany({
      select: { userId: true }
    });
    
    // Create notifications for each admin
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.userId,
          message: `New post "${post.title}" requires moderation`,
          type: "POST_PENDING",
          relatedId: post.id.toString(),
        }
      });
    }
    
    // Redirect to a "pending approval" page instead
    redirect("/posts/pending");
  }

  redirect("/posts");
}