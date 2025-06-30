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

  // Create the post
  const post = await prisma.post.create({
    data: {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      authorId: session.user.id,
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

  redirect("/posts");
}