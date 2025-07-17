"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface GuidelineData {
  title: string;
  description: string;
}

export async function createGuideline(data: GuidelineData) {
  // Verify the current user is an admin
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized");
  }

  // Create the guideline
  await prisma.contentGuideline.create({
    data: {
      title: data.title,
      description: data.description,
      isActive: true,
    },
  });

  // Log the activity
  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE_GUIDELINE",
      entityType: "CONTENT_GUIDELINE",
      entityId: data.title, // We don't have the ID yet, so use title
      details: JSON.stringify({
        title: data.title,
      }),
    },
  });

  revalidatePath("/admin/moderation/guidelines");
}

export async function updateGuideline(id: string, data: GuidelineData) {
  // Verify the current user is an admin
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized");
  }

  // Update the guideline
  await prisma.contentGuideline.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
    },
  });

  // Log the activity
  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE_GUIDELINE",
      entityType: "CONTENT_GUIDELINE",
      entityId: id,
      details: JSON.stringify({
        title: data.title,
      }),
    },
  });

  revalidatePath("/admin/moderation/guidelines");
}

export async function deleteGuideline(id: string) {
  // Verify the current user is an admin
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized");
  }

  // Get guideline info before deletion for logging
  const guideline = await prisma.contentGuideline.findUnique({
    where: { id },
    select: { title: true },
  });

  if (!guideline) {
    throw new Error("Guideline not found");
  }

  // Delete the guideline
  await prisma.contentGuideline.delete({
    where: { id },
  });

  // Log the activity
  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      action: "DELETE_GUIDELINE",
      entityType: "CONTENT_GUIDELINE",
      entityId: id,
      details: JSON.stringify({
        title: guideline.title,
      }),
    },
  });

  revalidatePath("/admin/moderation/guidelines");
}