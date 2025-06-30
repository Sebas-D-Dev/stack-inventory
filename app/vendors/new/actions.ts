"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

export async function createVendor(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("You must be logged in to create a vendor");
  }

  // Get form data
  const name = formData.get("name") as string;
  const website = formData.get("website") as string || null;

  // Create the vendor
  await prisma.vendor.create({
    data: {
      name,
      website,
    },
  });

  // Redirect to vendors page
  redirect("/vendors");
}