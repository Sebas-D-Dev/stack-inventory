"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface ModerationParams {
  id: string;
  type: "post" | "comment";
  action: "approve" | "reject";
  reason?: string;
}

import { canModerateContent } from "@/lib/permissions";

export async function moderateContent({ id, type, action, reason }: ModerationParams) {
  // Verify the current user can moderate content
  const session = await getServerSession(authOptions);
  if (!session?.user || !canModerateContent(session.user.role || '')) {
    throw new Error("Unauthorized");
  }

  const modStatus = action === "approve" ? "APPROVED" : "REJECTED";
  const now = new Date();

  if (type === "post") {
    // For posts, we need to convert the ID to a number
    const postId = parseInt(id);
    
    // Update post moderation status
    await prisma.post.update({
      where: { id: postId },
      data: {
        modStatus,
        modReason: action === "reject" ? reason : null,
        modReviewedAt: now,
        modReviewedBy: session.user.id,
        // If approved, also mark as published
        published: action === "approve",
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: `POST_${action.toUpperCase()}`,
        entityType: "POST",
        entityId: id,
        details: JSON.stringify({
          status: modStatus,
          reason: reason || null,
        }),
      },
    });

    // If rejected, notify the author
    if (action === "reject") {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true, title: true },
      });

      if (post?.authorId) {
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            message: `Your post "${post.title}" was rejected: ${reason || "No reason provided"}`,
            type: "POST_REJECTED",
            relatedId: id,
          },
        });
      }
    }
  } else {
    // Update comment moderation status
    await prisma.comment.update({
      where: { id },
      data: {
        modStatus,
        modReason: action === "reject" ? reason : null,
        modReviewedAt: now,
        modReviewedBy: session.user.id,
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: `COMMENT_${action.toUpperCase()}`,
        entityType: "COMMENT",
        entityId: id,
        details: JSON.stringify({
          status: modStatus,
          reason: reason || null,
        }),
      },
    });

    // If rejected, notify the author
    if (action === "reject") {
      const comment = await prisma.comment.findUnique({
        where: { id },
        select: { authorId: true, content: true },
      });

      if (comment) {
        await prisma.notification.create({
          data: {
            userId: comment.authorId,
            message: `Your comment was rejected: ${reason || "No reason provided"}`,
            type: "COMMENT_REJECTED",
            relatedId: id,
          },
        });
      }
    }
  }

  revalidatePath("/admin/moderation");
  revalidatePath("/posts");
}