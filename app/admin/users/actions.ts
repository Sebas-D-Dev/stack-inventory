"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { generatePassword } from "@/lib/utils";

// Update user role
export async function updateUserRole(userId: string, newRole: string) {
  // Verify the current user has permission
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role || "")) {
    throw new Error("Unauthorized");
  }

  // Don't allow users to change their own role if they're admin/super_admin
  if (userId === session.user.id && ["ADMIN", "SUPER_ADMIN"].includes(session.user.role || "")) {
    throw new Error("You cannot change your own admin role");
  }

  // Validate the new role
  const validRoles = ["USER", "VENDOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"];
  if (!validRoles.includes(newRole)) {
    throw new Error("Invalid role specified");
  }

  // Only SUPER_ADMIN can assign SUPER_ADMIN role
  if (newRole === "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN") {
    throw new Error("Only Super Admins can assign Super Admin role");
  }

  // Update user role
  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole as "USER" | "VENDOR" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN" },
  });

  // Log the action
  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE_USER_ROLE",
      entityType: "USER",
      entityId: userId,
      details: JSON.stringify({ 
        targetUser: userId,
        newRole,
        oldRole: session.user.role
      }),
    },
  });

  revalidatePath("/admin/users");
}

// Update user status (enable or disable account)
export async function updateUserStatus(userId: string, enable: boolean) {
  // Verify the current user has permission
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role || "")) {
    throw new Error("Unauthorized");
  }

  // Don't allow users to disable their own account
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
  // Verify the current user has permission
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role || "")) {
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

// Legacy functions for backward compatibility
export async function toggleAdminStatus(userId: string, makeAdmin: boolean) {
  const newRole = makeAdmin ? "ADMIN" : "USER";
  return updateUserRole(userId, newRole);
}

export async function toggleUserStatus(userId: string, enable: boolean) {
  return updateUserStatus(userId, enable);
}