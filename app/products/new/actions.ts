"use server";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function createProduct(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("You must be logged in to create a product");
  }

  // Get form data
  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const price = parseFloat(formData.get("price") as string);
  const reorderThreshold = parseInt(formData.get("reorderThreshold") as string);
  const categoryId = formData.get("categoryId") as string;
  const vendorId = formData.get("vendorId") as string;

  // Create the product
  await prisma.product.create({
    data: {
      name,
      sku,
      quantity,
      price,
      reorderThreshold,
      categoryId,
      vendorId,
      userId: session.user.id,
    },
  });

  // Redirect to products page
  redirect("/products");
}