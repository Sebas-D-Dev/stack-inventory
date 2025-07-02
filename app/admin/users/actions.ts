"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { generatePassword } from "@/lib/utils";

// Toggle admin status (grant or revoke admin privileges)
export async function toggleAdminStatus(userId: string, makeAdmin: boolean) {
  // Verify the current user is an admin
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized");
  }

  // Don't allow an admin to remove their own admin status
  if (userId === session.user.id && !makeAdmin) {
    throw new Error("You cannot remove your own admin status");
  }

  if (makeAdmin) {
    // Check if the user already has admin status
    const existingAdmin = await prisma.admin.findUnique({
      where: { userId },
    });

    if (!existingAdmin) {
      // Make the user an admin
      await prisma.admin.create({
        data: { userId },
      });
    }
  } else {
    // Remove admin status
    await prisma.admin.deleteMany({
      where: { userId },
    });
  }

  // Log the action
  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      action: makeAdmin ? "GRANT_ADMIN" : "REVOKE_ADMIN",
      entityType: "USER",
      entityId: userId,
      details: JSON.stringify({ 
        targetUser: userId,
        action: makeAdmin ? "granted admin" : "revoked admin" 
      }),
    },
  });

  revalidatePath("/admin/users");
}

// Toggle user status (enable or disable account)
export async function toggleUserStatus(userId: string, enable: boolean) {
  // Verify the current user is an admin
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized");
  }

  // Don't allow admins to disable their own account
  if (userId === session.user.id) {
    throw new Error("You cannot change your own account status");
  }

  // Update user status
  await prisma.user.update({
    where: { id: userId },
    data: { isDisabled: !enable },
  });

  // Log the action
  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      action: enable ? "ENABLE_USER" : "DISABLE_USER",
      entityType: "USER",
      entityId: userId,
      details: JSON.stringify({
        targetUser: userId,
        action: enable ? "enabled account" : "disabled account"
      }),
    },
  });

  revalidatePath("/admin/users");
}

// Reset user password
export async function resetUserPassword(userId: string) {
  // Verify the current user is an admin
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized");
  }

  // Generate a new random password
  const newPassword = generatePassword(10);
  
  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // Update the user's password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
  
  // Log the action
  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      action: "RESET_PASSWORD",
      entityType: "USER",
      entityId: userId,
      details: JSON.stringify({
        targetUser: userId,
        action: "reset password"
      }),
    },
  });
  
  revalidatePath("/admin/users");
  
  // Return the new password to be displayed to the admin
  return newPassword;
}