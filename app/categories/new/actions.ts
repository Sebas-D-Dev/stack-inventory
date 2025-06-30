"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

export async function createCategory(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("You must be logged in to create a category");
  }

  // Get form data
  const name = formData.get("name") as string;

  // Create the category
  await prisma.category.create({
    data: {
      name,
    },
  });

  // Redirect to categories page
  redirect("/categories");
}