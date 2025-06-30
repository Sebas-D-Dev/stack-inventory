"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

type ProfileData = {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

// Define a type for the update data
type UserUpdateData = {
  name?: string;
  email?: string;
  password?: string;
};

export async function updateProfile(data: ProfileData) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return { success: false, message: "You must be logged in" };
    }

    const userId = session.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Prepare the update data with proper typing
    const updateData: UserUpdateData = {};

    // Update name if changed
    if (data.name && data.name !== user.name) {
      updateData.name = data.name;
    }

    // Update email if changed
    if (data.email && data.email !== user.email) {
      // Check if email is already in use
      const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingUser && existingUser.id !== userId) {
        return { success: false, message: "Email is already in use" };
      }
      updateData.email = data.email;
    }

    // Update password if provided
    if (data.newPassword && data.currentPassword) {
      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        data.currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        return { success: false, message: "Current password is incorrect" };
      }

      // Hash new password
      updateData.password = await bcrypt.hash(data.newPassword, 10);
    }

    // Only update if there are changes
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateData
      });
      return { success: true, message: "Profile updated successfully" };
    }

    return { success: true, message: "No changes to apply" };
  } catch (error) {
    console.error("Profile update error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An error occurred while updating profile" 
    };
  }
}