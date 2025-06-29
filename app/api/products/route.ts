import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  // Fetch all products with their related categories and vendors
  const products = await prisma.product.findMany({
    include: {
      category: true,
      vendor: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ products });
}