"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function updatePost(
  id: number,
  formData: FormData
) {
  // Authenticate
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("You must be logged in to edit a post");
  }

  // Get current post
  const currentPost = await prisma.post.findUnique({
    where: { id },
  });

  if (!currentPost) {
    throw new Error("Post not found");
  }

  // Check permissions
  const isOwner = session.user.id === currentPost.authorId;
  const isAdmin = session.user.role === 'ADMIN';
  
  if (!isOwner && !isAdmin) {
    throw new Error("Not authorized to edit this post");
  }

  // Get form data
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  // Log the update in post history
  await prisma.postHistory.create({
    data: {
      postId: id,
      title: currentPost.title,
      content: currentPost.content || "",
      action: "UPDATE",
      performedById: session.user.id,
    }
  });

  // Update the post
  await prisma.post.update({
    where: { id },
    data: { title, content },
  });

  redirect(`/posts/${id}`);
}