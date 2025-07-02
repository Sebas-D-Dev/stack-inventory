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

export async function toggleGuidelineStatus(id: string, active: boolean) {
  // Verify the current user is an admin
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized");
  }

  // Update the guideline status
  await prisma.contentGuideline.update({
    where: { id },
    data: { isActive: active },
  });

  // Log the activity
  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      action: active ? "ENABLE_GUIDELINE" : "DISABLE_GUIDELINE",
      entityType: "CONTENT_GUIDELINE",
      entityId: id,
      details: JSON.stringify({
        status: active ? "enabled" : "disabled",
      }),
    },
  });

  revalidatePath("/admin/moderation/guidelines");
}